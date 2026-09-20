import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const vercelEnv = process.env.VERCEL_ENV || env.VITE_VERCEL_ENV || ''
  if (vercelEnv) {
    process.env.VITE_VERCEL_ENV = vercelEnv
  }

  return {
    server: {
      port: 3001,
    },
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
    },
  }
})