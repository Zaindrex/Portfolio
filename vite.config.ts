import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Base path the site is served from.
// - GitHub Pages at zaindrex.github.io/Portfolio/ → '/Portfolio/' (the deploy workflow sets VITE_BASE)
// - Vercel or local dev → '/'
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
})
