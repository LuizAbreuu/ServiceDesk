import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },

  resolve: {
    dedupe: ['react', 'react-dom'], // ← isso resolve o problema de cópias duplicadas
  },
  server: {
    port: 5173,
  },
})