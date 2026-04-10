import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SchemlyDesigner',
      fileName: 'schemly-designer',
    },
    rollupOptions: {
      external: ['vue', 'element-plus', 'pinia', '@schemly/core', '@schemly/runtime'],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          pinia: 'Pinia',
          '@schemly/core': 'SchemlyCore',
          '@schemly/runtime': 'SchemlyRuntime',
        },
      },
    },
  },
})
