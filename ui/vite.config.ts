import { defineConfig } from "npm:vite@^5.0.0";
import vue from "npm:@vitejs/plugin-vue@^5.0.0";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
