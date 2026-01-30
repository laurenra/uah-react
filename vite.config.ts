import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
  server: {
    proxy: {
      // Proxy requests starting with '/api' to your backend server
      '/api': {
        target: 'http://localhost:5173', // The address of your backend server
        changeOrigin: true, // Changes the origin header to the target URL
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Rewrites the path by removing the '/api' prefix
      },
    },
  }})
