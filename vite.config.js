import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Puerto fijo distinto al 5173 de absolute-pos-app, para poder correr ambos
// en paralelo durante desarrollo (dashboard hablando con el backend local).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
})
