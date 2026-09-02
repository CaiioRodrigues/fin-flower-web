/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Sem strictPort o Vite sobe na 5174 quando a 5173 está ocupada, e o CORS
    // da API passa a barrar a origem — o navegador só diz "Failed to fetch".
    // Melhor falhar na subida, dizendo que a porta está em uso.
    strictPort: true,
    open: false,
  },
  test: {
    // O cliente HTTP usa localStorage; jsdom fornece um de verdade em vez de um dublê.
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
