import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/elasticsearch': {
        target: 'http://localhost:9201',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/elasticsearch/, ''),
        secure: false,
      },
      // '/api/wazuh': {
      //   target: 'https://192.168.107.131:55000',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api\/wazuh/, ''),
      //   secure: false, // Allow self-signed SSL
      // },
    },
  },
});

