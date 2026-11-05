import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development, requests to /api go to the Express server on port 5000.
// Everything is served from one address (port 5173), so the login cookie works.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
});
