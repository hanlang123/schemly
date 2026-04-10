import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'

/** 纯文本渲染器 */
export const TextDisplay = defineComponent({
  name: 'TextDisplay',
  props: {
    value: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: '' },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const val = props.value ?? ''
      return h('span', { class: 'schemly-text-display' }, String(val))
    }
  },
})

/** 数字渲染器（千分位格式化） */
export const NumberDisplay = defineComponent({
  name: 'NumberDisplay',
  props: {
    value: { type: [Number, String] as PropType<number | string>, default: 0 },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const num = Number(props.value)
      if (isNaN(num)) return h('span', { class: 'schemly-number-display' }, String(props.value))

      const precision = (props.cellProps.precision as number) ?? 0
      const thousandSep = (props.cellProps.thousandSep as boolean) ?? true
      let formatted = num.toFixed(precision)
      if (thousandSep) {
        const parts = formatted.split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        formatted = parts.join('.')
      }
      return h('span', { class: 'schemly-number-display' }, formatted)
    }
  },
})

/** 货币渲染器 */
export const CurrencyDisplay = defineComponent({
  name: 'CurrencyDisplay',
  props: {
    value: { type: [Number, String] as PropType<number | string>, default: 0 },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const num = Number(props.value)
      if (isNaN(num)) return h('span', { class: 'schemly-currency-display' }, String(props.value))

      const precision = (props.cellProps.precision as number) ?? 2
      const prefix = (props.cellProps.prefix as string) ?? '¥'
      const parts = num.toFixed(precision).split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return h('span', { class: 'schemly-currency-display' }, `${prefix}${parts.join('.')}`)
    }
  },
})
