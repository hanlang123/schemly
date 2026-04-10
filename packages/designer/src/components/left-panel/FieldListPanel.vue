<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CellDeclaration, SchemaType } from '@schemly/core'
import { useDesignerStore } from '../../store/designer'

const store = useDesignerStore()

const emit = defineEmits<{
  'add-field': []
  'infer-field': []
}>()

const searchQuery = ref('')

const filteredFields = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return store.currentFields
  return store.currentFields.filter(
    (f) => f.key.toLowerCase().includes(q) || f.label.toLowerCase().includes(q),
  )
})

const hasPermission = (field: CellDeclaration) => {
  const perm = field.permission
  if (!perm) return false
  if (typeof perm === 'string') return true
  return !!(perm.view || perm.edit)
}

const selectField = (key: string) => {
  store.selectedFieldKey = store.selectedFieldKey === key ? null : key
}

// --- 拖拽排序 ---
const dragIndex = ref<number | null>(null)

const handleDragStart = (idx: number) => {
  dragIndex.value = idx
}

const handleDragOver = (e: DragEvent, idx: number) => {
  e.preventDefault()
  if (dragIndex.value === null || dragIndex.value === idx) return
}

const handleDrop = (e: DragEvent, idx: number) => {
  e.preventDefault()
  if (dragIndex.value === null || dragIndex.value === idx) return
  store.moveField(dragIndex.value, idx)
  dragIndex.value = null
}

const handleDragEnd = () => {
  dragIndex.value = null
}

const removeField = (key: string, e: Event) => {
  e.stopPropagation()
  store.removeField(key)
}
</script>

<template>
  <div class="field-list-panel">
    <div class="field-list-panel__toolbar">
      <ElInput
        v-model="searchQuery"
        size="small"
        placeholder="搜索字段..."
        clearable
        prefix-icon="Search"
      />
      <div class="toolbar-actions">
        <ElButton size="small" @click="emit('add-field')">+ 添加</ElButton>
        <ElButton size="small" @click="emit('infer-field')">⚡推断</ElButton>
      </div>
    </div>

    <div class="field-list">
      <div
        v-for="(field, idx) in filteredFields"
        :key="field.key"
        class="field-item"
        :class="{ 'is-selected': store.selectedFieldKey === field.key }"
        draggable="true"
        @click="selectField(field.key)"
        @dragstart="handleDragStart(idx)"
        @dragover="handleDragOver($event, idx)"
        @drop="handleDrop($event, idx)"
        @dragend="handleDragEnd"
      >
        <span class="field-drag-handle">≡</span>
        <div class="field-info">
          <span class="field-key">{{ field.key }}</span>
          <span class="field-meta">{{ field.label }} · {{ field.cell }}</span>
        </div>
        <span v-if="hasPermission(field)" class="field-perm-dot" title="有权限配置">●</span>
        <ElButton
          class="field-remove-btn"
          size="small"
          text
          type="danger"
          @click="removeField(field.key, $event)"
        >
          ×
        </ElButton>
      </div>

      <div v-if="filteredFields.length === 0" class="field-list-empty">
        {{ searchQuery ? '无匹配字段' : '暂无字段，点击添加' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.field-list-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.field-list-panel__toolbar {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.toolbar-actions {
  display: flex;
  gap: 4px;
}

.field-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.field-item {
  display: flex;
  align-items: center;
  padding: 8px 8px 8px 4px;
  cursor: pointer;
  transition: all 0.15s;
  gap: 6px;
  border-left: 3px solid transparent;
}

.field-item:hover {
  background: var(--el-fill-color-light, #f5f7fa);
}

.field-item.is-selected {
  background: var(--el-color-primary-light-9, #ecf5ff);
  border-left-color: var(--el-color-primary, #409eff);
}

.field-drag-handle {
  cursor: grab;
  color: var(--el-text-color-placeholder, #a8abb2);
  font-size: 14px;
  flex-shrink: 0;
  width: 16px;
  text-align: center;
}

.field-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.field-key {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary, #303133);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-meta {
  font-size: 11px;
  color: var(--el-text-color-secondary, #909399);
}

.field-perm-dot {
  color: var(--el-color-primary, #409eff);
  font-size: 8px;
  flex-shrink: 0;
}

.field-remove-btn {
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.field-item:hover .field-remove-btn {
  opacity: 1;
}

.field-list-empty {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-placeholder, #a8abb2);
}
</style>
