import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SchemlyRuntime',
      fileName: 'schemly-runtime',
    },
    rollupOptions: {
      external: ['vue', 'element-plus', '@schemly/core'],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          '@schemly/core': 'SchemlyCore',
        },
      },
    },
  },
})
