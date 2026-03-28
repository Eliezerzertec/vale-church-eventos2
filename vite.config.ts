import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

<<<<<<< HEAD
// Detectar backend URL para proxy de dev
const backendTarget = process.env.VITE_BACKEND_URL || 'http://localhost:3001';

=======
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
<<<<<<< HEAD
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      }
    },
=======
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
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
