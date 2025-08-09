import { createApp } from "vue";
import App from "@/App.vue";

import * as bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// Make Bootstrap available globally
window.bootstrap = bootstrap;

import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";

// Global modern styles
import "@/assets/css/main.css";

createApp(App).mount("#app");
