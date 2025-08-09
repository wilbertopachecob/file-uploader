// vue.config.js
const path = require("path");
module.exports = {
  chainWebpack: (config) => {
    config.resolve.alias.set("@", path.resolve(__dirname, "src"));
    config.plugin("html").tap((args) => {
      args[0].title = "File Uploader";
      return args;
    });
  },
};
