import { defineComponent, h, ref, resolveComponent } from 'vue'
import type { PropType } from 'vue'
import type { Providers } from '@schemly/core'

/** ImageUpload 编辑器 */
export const ImageUploadEditor = defineComponent({
  name: 'ImageUploadEditor',
  props: {
    modelValue: { type: [String, Array] as PropType<unknown>, default: undefined },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    providers: { type: Object as PropType<Providers>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const uploading = ref(false)

    const isMultiple = () => (props.cellProps.multiple as boolean) ?? false
    const limit = () => props.cellProps.limit as number | undefined
    const accept = () => (props.cellProps.accept as string) ?? 'image/*'
    const maxSize = () => props.cellProps.maxSize as number | undefined
    const uploadFnKey = () => (props.cellProps.uploadFn as string) ?? 'uploadImage'

    const getFileList = () => {
      if (!props.modelValue) return []
      const urls = Array.isArray(props.modelValue) ? props.modelValue as string[] : [String(props.modelValue)]
      return urls.map((url, i) => ({ name: `image-${i}`, url }))
    }

    const handleUpload = async (params: { file: File }) => {
      const fn = props.providers.functions?.[uploadFnKey()]
      if (!fn) {
        console.warn(`[Schemly] 上传函数 "${uploadFnKey()}" 未在 providers.functions 中注入`)
        return
      }

      const ms = maxSize()
      if (ms && params.file.size > ms * 1024 * 1024) {
        console.warn(`[Schemly] 文件大小超过限制 ${ms}MB`)
        return
      }

      uploading.value = true
      try {
        const url = await (fn as (file: File) => Promise<string>)(params.file)
        if (isMultiple()) {
          const current = Array.isArray(props.modelValue) ? [...props.modelValue as string[]] : []
          emit('update:modelValue', [...current, url])
        } else {
          emit('update:modelValue', url)
        }
      } finally {
        uploading.value = false
      }
    }

    const handleRemove = (file: { url?: string }) => {
      if (isMultiple()) {
        const current = Array.isArray(props.modelValue) ? [...props.modelValue as string[]] : []
        emit('update:modelValue', current.filter((u) => u !== file.url))
      } else {
        emit('update:modelValue', '')
      }
    }

    return () => {
      const ElUpload = resolveComponent('ElUpload')
      const ElIcon = resolveComponent('ElIcon')

      return h(ElUpload, {
        fileList: getFileList(),
        listType: 'picture-card',
        accept: accept(),
        limit: limit(),
        disabled: props.disabled || uploading.value,
        httpRequest: handleUpload,
        onRemove: handleRemove,
        autoUpload: true,
      }, () => h('span', { style: { fontSize: '20px' } }, '+'))
    }
  },
})

/** FileUpload 编辑器 */
export const FileUploadEditor = defineComponent({
  name: 'FileUploadEditor',
  props: {
    modelValue: { type: [Object, Array] as PropType<unknown>, default: undefined },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    providers: { type: Object as PropType<Providers>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const uploading = ref(false)

    type FileItem = { name: string; url: string; size?: number }

    const isMultiple = () => (props.cellProps.multiple as boolean) ?? false
    const limit = () => props.cellProps.limit as number | undefined
    const accept = () => (props.cellProps.accept as string) ?? '*'
    const maxSize = () => props.cellProps.maxSize as number | undefined
    const uploadFnKey = () => (props.cellProps.uploadFn as string) ?? 'uploadFile'

    const getFileList = () => {
      if (!props.modelValue) return []
      const files: FileItem[] = Array.isArray(props.modelValue)
        ? props.modelValue as FileItem[]
        : [props.modelValue as FileItem]
      return files.map((f) => ({ name: f.name, url: f.url }))
    }

    const handleUpload = async (params: { file: File }) => {
      const fn = props.providers.functions?.[uploadFnKey()]
      if (!fn) {
        console.warn(`[Schemly] 上传函数 "${uploadFnKey()}" 未在 providers.functions 中注入`)
        return
      }

      const ms = maxSize()
      if (ms && params.file.size > ms * 1024 * 1024) {
        console.warn(`[Schemly] 文件大小超过限制 ${ms}MB`)
        return
      }

      uploading.value = true
      try {
        const result = await (fn as (file: File) => Promise<FileItem>)(params.file)
        if (isMultiple()) {
          const current: FileItem[] = Array.isArray(props.modelValue) ? [...props.modelValue as FileItem[]] : []
          emit('update:modelValue', [...current, result])
        } else {
          emit('update:modelValue', result)
        }
      } finally {
        uploading.value = false
      }
    }

    const handleRemove = (file: { url?: string }) => {
      if (isMultiple()) {
        const current: FileItem[] = Array.isArray(props.modelValue) ? [...props.modelValue as FileItem[]] : []
        emit('update:modelValue', current.filter((f) => f.url !== file.url))
      } else {
        emit('update:modelValue', null)
      }
    }

    return () => {
      const ElUpload = resolveComponent('ElUpload')
      const ElButton = resolveComponent('ElButton')

      return h(ElUpload, {
        fileList: getFileList(),
        accept: accept(),
        limit: limit(),
        disabled: props.disabled || uploading.value,
        httpRequest: handleUpload,
        onRemove: handleRemove,
        autoUpload: true,
        multiple: isMultiple(),
      }, () => h(ElButton, { type: 'primary', size: 'small', loading: uploading.value }, () => '上传文件'))
    }
  },
})
