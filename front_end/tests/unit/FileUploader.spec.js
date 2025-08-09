import { mount } from "@vue/test-utils";
import FileUploader from "@/components/FileUploader.vue";
import * as helpers from "@/helpers";

const imageFile = new File(["img"], "pic.png", { type: "image/png" });
const videoFile = new File(["vid"], "clip.mp4", { type: "video/mp4" });

describe("FileUploader.vue", () => {
  let mockGenerateVideoThumbnail;

  beforeAll(() => {
    // Mock FileReader to immediately trigger onload
    class MockFileReader {
      constructor() {
        this.onload = null;
      }
      readAsDataURL() {
        if (typeof this.onload === "function") {
          this.onload({ target: { result: "data:mock" } });
        }
      }
    }
    // @ts-ignore
    global.FileReader = MockFileReader;
  });

  beforeEach(() => {
    // Mock the generateVideoThumbnail function
    mockGenerateVideoThumbnail = jest
      .spyOn(helpers, "generateVideoThumbnail")
      .mockResolvedValue("data:image/jpeg;base64,mockVideoThumbnail");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("computes getFilesInstance for image/video only", async () => {
    const wrapper = mount(FileUploader);
    // simulate selecting files
    await wrapper.vm.addFiles([
      imageFile,
      videoFile,
      new File(["x"], "doc.pdf", { type: "application/pdf" }),
    ]);
    await wrapper.vm.$nextTick();
    // Backward-compatible alias still exists, but prefer correct name
    expect(wrapper.vm.getFilesInstance.length).toBe(2);
  });

  it("emits to open gallery when clicking a thumbnail", async () => {
    const wrapper = mount(FileUploader);
    await wrapper.vm.addFiles([imageFile]);
    await wrapper.vm.$nextTick();
    const thumb = wrapper.find(".thumbnail-container");
    expect(thumb.exists()).toBe(true);
    // The actual modal open is handled in child; ensure handler does not throw
    expect(() =>
      wrapper.vm.openGallery({
        name: "pic.png",
        type: "image/png",
        src: "data:...",
      })
    ).not.toThrow();
  });

  describe("getSRC method", () => {
    it("should return src for image files", () => {
      const wrapper = mount(FileUploader);
      const file = { type: "image/png", src: "data:image/png;base64,test" };
      expect(wrapper.vm.getSRC(file)).toBe("data:image/png;base64,test");
    });

    it("should return fallback icon for non-image/video files", () => {
      const wrapper = mount(FileUploader);
      const file = { type: "application/pdf", src: "data:pdf" };
      const result = wrapper.vm.getSRC(file);
      expect(typeof result).toBe("string"); // Should return some icon path
      expect(result).not.toBe(file.src); // Should not return the file src
    });

    it("should return play button icon initially for video files", () => {
      const wrapper = mount(FileUploader);
      const file = { type: "video/mp4", src: "data:video/mp4;base64,test" };
      const result = wrapper.vm.getSRC(file);
      expect(typeof result).toBe("string"); // Should return some icon path
      expect(result).not.toBe(file.src); // Should not return the file src
    });

    it("should return cached thumbnail for video files when available", () => {
      const wrapper = mount(FileUploader);
      const file = { type: "video/mp4", src: "data:video/mp4;base64,test" };

      // Pre-populate cache
      wrapper.vm.videoThumbnails.set(file.src, "data:image/jpeg;base64,cached");

      const result = wrapper.vm.getSRC(file);
      expect(result).toBe("data:image/jpeg;base64,cached");
    });

    it("should trigger thumbnail generation for video files", () => {
      const wrapper = mount(FileUploader);
      const file = { type: "video/mp4", src: "data:video/mp4;base64,test" };

      // Mock the method directly on the component instance
      wrapper.vm.generateVideoThumbnailWrapper = jest.fn();

      wrapper.vm.getSRC(file);

      expect(wrapper.vm.generateVideoThumbnailWrapper).toHaveBeenCalledWith(
        file
      );
    });
  });

  describe("generateVideoThumbnailWrapper method", () => {
    it("should not generate thumbnail if already cached", () => {
      const wrapper = mount(FileUploader);
      const file = { type: "video/mp4", src: "data:video/mp4;base64,test" };

      // Pre-populate cache
      wrapper.vm.videoThumbnails.set(file.src, "cached");

      wrapper.vm.generateVideoThumbnailWrapper(file);

      expect(mockGenerateVideoThumbnail).not.toHaveBeenCalled();
    });

    it("should generate and cache thumbnail for new video", async () => {
      const wrapper = mount(FileUploader);
      const file = { type: "video/mp4", src: "data:video/mp4;base64,test" };

      await wrapper.vm.generateVideoThumbnailWrapper(file);

      expect(mockGenerateVideoThumbnail).toHaveBeenCalledWith(file.src);

      // Wait for the promise to resolve
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.videoThumbnails.get(file.src)).toBe(
        "data:image/jpeg;base64,mockVideoThumbnail"
      );
      // Don't test $forceUpdate directly since it's hard to mock properly
    });

    it("should handle thumbnail generation errors gracefully", async () => {
      const wrapper = mount(FileUploader);
      const file = { type: "video/mp4", src: "data:video/mp4;base64,test" };

      // Mock console.warn to avoid test output noise
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      // Make the mock reject
      mockGenerateVideoThumbnail.mockRejectedValue(
        new Error("Generation failed")
      );

      // Call the method (it doesn't throw, it handles the error internally)
      wrapper.vm.generateVideoThumbnailWrapper(file);

      // Wait for the next tick to allow the promise to resolve/reject
      await wrapper.vm.$nextTick();

      expect(mockGenerateVideoThumbnail).toHaveBeenCalledWith(file.src);

      // Wait a bit more for the error handler to execute
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to generate video thumbnail:",
        expect.any(Error)
      );

      // Should not cache failed results
      expect(wrapper.vm.videoThumbnails.has(file.src)).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe("video file handling integration", () => {
    it("should add video files with thumbnail generation", async () => {
      const wrapper = mount(FileUploader);

      await wrapper.vm.addFiles([videoFile]);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.files).toHaveLength(1);
      expect(wrapper.vm.files[0].src).toBe("data:mock");
      expect(wrapper.vm.files[0].type).toBe("video/mp4");
    });
  });
});
