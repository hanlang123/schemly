<script setup lang="ts">
import { useDesignerStore } from '../../store/designer'
import DataTableConfig from './DataTableConfig.vue'
import FormConfig from './FormConfig.vue'
import DescriptionsConfig from './DescriptionsConfig.vue'
import PreviewMode from './PreviewMode.vue'
import type { Providers } from '@schemly/core'

defineProps<{
  mockData?: unknown
  providers?: Providers
}>()

const store = useDesignerStore()
</script>

<template>
  <div class="center-panel">
    <template v-if="store.previewMode">
      <PreviewMode :mock-data="mockData" :providers="providers" />
    </template>
    <template v-else>
      <DataTableConfig v-if="store.schemaType === 'DataTable'" :mock-data="mockData" :providers="providers" />
      <FormConfig v-else-if="store.schemaType === 'Form'" :mock-data="mockData" :providers="providers" />
      <DescriptionsConfig v-else-if="store.schemaType === 'Descriptions'" :mock-data="mockData" :providers="providers" />
    </template>
  </div>
</template>

<style scoped>
.center-panel {
  height: 100%;
  overflow: auto;
  padding: 16px;
}
</style>
