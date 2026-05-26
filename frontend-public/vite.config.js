import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/** Copia js/ y css/ vanilla al dist para login/register/forgot y auth mocks. */
function copyVanillaAssets() {
  return {
    name: 'copy-vanilla-assets',
    closeBundle() {
      const out = resolve(__dirname, 'dist')
      for (const dir of ['js', 'css']) {
        const src = resolve(__dirname, dir)
        const dest = resolve(out, dir)
        if (existsSync(src)) cpSync(src, dest, { recursive: true })
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), copyVanillaAssets()],
  base: './',
  root: '.',
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
  },
})
