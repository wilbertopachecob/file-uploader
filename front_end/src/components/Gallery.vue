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
                {{
                  typeof error === "string"
                    ? error
                    : (error && error.message) || String(error)
                }}
              </li>
            </ul>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>
          <div class="gallery-container">
            <div class="left-btn" @click="slide('left')">
              <i class="fas fa-chevron-circle-left"></i>
            </div>
            <div class="gallery-body w-100 h-100">
              <img
                v-if="isImage(currentFile)"
                :src="currentFile.src"
                :alt="getFileName(currentFile)"
              />

              <template v-for="(video, index) in videos" :key="index">
                <video
                  :ref="`videoPlayer_${getPlayerId(video, index)}`"
                  v-show="
                    getPlayerId(currentFile) === getPlayerId(video, index)
                  "
                  :id="`videoPlayer_${getPlayerId(video, index)}`"
                  class="video-js vjs-default-skin vjs-big-play-centered"
                  style="width: 100%; height: 100%"
                ></video>
              </template>
            </div>
            <div class="right-btn" @click="slide('right')">
              <i class="fas fa-chevron-circle-right"></i>
            </div>
          </div>
          <div class="thumbnails">
            <div
              class="thumbnail-container mx-1"
              v-for="(file, idk) of files"
              :key="idk"
              @click="setCurrent(idk)"
              style="cursor: pointer"
            >
              <img
                :src="
                  isVideo(file)
                    ? require('@/assets/img/play-button-icon.png')
                    : file.src
                "
                :alt="getFileName(file)"
                :style="{ opacity: index === idk ? 1 : 0.6 }"
              />
            </div>
          </div>
        </div>
        <!-- <div class="modal-footer">
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal">
            Close
          </button>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
// video.js is heavy; import CSS once and reuse player instances where possible
import "video.js/dist/video-js.css";
import videojs from "video.js";
import { isVideo, isImage } from "@/helpers";
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
        sources: [],
      },
    };
  },
  watch: {
    currentFile(current) {
      if (this.isVideo(current)) {
        this.loadPlayer();
      }
    },
    files: {
      immediate: true,
      handler(current) {
        this.videos = (current || []).filter((f) => this.isVideo(f));
      },
    },
  },
  mounted() {
    const modal = document.querySelector("#galleryModal");
    if (modal) {
      modal.addEventListener("hidden.bs.modal", this.closePlayer);
    }
  },
  methods: {
    isVideo,
    isImage,
    getFileName(file) {
      if (!file) return "";
      if (file.name && typeof file.name === "string") return file.name;
      if (file.src && typeof file.src === "string") {
        try {
          const parts = file.src.split("/");
          const last = parts[parts.length - 1] || "";
          return last.split("?")[0];
        } catch (e) {
          return "";
        }
      }
      return "";
    },
    getPlayerId(file, index = 0) {
      const name = this.getFileName(file);
      const raw = name || String(index);
      // Sanitize for safe use in HTML id attributes and ref keys
      return raw.replace(/[^A-Za-z0-9_-]/g, "_");
    },
    openModal(name = null) {
      this.errors = [];
      this.$refs.openModal.click();
      const index = this.files.findIndex(
        (f) => f.name === name || this.getFileName(f) === name
      );
      this.index = index >= 0 ? index : 0;
      this.currentFile = this.files[this.index];
      if (this.isVideo(this.currentFile)) {
        this.loadPlayer();
      }
    },
    setCurrent(i) {
      this.closePlayer();
      this.index = i;
      this.currentFile = this.files[i];
    },
    loadPlayer() {
      this.$nextTick(() => {
        this.videoOptions.sources[0] = {
          src: this.currentFile.src,
          type: this.currentFile.type,
        };
        try {
          // Compute the sanitized id used in the template refs
          const derivedName = this.getFileName(this.currentFile);
          let idSuffix = this.getPlayerId(this.currentFile);
          if (!derivedName) {
            const vIdx = this.videos.findIndex(
              (v) => v === this.currentFile || v.src === this.currentFile.src
            );
            idSuffix = this.getPlayerId(this.currentFile, vIdx >= 0 ? vIdx : 0);
          }
          const playerRefKey = `videoPlayer_${idSuffix}`;
          let playerEl = this.$refs[playerRefKey];
          // When a ref is used inside v-for, Vue may return an array of elements
          if (Array.isArray(playerEl)) {
            playerEl = playerEl[0];
          }
          if (
            !playerEl ||
            !playerEl.tagName ||
            playerEl.tagName.toUpperCase() !== "VIDEO"
          ) {
            // Element not yet in DOM or not a video element; bail out silently to avoid video.js error
            console.warn("[Gallery.loadPlayer] player element not ready", {
              playerRefKey,
              playerElExists: Boolean(playerEl),
              tagName: playerEl && playerEl.tagName,
              availableRefs: Object.keys(this.$refs || {}),
            });
            return;
          }

          Array.from(document.querySelector(".gallery-body").children).forEach(
            (el) => {
              if (el.id === `videoPlayer_${idSuffix}`) {
                el.style.display = "block";
              }
            }
          );
          const existingPlayers = videojs.getPlayers();
          const playerKey = `videoPlayer_${idSuffix}`;
          this.player =
            playerKey in existingPlayers
              ? existingPlayers[playerKey]
              : videojs(playerEl, this.videoOptions);
        } catch (error) {
          console.error({ error });
          this.errors.push(error);
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
        this.player.pause();
        this.player = null;
        Array.from(document.querySelector(".gallery-body").children).forEach(
          (el) => {
            if (el.classList.contains("video-js")) {
              el.style.display = "none";
            }
          }
        );
      }
    },
  },
  beforeUnmount() {
    try {
      const players = videojs.getPlayers();
      Object.values(players).forEach((player) => player.dispose());
    } catch (e) {
      // ignore dispose errors in teardown
    }
  },
};
</script>

<style scoped>
.gallery-container {
  display: flex;
  justify-content: space-between;
  height: 400px;
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

.thumbnails {
  overflow-x: scroll;
  font-size: 0.9rem;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  align-items: stretch;
  justify-content: flex-start;
}
.thumbnail-container {
  background-color: white;
  padding: 5px;
  max-width: 150px;
  position: relative;
  border: 1px solid rgb(117, 116, 116);
}
.thumbnail-container img {
  max-width: 140px;
  max-height: 150px;
}
</style>
