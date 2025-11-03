import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase the warning threshold if you accept larger chunks, or keep it strict to surface
    // bundling opportunities. Adjust as needed.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Manual chunks: group common vendor libraries into separate files to reduce the
        // main bundle size. This is a simple heuristic; tune it to your project's deps.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'
            }
            if (id.includes('lucide-react') || id.includes('@radix-ui') || id.includes('shadcn') || id.includes('class-variance-authority')) {
              return 'vendor-ui'
            }
            if (id.includes('motion') || id.includes('framer-motion') || id.includes('@motion')) {
              return 'vendor-motion'
            }
            // fallback vendor chunk
            return 'vendor'
          }
        }
      }
    }
  }
})
