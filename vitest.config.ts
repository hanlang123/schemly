import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@schemly/core': resolve(__dirname, 'packages/core/src/index.ts'),
      '@schemly/runtime': resolve(__dirname, 'packages/runtime/src/index.ts'),
      '@schemly/designer': resolve(__dirname, 'packages/designer/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/index.ts'],
    },
  },
})
