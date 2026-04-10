<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DictItem } from '@schemly/core'

const props = defineProps<{
  visible: boolean
  dictKey: string
  items: DictItem[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: [key: string, items: DictItem[]]
}>()

const localItems = ref<DictItem[]>([])

watch(() => props.visible, (v) => {
  if (v) {
    localItems.value = props.items.map((item) => ({ ...item }))
  }
})

const colorOptions = [
  { label: 'default', value: '' },
  { label: 'primary', value: 'primary' },
  { label: 'success', value: 'success' },
  { label: 'warning', value: 'warning' },
  { label: 'danger', value: 'danger' },
  { label: 'info', value: 'info' },
]

const addItem = () => {
  localItems.value.push({ label: '', value: '' })
}

const removeItem = (idx: number) => {
  localItems.value.splice(idx, 1)
}

const handleSave = () => {
  const cleaned = localItems.value.filter((item) => item.label && item.value)
  emit('save', props.dictKey, cleaned)
  emit('update:visible', false)
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    :title="`编辑字典: ${dictKey}`"
    width="500px"
    @update:model-value="handleClose"
    destroy-on-close
  >
    <div class="dict-editor">
      <table class="dict-table">
        <thead>
          <tr>
            <th>label</th>
            <th>value</th>
            <th>color</th>
            <th style="width: 40px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in localItems" :key="idx">
            <td>
              <ElInput v-model="item.label" size="small" placeholder="显示文本" />
            </td>
            <td>
              <ElInput v-model="item.value" size="small" placeholder="值" />
            </td>
            <td>
              <ElSelect v-model="item.color" size="small" clearable placeholder="颜色" style="width: 100px">
                <ElOption v-for="opt in colorOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </ElSelect>
            </td>
            <td>
              <ElButton size="small" text type="danger" @click="removeItem(idx)">×</ElButton>
            </td>
          </tr>
        </tbody>
      </table>
      <ElButton size="small" @click="addItem" style="margin-top: 8px">+ 添加项</ElButton>
    </div>

    <template #footer>
      <ElButton size="small" @click="handleClose">取消</ElButton>
      <ElButton size="small" type="primary" @click="handleSave">保存</ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
.dict-editor {
  padding: 4px 0;
}

.dict-table {
  width: 100%;
  border-collapse: collapse;
}

.dict-table th {
  text-align: left;
  padding: 4px 6px;
  border-bottom: 1px solid var(--el-border-color-light, #e4e7ed);
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary, #909399);
}

.dict-table td {
  padding: 4px 6px;
}
</style>
