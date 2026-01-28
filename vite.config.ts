import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Serve from project root so /src imports resolve normally during dev
  root: '.',
  server: {
    port: 8000,
    host: true,
    strictPort: true,
    // open the game HTML directly
    open: '/public/game.html',
    fs: {
      // still allow project root explicitly
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
