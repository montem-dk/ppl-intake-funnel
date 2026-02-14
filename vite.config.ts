import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: 'src/main.tsx',
      name: 'IntakeFunnel',
      fileName: 'intake-funnel',
      formats: ['iife'], // Single file that works in browser
    },
    rollupOptions: {
      // Bundle everything into one file (including React)
      output: {
        inlineDynamicImports: true,
      },
    },
    cssCodeSplit: false, // Inline CSS into JS
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
})
