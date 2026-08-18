/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOG_SERVICE?: string;
  readonly VUE_APP_LOG_SERVICE?: string;
  readonly VUE_APP_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
