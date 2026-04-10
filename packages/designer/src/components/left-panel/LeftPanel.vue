<script setup lang="ts">
import { useDesignerStore } from '../../store/designer'
import FieldListPanel from './FieldListPanel.vue'
import ActionsPanel from './ActionsPanel.vue'
import FormsPanel from './FormsPanel.vue'

const store = useDesignerStore()

const emit = defineEmits<{
  'add-field': []
  'infer-field': []
}>()
</script>

<template>
  <div class="left-panel">
    <!-- DataTable 有 3 个 tab -->
    <template v-if="store.schemaType === 'DataTable'">
      <div class="left-panel__tabs">
        <button
          class="left-tab"
          :class="{ 'is-active': store.leftTab === 'fields' }"
          @click="store.leftTab = 'fields'"
        >
          字段
        </button>
        <button
          class="left-tab"
          :class="{ 'is-active': store.leftTab === 'actions' }"
          @click="store.leftTab = 'actions'"
        >
          操作
        </button>
        <button
          class="left-tab"
          :class="{ 'is-active': store.leftTab === 'forms' }"
          @click="store.leftTab = 'forms'"
        >
          表单
        </button>
      </div>

      <div class="left-panel__body">
        <FieldListPanel
          v-if="store.leftTab === 'fields'"
          @add-field="emit('add-field')"
          @infer-field="emit('infer-field')"
        />
        <ActionsPanel v-else-if="store.leftTab === 'actions'" />
        <FormsPanel v-else-if="store.leftTab === 'forms'" />
      </div>
    </template>

    <!-- Form / Descriptions 只有字段 tab -->
    <template v-else>
      <div class="left-panel__tabs">
        <button class="left-tab is-active">字段</button>
      </div>
      <div class="left-panel__body">
        <FieldListPanel
          @add-field="emit('add-field')"
          @infer-field="emit('infer-field')"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.left-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.left-panel__tabs {
  display: flex;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  flex-shrink: 0;
}

.left-tab {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  transition: all 0.15s;
  border-bottom: 2px solid transparent;
}

.left-tab:hover {
  color: var(--el-color-primary, #409eff);
}

.left-tab.is-active {
  color: var(--el-color-primary, #409eff);
  border-bottom-color: var(--el-color-primary, #409eff);
  font-weight: 500;
}

.left-panel__body {
  flex: 1;
  overflow: hidden;
}
</style>
