<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="card card-default">
          <div
            class="card-header d-flex align-items-center justify-content-between"
          >
            <span>File Uploader</span>
            <small class="text-muted">Max size: 100MB</small>
          </div>
          <div class="card-body">
            <FileUploader />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FileUploader from "@/components/FileUploader.vue";

export default {
  name: "App",
  components: {
    FileUploader,
  },
};
</script>

<style>
#app {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
    Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
