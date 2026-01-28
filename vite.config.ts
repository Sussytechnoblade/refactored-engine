import { defineConfig } from 'vite'

export default defineConfig({
  root: 'public',
  server: {
    port: 8000,
    host: true,
    strictPort: true,
    open: true,
  },
  build: {
    target: 'ES2020',
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        game: 'public/game.html'
      }
    }
  },
})
