import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'
import dayjs from 'dayjs'

/** 日期渲染器 */
export const DateDisplay = defineComponent({
  name: 'DateDisplay',
  props: {
    value: { type: [String, Number, Array] as PropType<string | number | string[]>, default: '' },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const format = (props.cellProps.format as string) ?? 'YYYY-MM-DD HH:mm:ss'

      // dateRange: array
      if (Array.isArray(props.value)) {
        const formatted = props.value
          .map((v) => {
            if (!v) return ''
            return dayjs(v as string).format(format)
          })
          .join(' ~ ')
        return h('span', { class: 'schemly-date-display' }, formatted)
      }

      if (!props.value) return h('span', { class: 'schemly-date-display' }, '')
      const formatted = dayjs(props.value as string).format(format)
      return h('span', { class: 'schemly-date-display' }, formatted)
    }
  },
})
