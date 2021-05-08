<template>
  <progress
    max="100"
    :value.prop="uploadPercentage"
    class="w-100"
    v-if="isLoading"
  ></progress>
  <div
    class="alert alert-danger alert-dismissible fade show"
    role="alert"
    v-if="errors.length"
  >
    <ul class="mt-4">
      <li style="text-align: left" v-for="(error, idk) in errors" :key="idk">
        {{ error }}
      </li>
    </ul>
    <button
      type="button"
      class="btn-close"
      data-dismiss="alert"
      aria-label="Close"
      @click="resetErrors"
    ></button>
  </div>
  <div
    class="file-uploader"
    @dragenter="dragIn"
    @dragleave="dragOut"
    @dragover.prevent
    @drop="drop"
    :class="{ 'drag-active': isDragging }"
  >
    <div class="upload-controller" v-show="files.length">
      <label for="file"
        ><i class="fas fa-hand-pointer"></i> Select a file</label
      >
      <a @click="upload" :class="{ 'is-disabled': isLoading }"
        ><i class="fas fa-upload"></i> Upload</a
      >
    </div>

    <div v-show="!files.length">
      <i class="fas fa-file-upload"></i>
      <p class="mt-2">Drag and Drop</p>
      <p>OR</p>
      <div class="file-input">
        <label for="file"
          ><i class="fas fa-hand-pointer"></i> Select a file</label
        >
        <input
          type="file"
          id="file"
          ref="fileUploader"
          multiple
          @change="selectFile"
        />
      </div>
    </div>
    <transition-group
      tag="div"
      name="list"
      class="thumbnails mt-5 p-4"
      v-show="files.length"
    >
      <div
        class="thumbnail-container mx-2 mt-3"
        v-for="(file, idk) of files"
        :key="idk"
        @click="openGallery(file)"
        :style="{ cursor: isImage(file) || isVideo(file) ? 'pointer' : 'auto' }"
      >
        <a
          class="close"
          @click="deleteFile($event, idk)"
          title="Delete File"
        ></a>
        <img :src="getSRC(file)" />
        <div class="thumbnail-details">
          <span> <b>Name:</b> {{ file.name }}</span>
          <span> <b>Size:</b> {{ bytesToSize(file.size) }}</span>
        </div>
      </div>
    </transition-group>
  </div>
  <uploaded-files-list
    class="mt-4"
    v-if="uploadedFiles.length"
    :files="uploadedFiles"
    @load-gallery="openGallery($event, 0)"
  />
  <gallery :files="getFilesIntance" ref="gallery" />
</template>

<script>
const MAXSIZE = 100 * 1024 * 1024;
import { bytesToSize, isVideo, isImage } from "../helpers";
import axios from "axios";
import UploadedFilesList from "./UploadedFilesList";
import Gallery from "./Gallery";
export default {
  name: "FileUploader",
  components: {
    UploadedFilesList,
    Gallery,
  },
  props: {
    msg: String,
  },
  data: () => ({
    errors: [],
    isDragging: false,
    dragCount: 0,
    files: [],
    uploadPercentage: 0,
    isLoading: false,
    uploadedFiles: [],
    loadLocal: 1,
  }),
  computed: {
    getFilesIntance() {
      const files = this.loadLocal ? this.files : this.uploadedFiles;
      return files.filter((f) => isImage(f) || isVideo(f));
    },
  },
  methods: {
    bytesToSize,
    isVideo,
    isImage,
    getSRC(file) {
      switch (true) {
        case isImage(file):
          return file.src;
        case isVideo(file):
          return require("@/assets/img/play-button-icon.png");
        default:
          return require("@/assets/img/no-image-icon.png");
      }
    },
    openGallery(file, loadValue = 1) {
      this.loadLocal = loadValue;
      this.$nextTick(() => {
        this.$refs.gallery.openModal(file.name);
      });
    },
    upload() {
      if (this.files.length && !this.isLoading) {
        const formData = new FormData();
        formData.append("name", name.value);
        this.files.forEach((file) => {
          formData.append("files", file);
        });
        this.isLoading = true;
        axios
          .post(`${process.env.VUE_APP_API_URL}/upload-files`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              this.uploadPercentage = parseInt(
                Math.round((progressEvent.loaded / progressEvent.total) * 100)
              );
            },
          })
          .then((res) => {
            console.log(res.data);
            setTimeout(() => {
              this.isLoading = false;
              this.uploadPercentage = 0;
            }, 1000);
            this.files = [];
            res.data.forEach((f) => {
              this.uploadedFiles.push({
                name: f.filename,
                size: f.size,
                src: f.path,
                type: f.mimetype,
              });
            });
          })
          .catch(() => {
            this.errors.push("Server side error");
            this.isLoading = false;
            this.uploadPercentage = 0;
          });
      }
    },
    deleteFile(e, index) {
      e.stopPropagation();
      this.files.splice(index, 1);
      this.$refs.fileUploader.value = "";
    },
    selectFile(e) {
      const files = e.target.files;
      this.addFiles(files);
    },
    dragIn(e) {
      e.preventDefault();
      this.dragCount++;
      this.isDragging = true;
    },
    dragOut(e) {
      e.preventDefault();
      this.dragCount--;
      if (!this.dragCount) {
        this.isDragging = false;
      }
    },
    addFiles(files) {
      [...files].forEach((f) => {
        if (f.size > MAXSIZE) {
          this.errors.push("File exceeds maximum size");
          this.$refs.fileUploader.value = "";
          return;
        }
        if (this.isImage(f) || this.isVideo(f)) {
          this.generateSRC(f);
          return;
        }
        this.files.push(f);
      });
    },
    drop(e) {
      e.preventDefault();
      e.stopPropagation();
      this.isDragging = false;
      const files = e.dataTransfer.files;
      this.addFiles(files);
    },
    generateSRC(f) {
      const reader = new FileReader();
      reader.onload = (e) => {
        f.src = e.target.result;
        this.files.push(f);
      };
      reader.readAsDataURL(f);
    },
    resetErrors() {
      this.errors.length = 0;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.file-input {
  position: relative;
  height: 68px;
  width: 200px;
  margin: auto;
}
.file-input label,
.file-input input {
  color: #2193f3;
  background-color: white;
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
}
.file-input input {
  opacity: 0;
  z-index: -1;
}
.fa-file-upload {
  font-size: 4rem;
}
.file-uploader {
  border: 5px dashed white;
  border-radius: 5px;
  padding: 40px 0px;
  text-align: center;
  color: white;
  background-color: #2193f3;
  font-size: 1.5rem;
  position: relative;
}
.drag-active {
  background-color: white;
  color: #2193f3;
}

.drag-active .file-input label {
  background-color: #2193f3;
  color: white;
}
.thumbnails {
  font-size: 0.9rem;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: stretch;
  justify-content: flex-start;
}
.thumbnail-container {
  background-color: white;
  padding: 5px;
  max-width: 150px;
  position: relative;
}
.thumbnail-container img {
  max-width: 140px;
  max-height: 150px;
}
.thumbnail-details {
  color: black;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 5px 10px;
  overflow-wrap: anywhere;
}
@media (max-width: 576px) {
  .thumbnail-container {
    max-width: 100%;
  }
}
.card-deck .card img {
  width: 150px;
  height: 150px;
}
.upload-controller {
  background-color: white;
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 10px;
}
.upload-controller label,
.upload-controller a {
  background-color: #2193f3;
  color: white;
  border-radius: 5px;
  margin-left: 10px;
  padding: 15px;
  cursor: pointer;
  margin-bottom: 0px !important;
  text-decoration: none;
}
progress {
  height: 18px;
}
.close {
  position: absolute;
  /* right: 32px;
  top: 32px; */
  width: 32px;
  height: 32px;
  opacity: 0.3;
  cursor: pointer;
  top: 0px;
  right: 0px;
}
.close:hover {
  opacity: 1;
}
.close:before,
.close:after {
  position: absolute;
  left: 15px;
  content: " ";
  height: 33px;
  width: 2px;
  background-color: #333;
}
.close:before {
  transform: rotate(45deg);
}
.close:after {
  transform: rotate(-45deg);
}
.is-disabled {
  color: currentColor;
  cursor: not-allowed !important;
  opacity: 0.5;
  text-decoration: none;
}
/* list transition */
.list-enter-from {
  opacity: 0;
  transform: scale(0.6);
}
.list-enter-to {
  opacity: 1;
  transform: scale(1);
}
.list-enter-active {
  transition: all 0.4s ease;
}
.list-leave-from {
  opacity: 1;
  transform: scale(1);
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.6);
}
.list-leave-active {
  transition: all 0.4s ease;
  position: absolute;
}
</style>
