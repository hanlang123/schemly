import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 8888
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@schemly/core': resolve(__dirname, '../packages/core/src/index.ts'),
      '@schemly/runtime': resolve(__dirname, '../packages/runtime/src/index.ts'),
      '@schemly/designer': resolve(__dirname, '../packages/designer/src/index.ts'),
    },
  },
})
