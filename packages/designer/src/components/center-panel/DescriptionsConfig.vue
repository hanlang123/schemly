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

const defaultProviders: Providers = {
  auth: { hasPermission: () => true },
}

const effectiveProviders = computed(() => ({
  ...defaultProviders,
  ...(props.providers ?? {}),
}))

// mock 数据：优先使用外部传入，否则自动生成
const mockRow = computed(() => {
  const external = props.mockData as Record<string, unknown> | undefined
  if (external && typeof external === 'object' && !Array.isArray(external)) {
    return external
  }
  const data: Record<string, unknown> = {}
  for (const item of store.descItems) {
    data[item.key] = generateMockValue(item.cell, item.key, 0)
  }
  return data
})
</script>

<template>
  <div class="descriptions-config" @click.self="clearSelection">
    <!-- 全局配置 -->
    <div class="config-section">
      <div class="config-row">
        <span class="config-label">每行列数:</span>
        <ElInputNumber v-model="store.descColumn" size="small" :min="1" :max="4" style="width: 100px" />
      </div>
    </div>

    <ElDivider style="margin: 12px 0" />

    <!-- 描述列表预览 -->
    <div class="desc-preview">
      <ElDescriptions :column="store.descColumn" border size="small">
        <ElDescriptionsItem
          v-for="item in store.descItems"
          :key="item.key"
          :label="item.label"
        >
          <div
            class="desc-item-content"
            :class="{ 'is-selected': store.selectedFieldKey === item.key }"
            @click.stop="selectField(item.key)"
          >
            <CellRenderer
              :cell="item"
              :value="mockRow[item.key]"
              :row="mockRow"
              :schema-dicts="store.dicts"
              :providers="effectiveProviders"
              mode="display"
            />
          </div>
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>

    <p class="hint-text">点击描述项可选中，右侧面板显示配置</p>
  </div>
</template>

<style scoped>
.descriptions-config {
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

.desc-preview {
  margin-top: 8px;
}

.desc-item-content {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;
  transition: outline 0.15s;
}

.desc-item-content.is-selected {
  outline: 2px solid var(--el-color-primary, #409eff);
  outline-offset: 2px;
}

.hint-text {
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-placeholder, #a8abb2);
  margin-top: 12px;
}
</style>
