import { defineComponent, h, resolveComponent } from 'vue'
import type { PropType } from 'vue'

/** DatePicker 编辑器 */
export const DatePickerEditor = defineComponent({
  name: 'DatePickerEditor',
  props: {
    modelValue: { type: [String, Number, Date] as PropType<string | number | Date>, default: '' },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      const ElDatePicker = resolveComponent('ElDatePicker')
      const pickerType = (props.cellProps.pickerType as string) ?? 'date'
      const format = (props.cellProps.format as string) ?? 'YYYY-MM-DD'
      const valueFormat = (props.cellProps.valueFormat as string) ?? format

      return h(ElDatePicker, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': (val: unknown) => emit('update:modelValue', val),
        type: pickerType,
        format,
        valueFormat,
        disabled: props.disabled,
        clearable: true,
        style: { width: '100%' },
      })
    }
  },
})

/** DateRangePicker 编辑器 */
export const DateRangePickerEditor = defineComponent({
  name: 'DateRangePickerEditor',
  props: {
    modelValue: { type: [Array] as PropType<unknown[]>, default: () => [] },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      const ElDatePicker = resolveComponent('ElDatePicker')
      const format = (props.cellProps.format as string) ?? 'YYYY-MM-DD'
      const valueFormat = (props.cellProps.valueFormat as string) ?? format

      return h(ElDatePicker, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': (val: unknown) => emit('update:modelValue', val),
        type: 'daterange',
        format,
        valueFormat,
        rangeSeparator: '~',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        disabled: props.disabled,
        clearable: true,
        style: { width: '100%' },
      })
    }
  },
})

/** Switch 编辑器 */
export const SwitchEditor = defineComponent({
  name: 'SwitchEditor',
  props: {
    modelValue: { type: Boolean as PropType<boolean>, default: false },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      const ElSwitch = resolveComponent('ElSwitch')
      return h(ElSwitch, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': (val: unknown) => emit('update:modelValue', val),
        activeText: (props.cellProps.activeText as string) ?? '',
        inactiveText: (props.cellProps.inactiveText as string) ?? '',
        activeColor: props.cellProps.activeColor as string | undefined,
        disabled: props.disabled,
      })
    }
  },
})
