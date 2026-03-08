import { defineConfig } from 'vite'
import react from '@vitejs/react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // GitHub Pages用に相対パスでビルドするように設定
})
