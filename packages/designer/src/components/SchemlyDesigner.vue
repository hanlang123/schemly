<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { createPinia } from 'pinia'
import type { SchemlySchema, Providers, CellType, DictItem } from '@schemly/core'
import { useDesignerStore } from '../store/designer'
import DesignerTopbar from './topbar/DesignerTopbar.vue'
import DesignerLayout from './DesignerLayout.vue'
import LeftPanel from './left-panel/LeftPanel.vue'
import CenterPanel from './center-panel/CenterPanel.vue'
import RightPanel from './right-panel/RightPanel.vue'
import BottomPanel from './bottom-panel/BottomPanel.vue'
import AddFieldDialog from './dialogs/AddFieldDialog.vue'
import InferFieldsDialog from './dialogs/InferFieldsDialog.vue'
import DictEditDialog from './dialogs/DictEditDialog.vue'
import ImportDialog from './dialogs/ImportDialog.vue'

const props = defineProps<{
  schema?: SchemlySchema
  mockData?: unknown
  providers?: Providers
}>()

const emit = defineEmits<{
  save: [payload: { schema: SchemlySchema }]
  change: [payload: { schema: SchemlySchema }]
}>()

const store = useDesignerStore()

// 加载初始 schema
onMounted(() => {
  if (props.schema) {
    store.loadSchema(props.schema, false)
  }
})

// watch schema change → emit
watch(() => store.schema, (s) => {
  emit('change', { schema: s })
}, { deep: true })

// 对话框状态
const addFieldDialogVisible = ref(false)
const inferFieldsDialogVisible = ref(false)
const dictEditDialogVisible = ref(false)
const importDialogVisible = ref(false)

const editingDictKey = ref('')
const editingDictItems = ref<DictItem[]>([])

const existingKeys = computed(() => store.currentFields.map((f) => f.key))

// --- 事件处理 ---
const handleSave = () => {
  emit('save', { schema: store.schema })
}

const handleExport = () => {
  const json = JSON.stringify(store.schema, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${store.schemaId}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const handleImport = () => {
  importDialogVisible.value = true
}

const handleImportConfirm = (data: unknown) => {
  store.loadSchema(data as SchemlySchema)
}

const handleAddField = () => {
  addFieldDialogVisible.value = true
}

const handleAddFieldConfirm = (field: { key: string; label: string; cell: CellType }) => {
  store.addField({ key: field.key, label: field.label, cell: field.cell })
}

const handleInferField = () => {
  inferFieldsDialogVisible.value = true
}

const handleInferConfirm = (fields: Array<{ key: string; label: string; cell: CellType }>) => {
  for (const field of fields) {
    store.addField({ key: field.key, label: field.label, cell: field.cell })
  }
}

const handleEditDict = (key: string) => {
  editingDictKey.value = key
  editingDictItems.value = store.dicts[key] ? [...store.dicts[key]] : []
  dictEditDialogVisible.value = true
}

const handleAddDict = () => {
  editingDictKey.value = 'newDict'
  editingDictItems.value = []
  dictEditDialogVisible.value = true
}

const handleDictSave = (key: string, items: DictItem[]) => {
  store.setDict(key, items)
}
</script>

<template>
  <div class="schemly-designer">
    <DesignerTopbar
      @save="handleSave"
      @import="handleImport"
      @export="handleExport"
    />

    <DesignerLayout>
      <template #left>
        <LeftPanel
          @add-field="handleAddField"
          @infer-field="handleInferField"
        />
      </template>

      <template #center>
        <CenterPanel
          :mock-data="mockData"
          :providers="providers"
        />
      </template>

      <template #right>
        <RightPanel
          @edit-dict="handleEditDict"
          @add-dict="handleAddDict"
        />
      </template>
    </DesignerLayout>

    <BottomPanel />

    <!-- 对话框 -->
    <AddFieldDialog
      v-model:visible="addFieldDialogVisible"
      :existing-keys="existingKeys"
      @confirm="handleAddFieldConfirm"
    />

    <InferFieldsDialog
      v-model:visible="inferFieldsDialogVisible"
      :existing-keys="existingKeys"
      @confirm="handleInferConfirm"
    />

    <DictEditDialog
      v-model:visible="dictEditDialogVisible"
      :dict-key="editingDictKey"
      :items="editingDictItems"
      @save="handleDictSave"
    />

    <ImportDialog
      v-model:visible="importDialogVisible"
      @import="handleImportConfirm"
    />
  </div>
</template>

<style scoped>
.schemly-designer {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
