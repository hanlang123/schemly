import type { CellType, DisplayAs, EditAs } from './types'

// Cell → 默认 displayAs 映射
export const DEFAULT_DISPLAY_AS: Record<CellType, DisplayAs> = {
  text: 'text',
  number: 'number',
  currency: 'currency',
  enum: 'tag',
  boolean: 'text',
  datetime: 'date',
  dateRange: 'date',
  image: 'image',
  file: 'file',
  link: 'link',
  detail: 'detail',
}

// Cell → 默认 editAs 映射
export const DEFAULT_EDIT_AS: Record<CellType, EditAs> = {
  text: 'input',
  number: 'inputNumber',
  currency: 'inputNumber',
  enum: 'select',
  boolean: 'switch',
  datetime: 'datePicker',
  dateRange: 'dateRangePicker',
  image: 'imageUpload',
  file: 'fileUpload',
  link: 'input',
  detail: 'textarea',
}

// 合法的 displayAs 覆盖组合矩阵
export const VALID_DISPLAY_COMBINATIONS: Record<CellType, readonly DisplayAs[]> = {
  text: ['text', 'link', 'copy', 'detail'],
  number: ['text', 'number', 'currency', 'copy', 'progress'],
  currency: ['text', 'number', 'currency', 'copy'],
  enum: ['text', 'tag', 'status'],
  boolean: ['text', 'tag', 'status'],
  datetime: ['text', 'date', 'copy'],
  dateRange: ['text', 'date'],
  image: ['image', 'link'],
  file: ['file', 'link'],
  link: ['text', 'link', 'copy'],
  detail: ['text', 'detail'],
}

// 合法的 editAs 覆盖组合矩阵
export const VALID_EDIT_COMBINATIONS: Record<CellType, readonly EditAs[]> = {
  text: ['input', 'textarea'],
  number: ['inputNumber'],
  currency: ['inputNumber'],
  enum: ['select', 'radio', 'checkbox'],
  boolean: ['radio', 'switch'],
  datetime: ['datePicker'],
  dateRange: ['dateRangePicker'],
  image: ['imageUpload'],
  file: ['fileUpload'],
  link: ['input'],
  detail: ['textarea'],
}

// 所有内置 cell 类型
export const BUILT_IN_CELL_TYPES: readonly CellType[] = [
  'text', 'number', 'currency', 'enum', 'boolean',
  'datetime', 'dateRange', 'image', 'file', 'link', 'detail',
]

// options 前缀
export const OPTIONS_PREFIX = {
  DICT: 'dict:',
  API: 'api:',
  REMOTE: 'remote:',
} as const

// 默认分页配置
export const DEFAULT_PAGINATION = {
  enabled: true,
  pageSize: 20,
  pageSizes: [10, 20, 50, 100] as readonly number[],
  layout: 'total, sizes, prev, pager, next, jumper',
} as const

// 默认 selection 配置
export const DEFAULT_SELECTION = {
  enabled: false,
  rowKey: 'id',
  selectable: true as boolean | string,
} as const

// 默认 rowActionStyle
export const DEFAULT_ROW_ACTION_STYLE = {
  type: 'link' as const,
  maxVisible: 3,
  moreText: '更多',
} as const

// 默认 FormLayout
export const DEFAULT_FORM_LAYOUT = {
  columns: 1,
  labelWidth: 'auto',
  labelPosition: 'right' as const,
} as const

// 默认 FormButtons
export const DEFAULT_FORM_BUTTONS = {
  submitText: '提交',
  resetText: '重置',
  showReset: true,
} as const

// schema 版本
export const CURRENT_SCHEMA_VERSION = '1.0'
