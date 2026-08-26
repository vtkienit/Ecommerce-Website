import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = '../../'
  const env = loadEnv(mode, envDir, '')

  return {
    plugins: [react(), svgr(), tailwindcss()],
    envDir,
    envPrefix: 'VITE_',
    define: {
      'import.meta.env.GOOGLE_CLIENT_ID': JSON.stringify(
        env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID ?? '',
      ),
    },
  }
})
