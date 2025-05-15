import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: path.join(__dirname, 'client'),
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, 'client/src'),
      '@shared': path.join(__dirname, 'shared')
    }
  }
});
