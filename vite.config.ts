import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Detectar backend URL para proxy de dev
const backendTarget = process.env.VITE_BACKEND_URL || 'http://localhost:3001';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      }
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
