<template>
  <div>
    <h3>Uploaded Files</h3>
    <table class="table">
      <thead class="thead-dark">
        <tr>
          <th scope="col">#</th>
          <th scope="col" style="text-align: left">Name</th>
          <th scope="col">Size</th>
          <th scope="col">Download</th>
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
              :href="file.url"
              target="_blank"
              :download="file.name"
            >
              <i class="fa fa-download"></i>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { bytesToSize } from "../helpers";
export default {
  props: {
    files: {
      required: true,
      type: Array,
    },
  },
  methods: {
    bytesToSize,
  },
};
</script>

<style>
h3 {
  text-align: left;
}
</style>
