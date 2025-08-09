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
    data-bs-backdrop="false"
    data-bs-keyboard="true"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLongTitle">Files Gallery</h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="closeModal"
            data-bs-dismiss="modal"
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
            <div
              class="left-btn"
              @click="slide('left')"
              @keydown.enter="slide('left')"
              @keydown.space.prevent="slide('left')"
              role="button"
              tabindex="0"
              aria-label="Previous image"
            >
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
            <div
              class="right-btn"
              @click="slide('right')"
              @keydown.enter="slide('right')"
              @keydown.space.prevent="slide('right')"
              role="button"
              tabindex="0"
              aria-label="Next image"
            >
              <i class="fas fa-chevron-circle-right"></i>
            </div>
          </div>
          <div class="thumbnails mt-3">
            <div
              class="thumbnail-container mx-1"
              v-for="(file, idk) of files"
              :key="idk"
              @click="setCurrent(idk)"
              role="button"
              tabindex="0"
              @keydown.enter="setCurrent(idk)"
              @keydown.space.prevent="setCurrent(idk)"
              style="cursor: pointer"
            >
              <img
                :src="thumbnailSrc(file)"
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
import { isVideo, isImage, generateVideoThumbnail } from "@/helpers";
import { Modal } from "bootstrap";
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
      videoThumbnails: new Map(), // Cache for video thumbnails
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

    // Make closeModal available globally for testing
    window.testCloseModal = () => {
      this.closeModal();
    };

    if (modal) {
      modal.addEventListener("hidden.bs.modal", this.closePlayer);
      modal.addEventListener("hide.bs.modal", this.closePlayer);

      // Add manual listeners as backup
      modal.addEventListener("click", (e) => {
        // Close if clicking the backdrop (outside modal-content)
        if (e.target === modal) {
          this.closeModal();
        }
      });

      // Escape key listener
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("show")) {
          this.closeModal();
        }
      });

      // Add click listener to close button specifically
      const closeButton = modal.querySelector(".btn-close");
      if (closeButton) {
        closeButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.closeModal();
        });
      }
    }
  },
  beforeUnmount() {
    const modal = document.querySelector("#galleryModal");
    if (modal) {
      modal.removeEventListener("hidden.bs.modal", this.closePlayer);
      modal.removeEventListener("hide.bs.modal", this.closePlayer);
    }

    try {
      const players = videojs.getPlayers();
      Object.values(players).forEach((player) => player.dispose());
    } catch (e) {
      // ignore dispose errors in teardown
    }
  },
  methods: {
    isVideo,
    isImage,
    thumbnailSrc(file) {
      if (this.isVideo(file)) {
        const cached = this.videoThumbnails.get(file.src);
        if (cached) {
          return cached;
        }
        // Generate thumbnail asynchronously using utility function
        this.generateVideoThumbnailWrapper(file);
        // Return fallback while generating
        return require("@/assets/img/play-button-icon.png");
      }
      return file.src;
    },
    generateVideoThumbnailWrapper(file) {
      // Prevent duplicate generation for the same video
      if (this.videoThumbnails.has(file.src)) {
        return;
      }

      // Use the utility function
      generateVideoThumbnail(file.src)
        .then((thumbnail) => {
          // Cache the thumbnail
          this.videoThumbnails.set(file.src, thumbnail);

          // Force reactivity update
          this.$forceUpdate();
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.warn("Failed to generate video thumbnail:", error);
          // Keep the fallback icon - no need to cache failure
        });
    },
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
      const index = this.files.findIndex(
        (f) => f.name === name || this.getFileName(f) === name
      );
      this.index = index >= 0 ? index : 0;
      this.currentFile = this.files[this.index];

      // Use Bootstrap Modal API properly
      this.$nextTick(() => {
        try {
          const modalEl = this.$refs.modal;
          if (modalEl && Modal) {
            const modalInstance = Modal.getOrCreateInstance(modalEl);
            modalInstance.show();

            // Load video player after modal is shown
            if (this.isVideo(this.currentFile)) {
              this.loadPlayer();
            }
          } else if (this.$refs.openModal) {
            // eslint-disable-next-line no-console
            console.log("Using fallback button approach");
            // Fallback to trigger button
            this.$refs.openModal.click();
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("Modal open error:", e);
          // Final fallback
          if (this.$refs.openModal) {
            this.$refs.openModal.click();
          }
        }
      });
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
            // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
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

      // Try Bootstrap first, then manual close as fallback
      const modalEl = this.$refs.modal;
      if (modalEl) {
        // First try Bootstrap Modal API
        if (Modal) {
          try {
            const modalInstance = Modal.getOrCreateInstance(modalEl);
            modalInstance.hide();
            // eslint-disable-next-line no-console
            console.log("Modal closed via Bootstrap API");
            return;
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Bootstrap close failed, using manual close:", e);
          }
        }

        // Manual close as fallback
        modalEl.style.display = "none";
        modalEl.classList.remove("show");
        modalEl.setAttribute("aria-hidden", "true");
        modalEl.removeAttribute("aria-modal");

        // Remove backdrop
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";

        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) {
          backdrop.remove();
        }

        // eslint-disable-next-line no-console
        console.log("Modal closed manually");
        return;
      }
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
  z-index: 10;
  position: relative;
  user-select: none;
  transition: all 0.2s ease;
}

.left-btn:hover,
.right-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}

.left-btn:active,
.right-btn:active {
  transform: scale(0.95);
}

.left-btn:focus,
.right-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
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
  transition: all 0.2s ease;
  user-select: none;
}

.thumbnail-container:hover {
  transform: scale(1.05);
  border-color: #007bff;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.thumbnail-container:active {
  transform: scale(0.98);
}

.thumbnail-container:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.thumbnail-container img {
  max-width: 140px;
  max-height: 150px;
}

/* Modern close button styling */
.modal-header .btn-close {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  opacity: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.modal-header .btn-close:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: scale(1.1);
}

.modal-header .btn-close:focus {
  outline: 2px solid rgba(239, 68, 68, 0.5);
  outline-offset: 2px;
}

.modal-header .btn-close::before {
  content: "✕";
  color: white;
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
}

/* Hide the default background image */
.modal-header .btn-close {
  background-image: none;
}

/* Modal header styling to match the dark theme */
.modal-header {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.04)
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  color: #e5e7eb;
}

.modal-content {
  background: var(--bg-elev, #111827);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e5e7eb;
}

.modal-title {
  color: #e5e7eb;
  font-weight: 600;
}
</style>
