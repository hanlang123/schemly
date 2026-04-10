import type { CellType } from '@schemly/core'

interface InferredField {
  key: string
  label: string
  cell: CellType
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?/
const URL_RE = /^https?:\/\//

function inferCellType(key: string, value: unknown): CellType {
  if (value === null || value === undefined) return 'text'

  if (typeof value === 'boolean') return 'boolean'

  if (typeof value === 'number') {
    return 'number'
  }

  if (typeof value === 'string') {
    if (ISO_DATE_RE.test(value)) return 'datetime'
    if (URL_RE.test(value)) return 'link'
    return 'text'
  }

  if (Array.isArray(value)) {
    if (value.length > 0) {
      const first = value[0]
      if (typeof first === 'string' && URL_RE.test(first)) return 'image'
      if (typeof first === 'object' && first !== null && 'name' in first && 'url' in first) return 'file'
    }
    return 'text'
  }

  if (typeof value === 'object' && value !== null) {
    if ('name' in value && 'url' in value) return 'file'
    return 'text'
  }

  return 'text'
}

function keyToLabel(key: string): string {
  // camelCase → 中文友好的分词
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function inferFieldsFromData(data: Record<string, unknown>): InferredField[] {
  return Object.entries(data).map(([key, value]) => ({
    key,
    label: keyToLabel(key),
    cell: inferCellType(key, value),
  }))
}
