<script setup lang="ts">
import { ref } from 'vue'
import type { ToolbarAction, RowAction, RowActionStyle } from '@schemly/core'
import { DEFAULT_ROW_ACTION_STYLE } from '@schemly/core'
import { useDesignerStore } from '../../store/designer'

const store = useDesignerStore()

// --- 工具栏操作 ---
const newToolbarKey = ref('')
const newToolbarLabel = ref('')

const addToolbarAction = () => {
  if (!newToolbarKey.value || !newToolbarLabel.value) return
  store.pushUndo()
  store.toolbarActions.push({
    key: newToolbarKey.value,
    label: newToolbarLabel.value,
  })
  newToolbarKey.value = ''
  newToolbarLabel.value = ''
}

const removeToolbarAction = (idx: number) => {
  store.pushUndo()
  store.toolbarActions.splice(idx, 1)
}

const updateToolbarTrigger = (idx: number, trigger: string) => {
  store.pushUndo()
  if (trigger) {
    store.toolbarActions[idx] = { ...store.toolbarActions[idx], trigger: trigger as ToolbarAction['trigger'] }
  } else {
    const { trigger: _, ...rest } = store.toolbarActions[idx]
    store.toolbarActions[idx] = rest as ToolbarAction
  }
}

// --- 行操作 ---
const newRowKey = ref('')
const newRowLabel = ref('')

const addRowAction = () => {
  if (!newRowKey.value || !newRowLabel.value) return
  store.pushUndo()
  store.rowActions.push({
    key: newRowKey.value,
    label: newRowLabel.value,
  })
  newRowKey.value = ''
  newRowLabel.value = ''
}

const removeRowAction = (idx: number) => {
  store.pushUndo()
  store.rowActions.splice(idx, 1)
}

const toggleRowDanger = (idx: number) => {
  store.pushUndo()
  const action = store.rowActions[idx]
  store.rowActions[idx] = { ...action, danger: !action.danger }
}

const updateRowTrigger = (idx: number, trigger: string) => {
  store.pushUndo()
  if (trigger) {
    store.rowActions[idx] = { ...store.rowActions[idx], trigger: trigger as RowAction['trigger'] }
  } else {
    const { trigger: _, ...rest } = store.rowActions[idx]
    store.rowActions[idx] = rest as RowAction
  }
}

const updateRowConfirm = (idx: number, confirm: string) => {
  store.pushUndo()
  if (confirm) {
    store.rowActions[idx] = { ...store.rowActions[idx], confirm }
  } else {
    const { confirm: _, ...rest } = store.rowActions[idx]
    store.rowActions[idx] = rest as RowAction
  }
}
</script>

<template>
  <div class="actions-panel">
    <!-- 工具栏操作 -->
    <div class="section">
      <div class="section-title">工具栏操作</div>
      <div class="action-list">
        <div v-for="(action, idx) in store.toolbarActions" :key="action.key" class="action-item">
          <div class="action-info">
            <span class="action-key">{{ action.key }}</span>
            <span class="action-label">{{ action.label }}</span>
          </div>
          <ElSelect
            :model-value="action.trigger || ''"
            size="small"
            placeholder="触发"
            clearable
            style="width: 110px"
            @change="(v: string) => updateToolbarTrigger(idx, v)"
          >
            <ElOption label="createForm" value="createForm" />
          </ElSelect>
          <ElButton size="small" text type="danger" @click="removeToolbarAction(idx)">×</ElButton>
        </div>
      </div>
      <div class="add-action-row">
        <ElInput v-model="newToolbarKey" size="small" placeholder="key" style="width: 80px" />
        <ElInput v-model="newToolbarLabel" size="small" placeholder="标签" style="width: 80px" />
        <ElButton size="small" @click="addToolbarAction">+ 添加</ElButton>
      </div>
    </div>

    <!-- 行操作 -->
    <div class="section">
      <div class="section-title">行操作</div>
      <div class="action-list">
        <div v-for="(action, idx) in store.rowActions" :key="action.key" class="action-item">
          <div class="action-info">
            <span class="action-key" :class="{ 'is-danger': action.danger }">{{ action.key }}</span>
            <span class="action-label">{{ action.label }}</span>
          </div>
          <ElSelect
            :model-value="action.trigger || ''"
            size="small"
            placeholder="触发"
            clearable
            style="width: 110px"
            @change="(v: string) => updateRowTrigger(idx, v)"
          >
            <ElOption label="updateForm" value="updateForm" />
          </ElSelect>
          <ElButton
            size="small"
            text
            :type="action.danger ? 'danger' : 'default'"
            @click="toggleRowDanger(idx)"
            title="切换 danger"
          >
            {{ action.danger ? '🔴' : '⚪' }}
          </ElButton>
          <ElButton size="small" text type="danger" @click="removeRowAction(idx)">×</ElButton>
        </div>
      </div>
      <div class="add-action-row">
        <ElInput v-model="newRowKey" size="small" placeholder="key" style="width: 80px" />
        <ElInput v-model="newRowLabel" size="small" placeholder="标签" style="width: 80px" />
        <ElButton size="small" @click="addRowAction">+ 添加</ElButton>
      </div>
    </div>

    <!-- 行操作样式 -->
    <div class="section">
      <div class="section-title">行操作样式</div>
      <div class="form-row">
        <span class="form-label">类型:</span>
        <ElSelect v-model="store.rowActionStyle.type" size="small" style="width: 100px">
          <ElOption label="link" value="link" />
          <ElOption label="button" value="button" />
        </ElSelect>
      </div>
      <div class="form-row">
        <span class="form-label">最多显示:</span>
        <ElInputNumber v-model="store.rowActionStyle.maxVisible" size="small" :min="1" :max="10" style="width: 100px" />
      </div>
      <div class="form-row">
        <span class="form-label">更多文字:</span>
        <ElInput v-model="store.rowActionStyle.moreText" size="small" style="width: 100px" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.actions-panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary, #909399);
  margin-bottom: 6px;
  text-transform: uppercase;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 6px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 4px;
  background: var(--el-fill-color-lighter, #fafcff);
}

.action-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.action-key {
  font-size: 12px;
  font-weight: 500;
}

.action-key.is-danger {
  color: var(--el-color-danger, #f56c6c);
}

.action-label {
  font-size: 11px;
  color: var(--el-text-color-secondary, #909399);
}

.add-action-row {
  display: flex;
  gap: 4px;
  align-items: center;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.form-label {
  font-size: 12px;
  color: var(--el-text-color-regular, #606266);
  white-space: nowrap;
  min-width: 60px;
}
</style>
