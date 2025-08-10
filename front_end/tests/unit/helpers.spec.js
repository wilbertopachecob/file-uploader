import { vi } from "vitest";
import {
  bytesToSize,
  isImage,
  isVideo,
  generateVideoThumbnail,
} from "@/helpers";

describe("helpers.js", () => {
  describe("bytesToSize", () => {
    it("should convert bytes correctly", () => {
      expect(bytesToSize(0)).toBe("0 Bytes");
      expect(bytesToSize(1023)).toBe("1023 Bytes");
      expect(bytesToSize(1024)).toBe("1 KB");
      expect(bytesToSize(1536)).toBe("1.5 KB");
      expect(bytesToSize(1024 * 1024)).toBe("1 MB");
      expect(bytesToSize(1024 * 1024 * 1024)).toBe("1 GB");
      expect(bytesToSize(1024 * 1024 * 1024 * 1024)).toBe("1 TB");
    });

    it("should handle edge cases", () => {
      expect(bytesToSize(null)).toBe("0 Bytes");
      expect(bytesToSize(undefined)).toBe("0 Bytes");
      expect(bytesToSize(-1)).toBe("0 Bytes");
    });

    it("should round appropriately", () => {
      expect(bytesToSize(1536)).toBe("1.5 KB"); // 1.5 KB exactly
      expect(bytesToSize(1555)).toBe("1.5 KB"); // 1.519... KB rounds to 1.5
      expect(bytesToSize(1580)).toBe("1.5 KB"); // 1.543... KB rounds to 1.5
      expect(bytesToSize(1600)).toBe("1.6 KB"); // 1.5625 KB rounds to 1.6
    });
  });

  describe("isImage", () => {
    it("should correctly identify image files", () => {
      expect(isImage({ type: "image/jpeg" })).toBe(true);
      expect(isImage({ type: "image/png" })).toBe(true);
      expect(isImage({ type: "image/gif" })).toBe(true);
      expect(isImage({ type: "image/webp" })).toBe(true);
    });

    it("should correctly identify non-image files", () => {
      expect(isImage({ type: "video/mp4" })).toBe(false);
      expect(isImage({ type: "text/plain" })).toBe(false);
      expect(isImage({ type: "application/pdf" })).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isImage({})).toBe(false);
      expect(isImage({ type: null })).toBe(false);
      expect(isImage({ type: "" })).toBe(false);
      expect(isImage(null)).toBe(false);
    });

    it("should handle files with image in the type string", () => {
      expect(isImage({ type: "custom/image-format" })).toBe(true);
    });
  });

  describe("isVideo", () => {
    it("should correctly identify video files", () => {
      expect(isVideo({ type: "video/mp4" })).toBe(true);
      expect(isVideo({ type: "video/webm" })).toBe(true);
      expect(isVideo({ type: "video/ogg" })).toBe(true);
      expect(isVideo({ type: "video/avi" })).toBe(true);
    });

    it("should correctly identify non-video files", () => {
      expect(isVideo({ type: "image/jpeg" })).toBe(false);
      expect(isVideo({ type: "text/plain" })).toBe(false);
      expect(isVideo({ type: "application/pdf" })).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isVideo({})).toBe(false);
      expect(isVideo({ type: null })).toBe(false);
      expect(isVideo({ type: "" })).toBe(false);
      expect(isVideo(null)).toBe(false);
    });

    it("should handle files with video in the type string", () => {
      expect(isVideo({ type: "custom/video-format" })).toBe(true);
    });
  });

  describe("generateVideoThumbnail", () => {
    let mockVideo;
    let mockCanvas;
    let mockContext;
    let originalCreateElement;
    let originalSetTimeout;
    let originalClearTimeout;

    beforeEach(() => {
      // Reset all mocks
      vi.clearAllMocks();

      // Mock canvas context
      mockContext = {
        drawImage: vi.fn(),
      };

      // Mock canvas
      mockCanvas = {
        getContext: vi.fn(() => mockContext),
        toDataURL: vi.fn(() => "data:image/jpeg;base64,mockThumbnailData"),
        width: 0,
        height: 0,
      };

      // Mock video element
      mockVideo = {
        crossOrigin: "",
        muted: false,
        preload: "",
        duration: 10,
        currentTime: 0,
        videoWidth: 1920,
        videoHeight: 1080,
        src: "",
        remove: vi.fn(),
        onloadedmetadata: null,
        onseeked: null,
        onerror: null,
      };

      // Mock document.createElement
      originalCreateElement = global.document?.createElement;
      global.document = global.document || {};
      global.document.createElement = vi.fn((tagName) => {
        if (tagName === "canvas") {
          return mockCanvas;
        }
        if (tagName === "video") {
          return mockVideo;
        }
        return {};
      });

      // Mock setTimeout and clearTimeout
      originalSetTimeout = global.setTimeout;
      originalClearTimeout = global.clearTimeout;
      global.setTimeout = vi.fn(() => 123);
      global.clearTimeout = vi.fn();
    });

    afterEach(() => {
      // Restore original functions
      if (originalCreateElement) {
        global.document.createElement = originalCreateElement;
      }
      global.setTimeout = originalSetTimeout;
      global.clearTimeout = originalClearTimeout;
    });

    it("should generate thumbnail successfully", async () => {
      const promise = generateVideoThumbnail("test-video.mp4");

      // Simulate video loading
      mockVideo.onloadedmetadata();
      expect(mockVideo.currentTime).toBe(1); // 10% of 10 seconds = 1 second

      // Simulate seeking complete
      mockVideo.onseeked();

      const result = await promise;
      expect(result).toBe("data:image/jpeg;base64,mockThumbnailData");
      expect(mockVideo.remove).toHaveBeenCalled();
    });

    it("should respect custom options", async () => {
      const options = {
        seekPercentage: 0.2,
        maxSeekTime: 5,
        thumbnailWidth: 400,
        jpegQuality: 0.9,
      };

      const promise = generateVideoThumbnail("test-video.mp4", options);

      // Simulate video loading
      mockVideo.onloadedmetadata();
      expect(mockVideo.currentTime).toBe(2); // 20% of 10 seconds = 2 seconds

      // Simulate seeking complete
      mockVideo.onseeked();

      await promise;
      expect(mockCanvas.width).toBe(400);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.9);
    });

    it("should handle video loading errors", async () => {
      const promise = generateVideoThumbnail("invalid-video.mp4");

      // Simulate video loading error
      mockVideo.onerror({ message: "Failed to load" });

      await expect(promise).rejects.toThrow("Failed to load video");
      expect(mockVideo.remove).toHaveBeenCalled();
    });

    it("should handle canvas context errors", async () => {
      // Mock canvas.getContext to return null
      mockCanvas.getContext.mockReturnValue(null);

      const promise = generateVideoThumbnail("test-video.mp4");

      // Simulate video loading and seeking
      mockVideo.onloadedmetadata();
      mockVideo.onseeked();

      await expect(promise).rejects.toThrow("Failed to get canvas context");
      expect(mockVideo.remove).toHaveBeenCalled();
    });

    it("should calculate aspect ratio correctly", async () => {
      mockVideo.videoWidth = 1920;
      mockVideo.videoHeight = 1080;

      const promise = generateVideoThumbnail("test-video.mp4", {
        thumbnailWidth: 300,
      });

      // Simulate video loading and seeking
      mockVideo.onloadedmetadata();
      mockVideo.onseeked();

      await promise;

      // Aspect ratio: 1920/1080 = 1.777...
      // Height should be 300 / 1.777... ≈ 168.75
      expect(mockCanvas.width).toBe(300);
      expect(mockCanvas.height).toBeCloseTo(168.75, 1);
    });
  });
});
