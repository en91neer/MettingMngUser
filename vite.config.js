import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  
  plugins: [vue()],

  // alias 설정
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  // 프록시 설정
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:8080',
        changeOrigin: true,
        ws: true
      }
    }
  },

  // CloudType의 외부 접속 도메인을 Vite preview 서버에서 허용한다.
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      '.cloudtype.app'
    ]
  }
})
