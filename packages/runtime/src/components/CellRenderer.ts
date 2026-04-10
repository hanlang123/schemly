import { defineComponent, h, computed, resolveComponent } from 'vue'
import type { PropType } from 'vue'
import type { CellDeclaration, DictItem, DisplayAs, Providers } from '@schemly/core'
import { resolveDisplayAs, resolveDictItems, parseOptionsPrefix, checkCellViewPermission } from '@schemly/core'
import { DISPLAY_RENDERER_MAP } from '../renderers/renderer-map'

/**
 * 通用 CellRenderer：根据 mode 渲染 display/edit
 */
export const CellRenderer = defineComponent({
  name: 'CellRenderer',
  props: {
    cell: { type: Object as PropType<CellDeclaration>, required: true },
    value: { type: null as unknown as PropType<any>, default: undefined },
    row: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    schemaDicts: { type: Object as PropType<Record<string, DictItem[]>>, default: () => ({}) },
    providers: { type: Object as PropType<Providers>, default: () => ({}) },
    mode: { type: String as PropType<'display' | 'edit'>, default: 'display' },
  },
  setup(props) {
    const dictItems = computed(() => {
      const options = (props.cell.cellProps as { options?: string })?.options
      if (!options) return []
      const parsed = parseOptionsPrefix(options)
      if (!parsed) return []
      if (parsed.type === 'dict') {
        return resolveDictItems(parsed.key, props.schemaDicts, props.providers.dicts) ?? []
      }
      return []
    })

    return () => {
      if (props.mode === 'display') {
        const displayAs = resolveDisplayAs(props.cell)
        const Comp = DISPLAY_RENDERER_MAP[displayAs]
        if (!Comp) return h('span', String(props.value ?? ''))

        const cellProps = props.cell.cellProps ?? {}
        let displayValue = props.value

        // 自定义 formatter 优先
        const formatter = props.providers.formatters?.[props.cell.key]
        if (formatter) {
          return h('span', { class: 'schemly-formatted' }, formatter(displayValue))
        }

        // remote 字段在 display 模式下使用 displayLabelKey 获取已有的 label
        const optionsStr = (cellProps as { options?: string }).options
        if (optionsStr?.startsWith('remote:')) {
          const displayLabelKey = (cellProps as { displayLabelKey?: string }).displayLabelKey
          if (displayLabelKey && props.row[displayLabelKey] !== undefined) {
            displayValue = props.row[displayLabelKey]
          }
        }

        return h(Comp, {
          value: displayValue,
          cellProps,
          row: props.row,
          dictItems: dictItems.value,
          providers: props.providers,
        })
      }

      // edit mode 在 FormField 中处理
      return h('span', String(props.value ?? ''))
    }
  },
})
