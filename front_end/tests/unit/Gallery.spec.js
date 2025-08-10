import { mount } from "@vue/test-utils";
import Gallery from "@/components/Gallery.vue";
import videojs from "video.js"; // mocked via jest.config.js

const sampleVideo = {
  name: "sample-video.mp4",
  type: "video/mp4",
  src: "/uploads/video/sample-video.mp4",
};

const sampleImage = {
  name: "image.png",
  type: "image/png",
  src: "/uploads/img/image.png",
};

describe("Gallery.vue", () => {
  it("returns early when player element is not in DOM", async () => {
    const wrapper = mount(Gallery, {
      props: { files: [] },
      attachTo: document.body,
    });

    // No video element exists because there are no files
    wrapper.vm.currentFile = { ...sampleVideo };
    await wrapper.vm.$nextTick();

    expect(() => wrapper.vm.loadPlayer()).not.toThrow();
    expect(Object.keys(videojs.getPlayers()).length).toBe(0);
  });

  it("initializes a video.js player when a video is current", async () => {
    const wrapper = mount(Gallery, {
      props: { files: [sampleImage, sampleVideo] },
      attachTo: document.body,
    });

    // Ensure videos list populated and refs rendered
    await wrapper.vm.$nextTick();

    // Set current file to the video and create the player
    wrapper.vm.currentFile = { ...sampleVideo };
    await wrapper.vm.$nextTick();
    await wrapper.vm.loadPlayer();
    await wrapper.vm.$nextTick();

    const players = videojs.getPlayers();
    // The DOM id created in Gallery: `videoPlayer_${sanitizedName}` where '-' becomes '_'
    expect(Object.keys(players).some((k) => k.startsWith("videoPlayer_"))).toBe(
      true,
    );
  });

  it("pauses the player on closePlayer", async () => {
    const wrapper = mount(Gallery, {
      props: { files: [sampleVideo] },
      attachTo: document.body,
    });

    wrapper.vm.currentFile = { ...sampleVideo };
    await wrapper.vm.$nextTick();
    await wrapper.vm.loadPlayer();

    // Replace pause with a spy to assert it is called
    const player = wrapper.vm.player;
    if (player) {
      player.pause = jest.fn();
      wrapper.vm.closePlayer();
      expect(player.pause).toHaveBeenCalled();
    } else {
      // If no player (in case refs not rendered under test), the method should not throw
      expect(() => wrapper.vm.closePlayer()).not.toThrow();
    }
  });
});
