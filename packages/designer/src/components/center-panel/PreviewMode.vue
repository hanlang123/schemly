<script setup lang="ts">
import { computed } from 'vue'
// @ts-ignore
import { SchemlyRenderer } from '@schemly/runtime'
import type { Providers } from '@schemly/core'
import { useDesignerStore } from '../../store/designer'
import { generateMockValue } from '../../utils/mock'

const props = defineProps<{
  mockData?: unknown
  providers?: Providers
}>()

const store = useDesignerStore()

const defaultProviders: Providers = {
  auth: { hasPermission: () => true },
}

const effectiveProviders = computed(() => ({
  ...defaultProviders,
  ...(props.providers ?? {}),
}))

const autoMockData = computed(() => {
  const schema = store.schema
  if (schema.type === 'DataTable') {
    const cols = (schema.props as { columns?: Array<{ key: string; cell: string }> }).columns ?? []
    return Array.from({ length: 3 }, (_, i) => {
      const row: Record<string, unknown> = { id: i + 1 }
      for (const col of cols) {
        row[col.key] = generateMockValue(col.cell as any, col.key, i)
      }
      return row
    })
  }
  if (schema.type === 'Form' || schema.type === 'Descriptions') {
    const items = schema.type === 'Form'
      ? (schema.props as { fields?: Array<{ key: string; cell: string }> }).fields ?? []
      : (schema.props as { items?: Array<{ key: string; cell: string }> }).items ?? []
    const data: Record<string, unknown> = {}
    for (const item of items) {
      data[item.key] = generateMockValue(item.cell as any, item.key, 0)
    }
    return data
  }
  return {}
})

const effectiveData = computed(() => {
  return props.mockData ?? autoMockData.value
})
</script>

<template>
  <div class="preview-mode">
    <div class="preview-banner">
      <ElTag type="warning" size="small">预览模式</ElTag>
      <span class="preview-hint">使用 Runtime 渲染真实效果</span>
    </div>
    <div class="preview-body">
      <SchemlyRenderer
        :schema="store.schema"
        :data="effectiveData as any"
        :providers="effectiveProviders"
        :loading="false"
      />
    </div>
  </div>
</template>

<style scoped>
.preview-mode {
  min-height: 100%;
}

.preview-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.preview-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
}

.preview-body {
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  border-radius: 4px;
  padding: 16px;
  background: var(--el-bg-color, #fff);
}
</style>
