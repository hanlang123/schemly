import { defineComponent, h, resolveComponent } from 'vue'
import type { PropType } from 'vue'

/** Input 编辑器 */
export const InputEditor = defineComponent({
  name: 'InputEditor',
  props: {
    modelValue: { type: [String, Number] as PropType<string | number>, default: '' },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      const ElInput = resolveComponent('ElInput')
      return h(ElInput, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': (val: unknown) => emit('update:modelValue', val),
        maxlength: props.cellProps.maxlength as number | undefined,
        placeholder: (props.cellProps.placeholder as string) ?? '',
        disabled: props.disabled,
        clearable: true,
      })
    }
  },
})

/** Textarea 编辑器 */
export const TextareaEditor = defineComponent({
  name: 'TextareaEditor',
  props: {
    modelValue: { type: [String] as PropType<string>, default: '' },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      const ElInput = resolveComponent('ElInput')
      return h(ElInput, {
        type: 'textarea',
        modelValue: props.modelValue,
        'onUpdate:modelValue': (val: unknown) => emit('update:modelValue', val),
        maxlength: props.cellProps.maxlength as number | undefined,
        placeholder: (props.cellProps.placeholder as string) ?? '',
        disabled: props.disabled,
        rows: 3,
        showWordLimit: !!props.cellProps.maxlength,
      })
    }
  },
})

/** InputNumber 编辑器 */
export const InputNumberEditor = defineComponent({
  name: 'InputNumberEditor',
  props: {
    modelValue: { type: [Number, String] as PropType<number | string | undefined>, default: undefined },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      const ElInputNumber = resolveComponent('ElInputNumber')
      return h(ElInputNumber, {
        modelValue: props.modelValue as number | undefined,
        'onUpdate:modelValue': (val: unknown) => emit('update:modelValue', val),
        precision: props.cellProps.precision as number | undefined,
        min: props.cellProps.min as number | undefined,
        max: props.cellProps.max as number | undefined,
        step: (props.cellProps.step as number) ?? 1,
        disabled: props.disabled,
        controlsPosition: 'right',
        style: { width: '100%' },
      })
    }
  },
})
