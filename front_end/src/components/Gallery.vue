<template>
  <!-- Button trigger modal -->
  <button
    type="button"
    ref="openModal"
    class="btn btn-primary"
    style="display: none"
    data-bs-toggle="modal"
    data-bs-target="#galleryModal"
  >
    Open
  </button>

  <!-- Modal -->
  <div
    ref="modal"
    class="modal fade"
    id="galleryModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="galleryModalTitle"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLongTitle">Files Gallery</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="closeModal"
          ></button>
        </div>
        <div class="modal-body">
          <div
            class="alert alert-danger alert-dismissible fade show"
            role="alert"
            v-if="errors.length"
          >
            <ul>
              <li v-for="(error, idk) in errors" :key="idk">
                {{ error.message }}
              </li>
            </ul>
            <button
              type="button"
              class="close"
              data-dismiss="alert"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="gallery-container">
            <div class="left-btn" @click="slide('left')">
              <i class="fas fa-chevron-circle-left"></i>
            </div>
            <div class="gallery-body w-100 h-100">
              <template v-if="isImage(currentFile)">
                <img :src="currentFile.src" :alt="currentFile.name" />
              </template>
              <template v-for="(video, index) in videos" :key="index">
                <video
                  :ref="`videoPlayer_${video.name}`"
                  v-show="currentFile.name === video.name"
                  :id="`videoPlayer_${video.name}`"
                  class="video-js vjs-default-skin vjs-big-play-centered"
                  style="width: 100%; height: 100%"
                ></video>
              </template>
            </div>
            <div class="right-btn" @click="slide('right')">
              <i class="fas fa-chevron-circle-right"></i>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-danger"
            data-dismiss="modal"
            @click="closeModal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "video.js/dist/video-js.css";
import videojs from "video.js";
import { isVideo, isImage } from "../helpers";
export default {
  props: {
    files: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      errors: [],
      show: false,
      currentFile: {},
      index: 0,
      videos: [],
      player: null,
      videoOptions: {
        autoplay: false,
        controls: true,
        sources: [
          {
            src: require("@/assets/video/sample-mp4-file.mp4"),
            type: "video/mp4",
          },
        ],
      },
    };
  },
  watch: {
    currentFile(current) {
      if (this.isVideo(current)) {
        this.loadPlayer();
      }
    },
    files(current) {
      this.videos = current.filter((f) => this.isVideo(f));
    },
  },
  mounted() {
    document
      .querySelector("#galleryModal")
      .addEventListener("hidden.bs.modal", () => {
        if (this.player) {
          this.player.pause();
          this.player = null;
        }
      });
  },
  methods: {
    isVideo,
    isImage,
    openModal(name = null) {
      this.$refs.openModal.click();
      const index = this.files.findIndex((f) => f.name === name);
      this.index = index || 0;
      this.currentFile = this.files[this.index];
      console.log(this.currentFile);
      if (this.isVideo(this.currentFile)) {
        this.loadPlayer();
      }
    },
    loadPlayer() {
      this.$nextTick(() => {
        this.videoOptions.sources[0] = {
          src: this.currentFile.src,
          type: this.currentFile.type,
        };
        try {
          console.log(videojs.getPlayers());
          document.querySelector(".gallery-body").children.forEach((el) => {
            if (el.id === `videoPlayer_${this.currentFile.name}`) {
              el.style.display = "block";
            }
          });
          this.player = Object.keys(videojs.getPlayers()).includes(
            `videoPlayer_${this.currentFile.name}`
          )
            ? videojs.getPlayers()[`videoPlayer_${this.currentFile.name}`]
            : videojs(
                this.$refs[`videoPlayer_${this.currentFile.name}`],
                this.videoOptions,
                function onPlayerReady() {
                  console.log("onPlayerReady", this);
                }
              );
        } catch (error) {
          console.log({ error });
          this.errors.push(error.message);
        }
      });
    },
    slide(direction) {
      if (direction === "right") {
        if (this.index < this.files.length - 1) {
          this.index++;
        } else if (this.index === this.files.length - 1) {
          this.index = 0;
        }
      } else if (direction === "left") {
        if (this.index > 0) {
          this.index--;
        } else if (this.index === 0) {
          this.index = this.files.length - 1;
        }
      }
      this.closePlayer();
      this.currentFile = this.files[this.index];
      if (this.isVideo(this.currentFile)) {
        this.loadPlayer();
      }
    },
    closeModal() {
      this.closePlayer();
    },
    closePlayer() {
      if (this.player) {
        //this.player.dispose();
        this.player.pause();
        this.player = null;
        document.querySelector(".gallery-body").children.forEach((el) => {
          if (el.classList.contains("video-js")) {
            el.style.display = "none";
          }
        });
      }
    },
  },
  beforeUnmount() {
    for (const player of videojs.getPlayers()) {
      player.dispose();
    }
  },
};
</script>

<style>
.gallery-container {
  display: flex;
  justify-content: space-between;
  height: 700px;
}
.gallery-body {
  justify-self: center;
  max-height: 100%;
}
.gallery-body img {
  max-height: 100%;
  max-width: 100%;
}
.left-btn {
  align-self: flex-start;
}
.right-btn {
  align-self: flex-end;
}
.left-btn,
.right-btn {
  display: flex;
  align-items: center;
  padding: 0px 10px;
  height: 100%;
  width: 50px;
  background-color: black;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
