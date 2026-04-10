<script setup lang="ts">
import { useDesignerStore } from '../../store/designer'
import GlobalConfigPanel from './GlobalConfigPanel.vue'
import FieldConfigPanel from './FieldConfigPanel.vue'

const store = useDesignerStore()

const emit = defineEmits<{
  'edit-dict': [key: string]
  'add-dict': []
}>()
</script>

<template>
  <div class="right-panel">
    <template v-if="store.selectedField">
      <FieldConfigPanel />
    </template>
    <template v-else>
      <GlobalConfigPanel
        @edit-dict="(key) => emit('edit-dict', key)"
        @add-dict="emit('add-dict')"
      />
    </template>
  </div>
</template>

<style scoped>
.right-panel {
  height: 100%;
  overflow-y: auto;
}
</style>
