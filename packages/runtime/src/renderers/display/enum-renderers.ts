import { defineComponent, h, resolveComponent } from 'vue'
import type { PropType } from 'vue'
import type { DictItem } from '@schemly/core'

/** Tag 渲染器 */
export const TagDisplay = defineComponent({
  name: 'TagDisplay',
  props: {
    value: { type: [String, Number] as PropType<unknown>, default: '' },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    dictItems: { type: Array as PropType<DictItem[]>, default: () => [] },
  },
  setup(props) {
    return () => {
      const items = props.dictItems
      const item = items.find((i) => i.value === props.value)
      const label = item?.label ?? String(props.value ?? '')

      // 颜色查找：cellProps.colors > dict.color > 'info'
      let color = 'info'
      const colorsMap = props.cellProps.colors as Record<string, string> | undefined
      if (colorsMap && props.value !== undefined && props.value !== null) {
        const mapped = colorsMap[String(props.value)]
        if (mapped) color = mapped
      }
      if (color === 'info' && item?.color) {
        color = item.color
      }

      const ElTag = resolveComponent('ElTag')
      return h(ElTag, { type: color, size: 'small' }, () => label)
    }
  },
})

/** Status 渲染器（圆点 + 文字） */
export const StatusDisplay = defineComponent({
  name: 'StatusDisplay',
  props: {
    value: { type: [String, Number] as PropType<unknown>, default: '' },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    dictItems: { type: Array as PropType<DictItem[]>, default: () => [] },
  },
  setup(props) {
    return () => {
      const items = props.dictItems
      const item = items.find((i) => i.value === props.value)
      const label = item?.label ?? String(props.value ?? '')

      let color = 'info'
      const colorsMap = props.cellProps.colors as Record<string, string> | undefined
      if (colorsMap && props.value !== undefined && props.value !== null) {
        const mapped = colorsMap[String(props.value)]
        if (mapped) color = mapped
      }
      if (color === 'info' && item?.color) {
        color = item.color
      }

      const colorMap: Record<string, string> = {
        primary: '#409eff',
        success: '#67c23a',
        warning: '#e6a23c',
        danger: '#f56c6c',
        info: '#909399',
      }
      const dotColor = colorMap[color] ?? colorMap.info

      return h('span', { class: 'schemly-status-display' }, [
        h('span', {
          class: 'schemly-status-dot',
          style: {
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: dotColor,
            marginRight: '6px',
          },
        }),
        h('span', label),
      ])
    }
  },
})
