# TypeScript 类型定义

## Cell 类型

```typescript
export type CellType =
  | 'text' | 'number' | 'currency' | 'enum' | 'boolean'
  | 'datetime' | 'dateRange' | 'image' | 'file' | 'link' | 'detail'

export type DisplayAs =
  | 'text' | 'number' | 'currency' | 'tag' | 'status' | 'date'
  | 'image' | 'file' | 'link' | 'copy' | 'progress' | 'detail'

export type EditAs =
  | 'input' | 'textarea' | 'inputNumber' | 'select' | 'radio' | 'checkbox'
  | 'datePicker' | 'dateRangePicker' | 'switch' | 'imageUpload' | 'fileUpload'

export interface CellDeclaration {
  key: string
  label: string
  cell: CellType
  cellProps?: Record<string, any>
  displayAs?: DisplayAs
  editAs?: EditAs
  permission?: string | { view?: string | boolean; edit?: string | boolean }
  column?: ColumnConfig
}
```

## Column 配置

```typescript
export interface ColumnConfig {
  width?: number
  minWidth?: number
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  resizable?: boolean
  showOverflowTooltip?: boolean
}
```

## cellProps 类型

```typescript
export interface TextCellProps {
  maxlength?: number
  placeholder?: string
  showOverflowTooltip?: boolean
}

export interface NumberCellProps {
  precision?: number
  thousandSep?: boolean
  min?: number
  max?: number
  step?: number
}

export interface CurrencyCellProps {
  precision?: number
  prefix?: string
  min?: number
  max?: number
}

export interface EnumCellProps {
  options?: string
  colors?: Record<string, string>
  labelKey?: string
  valueKey?: string
  displayLabelKey?: string
}

export interface BooleanCellProps {
  activeText?: string
  inactiveText?: string
  activeColor?: string
}

export interface DatetimeCellProps {
  format?: string
  valueFormat?: string
  pickerType?: 'date' | 'datetime' | 'month' | 'year'
}

export interface DateRangeCellProps {
  format?: string
  valueFormat?: string
  startKey?: string
  endKey?: string
}

export interface ImageCellProps {
  multiple?: boolean
  limit?: number
  width?: number
  height?: number
  preview?: boolean
  accept?: string
  maxSize?: number
  uploadFn?: string
}

export interface FileCellProps {
  multiple?: boolean
  limit?: number
  accept?: string
  maxSize?: number
  uploadFn?: string
}

export interface LinkCellProps {
  target?: string
  href?: string
}

export interface DetailCellProps {
  trigger?: 'button' | 'link'
  buttonText?: string
  mode?: 'text' | 'highlight'
  highlightKey?: string
  dialogTitle?: string
  dialogWidth?: string
}
```

## Schema 顶层

```typescript
export interface SchemlySchema {
  version: string
  id: string
  name: string
  type: 'DataTable' | 'Form' | 'Descriptions'
  permission?: string
  dicts?: Record<string, DictItem[]>
  externalDeps?: ExternalDeps
  props: DataTableProps | FormProps | DescriptionsProps
}

export interface DictItem {
  label: string
  value: string | number
  color?: string
}
```

## ExternalDeps

```typescript
export interface ExternalDeps {
  dicts?: string[]
  functions?: FunctionDep[]
  permissions?: PermissionDep[]
}

export interface FunctionDep {
  key: string
  type: 'api' | 'remote' | 'upload:image' | 'upload:file' | 'validator'
  description: string
}

export interface PermissionDep {
  code: string
  name: string
  scope: 'type' | 'cell:view' | 'cell:edit' | 'action'
  target: string
}
```

## DataTable Props

```typescript
export interface DataTableProps {
  columns: CellDeclaration[]
  pagination?: boolean | PaginationConfig
  selection?: SelectionConfig
  toolbarActions?: ToolbarAction[]
  rowActions?: RowAction[]
  rowActionStyle?: RowActionStyle
  createForm?: FormDialogConfig
  updateForm?: FormDialogConfig
}

export interface PaginationConfig {
  enabled?: boolean
  pageSize?: number
  pageSizes?: number[]
  layout?: string
}

export interface SelectionConfig {
  enabled?: boolean
  rowKey?: string
  selectable?: boolean | string
}

export interface ToolbarAction {
  key: string
  label: string
  permission?: string
  trigger?: string
  batch?: boolean
  confirm?: string
  icon?: string
}

export interface RowAction {
  key: string
  label: string
  permission?: string
  trigger?: string
  confirm?: string
  danger?: boolean
  icon?: string
}

export interface RowActionStyle {
  type?: 'link' | 'button'
  maxVisible?: number
  moreText?: string
}

export interface FormDialogConfig {
  title: string
  width?: string
  closeConfirm?: boolean
  keepAfterSubmit?: boolean
  layout?: FormLayout
  fields: string[]
  overrides?: Record<string, FieldOverride>
  rules?: Record<string, RuleItem[]>
}

export interface FormLayout {
  columns?: number
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
}

export interface FieldOverride {
  disabled?: boolean
  visible?: boolean
  cell?: CellType
  cellProps?: Record<string, any>
  editAs?: EditAs
  permission?: string | { view?: string | boolean; edit?: string | boolean }
  defaultValue?: any
  span?: number
}

export interface RuleItem {
  required?: boolean
  pattern?: string
  min?: number
  max?: number
  type?: string
  validator?: string
  message?: string
  trigger?: 'blur' | 'change'
}
```

## Form Props

```typescript
export interface FormProps {
  layout?: FormLayout & {
    collapsible?: boolean
    defaultCollapsed?: boolean
    visibleRows?: number
  }
  fields: FormFieldDeclaration[]
  buttons?: FormButtons
}

export interface FormFieldDeclaration extends CellDeclaration {
  rules?: RuleItem[]
  defaultValue?: any
  visible?: boolean
  disabled?: boolean
  span?: number
}

export interface FormButtons {
  submitText?: string
  resetText?: string
  showReset?: boolean
}
```

## Descriptions Props

```typescript
export interface DescriptionsProps {
  column?: number
  items: CellDeclaration[]
}
```

## Providers

```typescript
export interface Providers {
  dicts?: Record<string, DictItem[]>
  functions?: Record<string, Function>
  auth?: { hasPermission: (code: string) => boolean }
  actionControl?: (row: any) => Record<string, true | false | 'disabled'>
  toolbarControl?: () => Record<string, true | false | 'disabled'>
  formatters?: Record<string, (value: any) => string>
}
```
