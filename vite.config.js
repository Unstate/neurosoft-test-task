import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/neurosoft-test-task/',
  server: {
    port: 8080
  }
})
