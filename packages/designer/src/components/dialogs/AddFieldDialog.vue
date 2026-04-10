<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { CellType } from '@schemly/core'
import { BUILT_IN_CELL_TYPES } from '@schemly/core'

const props = defineProps<{
  visible: boolean
  existingKeys: string[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [field: { key: string; label: string; cell: CellType }]
}>()

const form = reactive({
  key: '',
  label: '',
  cell: 'text' as CellType,
})

const cellOptions = BUILT_IN_CELL_TYPES.map((t) => ({ label: t, value: t }))

const keyError = computed(() => {
  if (!form.key) return '请输入 key'
  if (props.existingKeys.includes(form.key)) return 'key 已存在'
  if (!/^[a-zA-Z_]\w*$/.test(form.key)) return 'key 必须是合法标识符'
  return ''
})

const canSubmit = computed(() => {
  return form.key && form.label && !keyError.value
})

const handleConfirm = () => {
  if (!canSubmit.value) return
  emit('confirm', { key: form.key, label: form.label, cell: form.cell })
  form.key = ''
  form.label = ''
  form.cell = 'text'
  emit('update:visible', false)
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    title="添加字段"
    width="400px"
    @update:model-value="handleClose"
    destroy-on-close
  >
    <ElForm label-width="60px" size="small">
      <ElFormItem label="key:" :error="form.key ? keyError : ''">
        <ElInput v-model="form.key" placeholder="字段 key" />
      </ElFormItem>
      <ElFormItem label="label:">
        <ElInput v-model="form.label" placeholder="显示标签" />
      </ElFormItem>
      <ElFormItem label="类型:">
        <ElSelect v-model="form.cell">
          <ElOption v-for="opt in cellOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton size="small" @click="handleClose">取消</ElButton>
      <ElButton size="small" type="primary" :disabled="!canSubmit" @click="handleConfirm">确认添加</ElButton>
    </template>
  </ElDialog>
</template>
