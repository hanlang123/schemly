<script lang="ts">
import { defineComponent, h, computed, resolveComponent } from 'vue'
import type { PropType } from 'vue'
import type { DescriptionsProps, DictItem, Providers } from '@schemly/core'
import { checkCellViewPermission } from '@schemly/core'
import { CellRenderer } from './CellRenderer'

export default defineComponent({
  name: 'SchemlyDescriptions',
  props: {
    descProps: { type: Object as PropType<DescriptionsProps>, required: true },
    data: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    schemaDicts: { type: Object as PropType<Record<string, DictItem[]>>, default: () => ({}) },
    providers: { type: Object as PropType<Providers>, default: () => ({}) },
  },
  setup(props) {
    const visibleItems = computed(() => {
      return props.descProps.items.filter((item) => {
        return checkCellViewPermission(item, props.providers.auth?.hasPermission)
      })
    })

    return () => {
      const ElDescriptions = resolveComponent('ElDescriptions')
      const ElDescriptionsItem = resolveComponent('ElDescriptionsItem')

      return h(ElDescriptions, {
        column: props.descProps.column ?? 2,
        border: true,
        class: 'schemly-descriptions',
      }, () =>
        visibleItems.value.map((item) =>
          h(ElDescriptionsItem, { key: item.key, label: item.label }, () =>
            h(CellRenderer, {
              cell: item,
              value: props.data[item.key] as any,
              row: props.data,
              schemaDicts: props.schemaDicts,
              providers: props.providers,
              mode: 'display',
            }),
          ),
        ),
      )
    }
  },
})
</script>
