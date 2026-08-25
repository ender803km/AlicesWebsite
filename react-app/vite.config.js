import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Without an explicit CSS target the minifier decided the prefixed
    // `-webkit-backdrop-filter` was sufficient and dropped the standard
    // `backdrop-filter` entirely, which silently removed the frosted
    // nav and search panel in Firefox. Naming the browsers keeps both
    // declarations in the output.
    cssTarget: ['chrome107', 'edge107', 'firefox104', 'safari16'],
  },
})
