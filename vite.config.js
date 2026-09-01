/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  test: {
    // O cliente HTTP usa localStorage; jsdom fornece um de verdade em vez de um dublê.
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
