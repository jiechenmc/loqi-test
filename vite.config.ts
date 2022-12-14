import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/": {
        target: "http://hateDetection:8000/api/",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
