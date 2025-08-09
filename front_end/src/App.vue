<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <div class="card card-default">
          <div class="card-header">File Uploader (max size: 100MB)</div>
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
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
