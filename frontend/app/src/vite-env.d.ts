/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly GOOGLE_CLIENT_ID?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
