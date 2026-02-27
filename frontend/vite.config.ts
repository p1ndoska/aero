import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Исправление для пакетов с неправильной конфигурацией
    dedupe: ['react', 'react-dom'],
  },
  build: {
    // Игнорировать предупреждения о дублирующихся ключах
    rollupOptions: {
      onwarn(warning, warn) {
        // Игнорировать предупреждения о дублирующихся ключах в объектах
        if (warning.code === 'PLUGIN_WARNING' || warning.message?.includes('Duplicate')) {
          return;
        }
        warn(warning);
      },
    },
  },
  // Исправление для crypto.hash
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022',
    },
    include: ['@jonesstack/react-form-engine'],
  },
})