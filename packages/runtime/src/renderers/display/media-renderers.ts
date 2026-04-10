import { defineComponent, h, ref, resolveComponent } from 'vue'
import type { PropType } from 'vue'

/** 图片渲染器 */
export const ImageDisplay = defineComponent({
  name: 'ImageDisplay',
  props: {
    value: { type: [String, Array] as PropType<string | string[]>, default: '' },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const width = (props.cellProps.width as number) ?? 60
      const height = (props.cellProps.height as number) ?? 60
      const preview = (props.cellProps.preview as boolean) ?? true

      const urls: string[] = Array.isArray(props.value) ? props.value as string[] : (props.value ? [String(props.value)] : [])

      if (urls.length === 0) {
        return h('span', { class: 'schemly-image-display' }, '—')
      }

      const ElImage = resolveComponent('ElImage')
      return h('div', {
        class: 'schemly-image-display',
        style: { display: 'flex', gap: '4px', overflow: 'auto' },
      }, urls.map((url, i) =>
        h(ElImage, {
          key: i,
          src: url,
          style: { width: `${width}px`, height: `${height}px`, flexShrink: 0 },
          fit: 'cover',
          previewSrcList: preview ? urls : undefined,
          initialIndex: i,
          previewTeleported: true,
        }),
      ))
    }
  },
})

/** 文件渲染器 */
export const FileDisplay = defineComponent({
  name: 'FileDisplay',
  props: {
    value: { type: [Object, Array] as PropType<Record<string, unknown> | Record<string, unknown>[] | null>, default: null },
  },
  setup(props) {
    return () => {
      type FileItem = { name: string; url: string; size?: number }
      const files: FileItem[] = Array.isArray(props.value)
        ? props.value as FileItem[]
        : (props.value ? [props.value as FileItem] : [])

      if (files.length === 0) {
        return h('span', { class: 'schemly-file-display' }, '—')
      }

      const ElLink = resolveComponent('ElLink')
      return h('div', { class: 'schemly-file-display' }, files.map((file, i) =>
        h('div', { key: i, style: { marginBottom: '2px' } }, [
          h(ElLink, { href: file.url, target: '_blank', type: 'primary', underline: true }, () => [
            h('span', '📎 '),
            h('span', file.name || '文件'),
          ]),
        ]),
      ))
    }
  },
})
