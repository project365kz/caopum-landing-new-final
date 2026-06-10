import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: '/' для dev и для хостинга caopum.kz (root domain).
// При сборке для PS.KZ можно дополнительно передать --base ./ для относительных путей.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})
