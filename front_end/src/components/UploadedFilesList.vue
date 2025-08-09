<template>
  <div>
    <h3 class="mb-3">Uploaded Files</h3>
    <table class="table">
      <thead class="table-dark">
        <tr>
          <th scope="col">#</th>
          <th scope="col" style="text-align: left">Name</th>
          <th scope="col">Size</th>
          <th scope="col">Download</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(file, idk) in files" :key="idk">
          <th scope="row">{{ idk + 1 }}</th>
          <td style="text-align: left">{{ file.name }}</td>
          <td>{{ bytesToSize(file.size) }}</td>
          <td>
            <a
              class="btn btn-primary"
              title="Download"
              :href="file.src"
              target="_blank"
              :download="file.name"
            >
              <i class="fa fa-download"></i>
            </a>
          </td>
          <td>
            <button
              type="button"
              class="btn btn-success"
              v-if="isVideo(file) || isImage(file)"
              @click="loadGallery(file)"
            >
              <i class="fas fa-eye"></i> View
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { isImage, isVideo, bytesToSize } from "@/helpers";
export default {
  props: {
    files: {
      required: true,
      type: Array,
    },
  },
  methods: {
    isImage,
    isVideo,
    bytesToSize,
    loadGallery(file) {
      this.$emit("load-gallery", file);
    },
  },
};
</script>

<style>
h3 {
  text-align: left;
}
</style>
