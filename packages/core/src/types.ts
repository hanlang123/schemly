// ============ Cell 类型 ============

export type CellType =
  | 'text' | 'number' | 'currency' | 'enum' | 'boolean'
  | 'datetime' | 'dateRange' | 'image' | 'file' | 'link' | 'detail'

export type DisplayAs =
  | 'text' | 'number' | 'currency' | 'tag' | 'status' | 'date'
  | 'image' | 'file' | 'link' | 'copy' | 'progress' | 'detail'

export type EditAs =
  | 'input' | 'textarea' | 'inputNumber' | 'select' | 'radio' | 'checkbox'
  | 'datePicker' | 'dateRangePicker' | 'switch' | 'imageUpload' | 'fileUpload'

export type SchemaType = 'DataTable' | 'Form' | 'Descriptions'

// ============ CellProps 类型 ============

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

export type CellPropsMap = {
  text: TextCellProps
  number: NumberCellProps
  currency: CurrencyCellProps
  enum: EnumCellProps
  boolean: BooleanCellProps
  datetime: DatetimeCellProps
  dateRange: DateRangeCellProps
  image: ImageCellProps
  file: FileCellProps
  link: LinkCellProps
  detail: DetailCellProps
}

// ============ Column 配置 ============

export interface ColumnConfig {
  width?: number
  minWidth?: number
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  resizable?: boolean
  showOverflowTooltip?: boolean
}

// ============ Permission ============

export interface CellPermission {
  view?: string | boolean
  edit?: string | boolean
}

// ============ Cell 声明 ============

export interface CellDeclaration {
  key: string
  label: string
  cell: CellType
  cellProps?: Record<string, unknown>
  displayAs?: DisplayAs
  editAs?: EditAs
  permission?: string | CellPermission
  column?: ColumnConfig
}

// ============ 字典 ============

export interface DictItem {
  label: string
  value: string | number
  color?: string
}

// ============ ExternalDeps ============

export type FunctionDepType = 'api' | 'remote' | 'upload:image' | 'upload:file' | 'validator'

export interface FunctionDep {
  key: string
  type: FunctionDepType
  description: string
}

export type PermissionScope = 'type' | 'cell:view' | 'cell:edit' | 'action'

export interface PermissionDep {
  code: string
  name: string
  scope: PermissionScope
  target: string
}

export interface ExternalDeps {
  dicts?: string[]
  functions?: FunctionDep[]
  permissions?: PermissionDep[]
}

// ============ Actions ============

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

// ============ Form 相关 ============

export interface FormLayout {
  columns?: number
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
}

export interface FormLayoutExtended extends FormLayout {
  collapsible?: boolean
  defaultCollapsed?: boolean
  visibleRows?: number
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

export interface FieldOverride {
  disabled?: boolean
  visible?: boolean
  cell?: CellType
  cellProps?: Record<string, unknown>
  editAs?: EditAs
  permission?: string | CellPermission
  defaultValue?: unknown
  span?: number
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

export interface FormButtons {
  submitText?: string
  resetText?: string
  showReset?: boolean
}

// ============ Form Field 声明 ============

export interface FormFieldDeclaration extends CellDeclaration {
  rules?: RuleItem[]
  defaultValue?: unknown
  visible?: boolean
  disabled?: boolean
  span?: number
}

// ============ Pagination / Selection ============

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

// ============ Type Props ============

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

export interface FormProps {
  layout?: FormLayoutExtended
  fields: FormFieldDeclaration[]
  buttons?: FormButtons
}

export interface DescriptionsProps {
  column?: number
  items: CellDeclaration[]
}

// ============ Schema 顶层 ============

export interface SchemlySchema {
  version: string
  id: string
  name: string
  type: SchemaType
  permission?: string
  dicts?: Record<string, DictItem[]>
  externalDeps?: ExternalDeps
  props: DataTableProps | FormProps | DescriptionsProps
}

// ============ Providers ============

export type ActionControlResult = Record<string, true | false | 'disabled'>

export interface Providers {
  dicts?: Record<string, DictItem[]>
  functions?: Record<string, (...args: unknown[]) => unknown>
  auth?: { hasPermission: (code: string) => boolean }
  actionControl?: (row: Record<string, unknown>) => ActionControlResult
  toolbarControl?: () => ActionControlResult
  formatters?: Record<string, (value: unknown) => string>
}

// ============ 事件 Payload ============

export interface ActionPayload {
  key: string
  row?: Record<string, unknown>
  rows?: Record<string, unknown>[]
}

export interface CreateSubmitPayload {
  values: Record<string, unknown>
}

export interface UpdateSubmitPayload {
  values: Record<string, unknown>
  row: Record<string, unknown>
}

export interface SortChangePayload {
  key: string
  order: 'ascending' | 'descending' | null
}

export interface PageChangePayload {
  page: number
  pageSize: number
}

export interface SelectionChangePayload {
  rows: Record<string, unknown>[]
}

export interface DeniedPayload {
  permission: string
}

// ============ 迁移 ============

export type MigrationFn = (schema: SchemlySchema) => SchemlySchema

// ============ 自定义扩展 ============

export interface CustomCellTypeConfig {
  defaultDisplayAs: string
  defaultEditAs: string
}

// ============ 校验结果 ============

export type ValidationSeverity = 'error' | 'warning'

export interface ValidationIssue {
  severity: ValidationSeverity
  path: string
  message: string
}
