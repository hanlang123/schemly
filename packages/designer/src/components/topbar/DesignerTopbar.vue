<script setup lang="ts">
import { computed, resolveComponent, h } from 'vue'
import type { SchemaType } from '@schemly/core'
import { useDesignerStore } from '../../store/designer'

const store = useDesignerStore()

const emit = defineEmits<{
  save: []
  import: []
  export: []
}>()

const typeOptions: { label: string; value: SchemaType }[] = [
  { label: 'DataTable', value: 'DataTable' },
  { label: 'Form', value: 'Form' },
  { label: 'Descriptions', value: 'Descriptions' },
]

const hasExistingConfig = computed(() => {
  switch (store.schemaType) {
    case 'DataTable': return store.columns.length > 0
    case 'Form': return store.formFields.length > 0
    case 'Descriptions': return store.descItems.length > 0
    default: return false
  }
})

const handleTypeChange = async (newType: SchemaType) => {
  if (newType === store.schemaType) return

  if (hasExistingConfig.value) {
    try {
      const { ElMessageBox } = await import('element-plus')
      await ElMessageBox.confirm(
        '切换类型将清空当前配置，是否继续？',
        '确认切换',
        { type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消' },
      )
    } catch {
      return // 用户取消
    }
  }

  store.switchType(newType)
}

const togglePreview = () => {
  store.previewMode = !store.previewMode
}
</script>

<template>
  <div class="designer-topbar">
    <div class="topbar-left">
      <span class="topbar-logo">S</span>
      <div class="topbar-name-group">
        <ElInput
          v-model="store.schemaName"
          class="topbar-name-input"
          size="small"
          placeholder="Schema 名称"
        />
        <span class="topbar-id">{{ store.schemaId }}</span>
      </div>
    </div>

    <div class="topbar-center">
      <ElRadioGroup
        :model-value="store.schemaType"
        size="small"
        @change="handleTypeChange"
      >
        <ElRadioButton
          v-for="opt in typeOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </ElRadioButton>
      </ElRadioGroup>
    </div>

    <div class="topbar-right">
      <ElButton size="small" @click="store.undo()" :disabled="store.undoStack.length === 0">
        撤销
      </ElButton>
      <ElButton size="small" @click="store.redo()" :disabled="store.redoStack.length === 0">
        重做
      </ElButton>
      <ElDivider direction="vertical" />
      <ElButton size="small" @click="emit('import')">导入</ElButton>
      <ElButton size="small" @click="emit('export')">导出</ElButton>
      <ElButton
        size="small"
        :type="store.previewMode ? 'warning' : 'default'"
        @click="togglePreview"
      >
        {{ store.previewMode ? '编辑' : '预览' }}
      </ElButton>
      <ElButton size="small" type="primary" @click="emit('save')">保存</ElButton>
    </div>
  </div>
</template>

<style scoped>
.designer-topbar {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-light, #e4e7ed);
  background: var(--el-bg-color, #fff);
  gap: 16px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.topbar-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--el-color-primary, #409eff);
  color: #fff;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.topbar-name-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.topbar-name-input {
  width: 160px;
}

.topbar-name-input :deep(.el-input__inner) {
  font-weight: 600;
}

.topbar-id {
  font-size: 11px;
  color: var(--el-text-color-placeholder, #a8abb2);
  padding-left: 11px;
}

.topbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
