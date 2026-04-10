import { defineComponent, h, ref, resolveComponent, watch, onMounted } from 'vue'
import type { PropType } from 'vue'
import type { DictItem, Providers } from '@schemly/core'
import { parseOptionsPrefix } from '@schemly/core'

/** Select 编辑器（含远程搜索） */
export const SelectEditor = defineComponent({
  name: 'SelectEditor',
  props: {
    modelValue: { type: [String, Number, Array] as PropType<string | number | unknown[]>, default: undefined },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    dictItems: { type: Array as PropType<DictItem[]>, default: () => [] },
    providers: { type: Object as PropType<Providers>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const options = ref<{ label: string; value: unknown }[]>([])
    const loading = ref(false)

    const labelKey = () => (props.cellProps.labelKey as string) ?? 'label'
    const valueKey = () => (props.cellProps.valueKey as string) ?? 'value'

    const mapOptions = (data: Record<string, unknown>[]) =>
      data.map((item) => ({
        label: String(item[labelKey()] ?? ''),
        value: item[valueKey()],
      }))

    // 初始化 options
    const initOptions = async () => {
      const optionsStr = props.cellProps.options as string | undefined
      if (!optionsStr) {
        // 使用 dictItems
        options.value = props.dictItems.map((d) => ({ label: d.label, value: d.value }))
        return
      }

      const parsed = parseOptionsPrefix(optionsStr)
      if (!parsed) return

      if (parsed.type === 'dict') {
        options.value = props.dictItems.map((d) => ({ label: d.label, value: d.value }))
      } else if (parsed.type === 'api') {
        const fn = props.providers.functions?.[parsed.key]
        if (fn) {
          loading.value = true
          try {
            const data = await (fn as () => Promise<Record<string, unknown>[]>)()
            options.value = mapOptions(data)
          } finally {
            loading.value = false
          }
        }
      }
      // remote 类型不在初始化时加载
    }

    onMounted(initOptions)
    watch(() => props.dictItems, () => {
      const optionsStr = props.cellProps.options as string | undefined
      if (!optionsStr || optionsStr.startsWith('dict:')) {
        options.value = props.dictItems.map((d) => ({ label: d.label, value: d.value }))
      }
    })

    // 远程搜索
    const handleRemoteSearch = async (query: string) => {
      const optionsStr = props.cellProps.options as string | undefined
      if (!optionsStr) return
      const parsed = parseOptionsPrefix(optionsStr)
      if (!parsed || parsed.type !== 'remote') return

      const fn = props.providers.functions?.[parsed.key]
      if (!fn) return

      if (!query) {
        options.value = []
        return
      }

      loading.value = true
      try {
        const data = await (fn as (q: string) => Promise<Record<string, unknown>[]>)(query)
        options.value = mapOptions(data)
      } finally {
        loading.value = false
      }
    }

    return () => {
      const ElSelect = resolveComponent('ElSelect')
      const ElOption = resolveComponent('ElOption')

      const optionsStr = props.cellProps.options as string | undefined
      const isRemote = optionsStr?.startsWith('remote:')

      const selectProps: Record<string, unknown> = {
        modelValue: props.modelValue,
        'onUpdate:modelValue': (val: unknown) => emit('update:modelValue', val),
        disabled: props.disabled,
        clearable: true,
        loading: loading.value,
        multiple: props.multiple,
        style: { width: '100%' },
      }

      if (isRemote) {
        selectProps.filterable = true
        selectProps.remote = true
        selectProps.remoteMethod = handleRemoteSearch
      } else {
        selectProps.filterable = true
      }

      return h(ElSelect, selectProps, () =>
        options.value.map((opt) =>
          h(ElOption, { key: String(opt.value), label: opt.label, value: opt.value }),
        ),
      )
    }
  },
})

/** Radio 编辑器 */
export const RadioEditor = defineComponent({
  name: 'RadioEditor',
  props: {
    modelValue: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: undefined },
    dictItems: { type: Array as PropType<DictItem[]>, default: () => [] },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      const ElRadioGroup = resolveComponent('ElRadioGroup')
      const ElRadio = resolveComponent('ElRadio')

      return h(ElRadioGroup, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': (val: unknown) => emit('update:modelValue', val),
        disabled: props.disabled,
      }, () =>
        props.dictItems.map((item) =>
          h(ElRadio, { key: String(item.value), value: item.value }, () => item.label),
        ),
      )
    }
  },
})

/** Checkbox 编辑器（多选，值为数组） */
export const CheckboxEditor = defineComponent({
  name: 'CheckboxEditor',
  props: {
    modelValue: { type: Array as PropType<unknown[]>, default: () => [] },
    dictItems: { type: Array as PropType<DictItem[]>, default: () => [] },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      const ElCheckboxGroup = resolveComponent('ElCheckboxGroup')
      const ElCheckbox = resolveComponent('ElCheckbox')

      return h(ElCheckboxGroup, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': (val: unknown) => emit('update:modelValue', val),
        disabled: props.disabled,
      }, () =>
        props.dictItems.map((item) =>
          h(ElCheckbox, { key: String(item.value), value: item.value }, () => item.label),
        ),
      )
    }
  },
})
