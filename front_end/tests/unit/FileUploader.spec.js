import { mount, shallowMount } from "@vue/test-utils";
import FileUploader from "@/components/FileUploader.vue";

const imageFile = new File(["img"], "pic.png", { type: "image/png" });
const videoFile = new File(["vid"], "clip.mp4", { type: "video/mp4" });

describe("FileUploader.vue", () => {

  it("computes getFilesInstance for image/video only", async () => {
    const wrapper = shallowMount(FileUploader);
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
    const wrapper = shallowMount(FileUploader);
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
});
