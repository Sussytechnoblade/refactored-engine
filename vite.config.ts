import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'public',
  server: {
    port: 8000,
    host: true,
    strictPort: true,
    open: true,
    fs: {
      // Allow serving files from project root so imports like ../src/main.ts work
      allow: [resolve(__dirname)]
    }
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
