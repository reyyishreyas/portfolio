import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // the react-three-fiber chunk (>500 kB) is lazy-loaded: it only fetches
    // when a 3D component mounts (never on mobile/reduced-motion)
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        codeSplitting: {
          // keep heavy startup vendors out of the app chunk
          groups: [
            { name: 'motion', test: /node_modules\/(motion|framer-motion|motion-dom|motion-utils)\// },
            { name: 'gsap', test: /node_modules\/gsap\// },
            { name: 'marked', test: /node_modules\/marked\// },
          ],
        },
      },
    },
  },
})
