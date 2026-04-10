<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '../../store/designer'
import { generateMockValue } from '../../utils/mock'
// @ts-ignore
import { CellRenderer } from '@schemly/runtime'
import type { Providers } from '@schemly/core'

const props = defineProps<{
  mockData?: unknown
  providers?: Providers
}>()

const store = useDesignerStore()

const selectField = (key: string) => {
  store.selectedFieldKey = key
}

const clearSelection = () => {
  store.selectedFieldKey = null
}

const handleCellClick = (_row: unknown, col: { property?: string }) => {
  if (col.property) selectField(col.property)
}

const defaultProviders: Providers = {
  auth: { hasPermission: () => true },
}

const effectiveProviders = computed(() => ({
  ...defaultProviders,
  ...(props.providers ?? {}),
}))

// mock 数据：优先使用外部传入，否则自动生成
const mockRows = computed(() => {
  if (Array.isArray(props.mockData) && props.mockData.length > 0) {
    return props.mockData as Record<string, unknown>[]
  }
  return Array.from({ length: 3 }, (_, i) => {
    const row: Record<string, unknown> = { id: i + 1 }
    for (const col of store.columns) {
      row[col.key] = generateMockValue(col.cell, col.key, i)
    }
    return row
  })
})
</script>

<template>
  <div class="datatable-config" @click.self="clearSelection">
    <!-- 全局配置 -->
    <div class="config-section">
      <div class="config-row">
        <span class="config-label">分页:</span>
        <ElSwitch v-model="store.pagination.enabled" />
        <template v-if="store.pagination.enabled">
          <span class="config-label" style="margin-left: 16px">每页:</span>
          <ElInputNumber v-model="store.pagination.pageSize" size="small" :min="5" :max="200" :step="5" style="width: 100px" />
        </template>
      </div>
      <div class="config-row">
        <span class="config-label">多选:</span>
        <ElSwitch v-model="store.selection.enabled" />
        <template v-if="store.selection.enabled">
          <span class="config-label" style="margin-left: 16px">rowKey:</span>
          <ElInput v-model="store.selection.rowKey" size="small" style="width: 100px" />
        </template>
      </div>
    </div>

    <ElDivider style="margin: 12px 0" />

    <!-- 列预览表格 -->
    <div class="preview-table-wrapper">
      <ElTable :data="mockRows" border size="small" style="width: 100%" @cell-click="handleCellClick">
        <ElTableColumn
          v-for="col in store.columns"
          :key="col.key"
          :prop="col.key"
          :label="col.label"
          :width="col.column?.width"
          :min-width="col.column?.minWidth || 80"
          :class-name="store.selectedFieldKey === col.key ? 'is-selected-col' : ''"
        >
          <template #default="{ row }">
            <CellRenderer
              :cell="col"
              :value="row[col.key]"
              :row="row"
              :schema-dicts="store.dicts"
              :providers="effectiveProviders"
              mode="display"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn v-if="store.rowActions.length > 0" label="操作" width="150" fixed="right">
          <template #default>
            <span v-for="action in store.rowActions.slice(0, 3)" :key="action.key" class="mock-action">
              {{ action.label }}
            </span>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <p class="hint-text">点击表格列可选中字段，右侧面板显示配置</p>
  </div>
</template>

<style scoped>
.datatable-config {
  min-height: 100%;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-label {
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  white-space: nowrap;
}

.preview-table-wrapper {
  margin-top: 8px;
}

.mock-action {
  color: var(--el-color-primary, #409eff);
  font-size: 12px;
  cursor: pointer;
  margin-right: 8px;
}

.hint-text {
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-placeholder, #a8abb2);
  margin-top: 12px;
}

:deep(.is-selected-col) {
  background: var(--el-color-primary-light-9, #ecf5ff) !important;
}
</style>
