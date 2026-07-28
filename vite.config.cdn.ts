// vite.config.cdn.ts
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import cssInjected from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [solid(), cssInjected()], // inlines yard-sale.css into the JS
  build: {
    lib: { entry: 'src/index.ts', name: 'YardSale', formats: ['iife'], fileName: () => 'yardsale.min.js' },
    minify: true,
    emptyOutDir: false,
  },
})
