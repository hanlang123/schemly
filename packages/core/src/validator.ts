import type {
  CellDeclaration,
  DataTableProps,
  DescriptionsProps,
  FormProps,
  SchemlySchema,
  ValidationIssue,
} from './types'
import { BUILT_IN_CELL_TYPES, VALID_DISPLAY_COMBINATIONS, VALID_EDIT_COMBINATIONS } from './constants'
import { getCustomCellType } from './registry'
import { parseOptionsPrefix } from './resolvers'

/**
 * 校验整个 schema，返回问题列表
 */
export function validateSchema(schema: SchemlySchema): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // 基本必填字段
  if (!schema.version) {
    issues.push({ severity: 'error', path: 'version', message: 'version 为必填字段' })
  }
  if (!schema.id) {
    issues.push({ severity: 'error', path: 'id', message: 'id 为必填字段' })
  }
  if (!schema.name) {
    issues.push({ severity: 'error', path: 'name', message: 'name 为必填字段' })
  }
  if (!schema.type) {
    issues.push({ severity: 'error', path: 'type', message: 'type 为必填字段' })
  }
  if (!['DataTable', 'Form', 'Descriptions'].includes(schema.type)) {
    issues.push({ severity: 'error', path: 'type', message: `无效的 type: ${schema.type}` })
  }
  if (!schema.props) {
    issues.push({ severity: 'error', path: 'props', message: 'props 为必填字段' })
    return issues
  }

  // 按 type 分别校验
  switch (schema.type) {
    case 'DataTable':
      validateDataTable(schema.props as DataTableProps, schema, issues)
      break
    case 'Form':
      validateForm(schema.props as FormProps, schema, issues)
      break
    case 'Descriptions':
      validateDescriptions(schema.props as DescriptionsProps, schema, issues)
      break
  }

  return issues
}

function validateCellDeclaration(
  cell: CellDeclaration,
  path: string,
  issues: ValidationIssue[],
): void {
  if (!cell.key) {
    issues.push({ severity: 'error', path: `${path}.key`, message: 'key 为必填字段' })
  }
  if (!cell.label) {
    issues.push({ severity: 'error', path: `${path}.label`, message: 'label 为必填字段' })
  }
  if (!cell.cell) {
    issues.push({ severity: 'error', path: `${path}.cell`, message: 'cell 为必填字段' })
    return
  }

  const isBuiltIn = (BUILT_IN_CELL_TYPES as readonly string[]).includes(cell.cell)
  const isCustom = !!getCustomCellType(cell.cell)
  if (!isBuiltIn && !isCustom) {
    issues.push({
      severity: 'warning',
      path: `${path}.cell`,
      message: `未知的 cell 类型: ${cell.cell}`,
    })
  }

  // displayAs 组合校验
  if (cell.displayAs && isBuiltIn) {
    const valid = VALID_DISPLAY_COMBINATIONS[cell.cell]
    if (valid && !valid.includes(cell.displayAs)) {
      issues.push({
        severity: 'warning',
        path: `${path}.displayAs`,
        message: `displayAs "${cell.displayAs}" 与 cell "${cell.cell}" 不是合法组合，将回退到默认渲染器`,
      })
    }
  }

  // editAs 组合校验
  if (cell.editAs && isBuiltIn) {
    const valid = VALID_EDIT_COMBINATIONS[cell.cell]
    if (valid && !valid.includes(cell.editAs)) {
      issues.push({
        severity: 'warning',
        path: `${path}.editAs`,
        message: `editAs "${cell.editAs}" 与 cell "${cell.cell}" 不是合法组合，将回退到默认渲染器`,
      })
    }
  }

  // enum 类型必须有 options
  if (cell.cell === 'enum') {
    const options = (cell.cellProps as { options?: string })?.options
    if (!options) {
      issues.push({
        severity: 'warning',
        path: `${path}.cellProps.options`,
        message: 'enum 类型建议配置 options',
      })
    }
  }
}

function validateDictReferences(
  cells: CellDeclaration[],
  schema: SchemlySchema,
  basePath: string,
  issues: ValidationIssue[],
): void {
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    const options = (cell.cellProps as { options?: string })?.options
    if (!options) continue

    const parsed = parseOptionsPrefix(options)
    if (!parsed) continue

    if (parsed.type === 'dict') {
      const hasDictInSchema = schema.dicts?.[parsed.key]
      if (!hasDictInSchema) {
        // 可能在 providers 中，只发 warning
        issues.push({
          severity: 'warning',
          path: `${basePath}[${i}].cellProps.options`,
          message: `字典 "${parsed.key}" 未在 schema.dicts 中定义，需要在 providers.dicts 中注入`,
        })
      }
    }
  }
}

function validateDataTable(
  props: DataTableProps,
  schema: SchemlySchema,
  issues: ValidationIssue[],
): void {
  if (!props.columns || props.columns.length === 0) {
    issues.push({ severity: 'error', path: 'props.columns', message: 'columns 不能为空' })
    return
  }

  // 检查 key 唯一性
  const keys = new Set<string>()
  for (let i = 0; i < props.columns.length; i++) {
    const col = props.columns[i]
    validateCellDeclaration(col, `props.columns[${i}]`, issues)
    if (col.key) {
      if (keys.has(col.key)) {
        issues.push({
          severity: 'error',
          path: `props.columns[${i}].key`,
          message: `重复的 key: ${col.key}`,
        })
      }
      keys.add(col.key)
    }
  }

  // 字典引用校验
  validateDictReferences(props.columns, schema, 'props.columns', issues)

  // createForm 字段引用校验
  if (props.createForm) {
    validateFormFieldReferences(props.createForm.fields, keys, 'props.createForm.fields', issues)
    validateFormOverrideReferences(props.createForm.overrides, keys, 'props.createForm.overrides', issues)
  }

  // updateForm 字段引用校验
  if (props.updateForm) {
    validateFormFieldReferences(props.updateForm.fields, keys, 'props.updateForm.fields', issues)
    validateFormOverrideReferences(props.updateForm.overrides, keys, 'props.updateForm.overrides', issues)
  }
}

function validateFormFieldReferences(
  fields: string[] | undefined,
  columnKeys: Set<string>,
  path: string,
  issues: ValidationIssue[],
): void {
  if (!fields) return
  for (const field of fields) {
    if (!columnKeys.has(field)) {
      issues.push({
        severity: 'warning',
        path,
        message: `引用了 "${field}" 但 columns 中不存在该字段`,
      })
    }
  }
}

function validateFormOverrideReferences(
  overrides: Record<string, unknown> | undefined,
  columnKeys: Set<string>,
  path: string,
  issues: ValidationIssue[],
): void {
  if (!overrides) return
  for (const key of Object.keys(overrides)) {
    if (!columnKeys.has(key)) {
      issues.push({
        severity: 'warning',
        path: `${path}.${key}`,
        message: `overrides 引用了 "${key}" 但 columns 中不存在该字段`,
      })
    }
  }
}

function validateForm(
  props: FormProps,
  schema: SchemlySchema,
  issues: ValidationIssue[],
): void {
  if (!props.fields || props.fields.length === 0) {
    issues.push({ severity: 'error', path: 'props.fields', message: 'fields 不能为空' })
    return
  }

  const keys = new Set<string>()
  for (let i = 0; i < props.fields.length; i++) {
    const field = props.fields[i]
    validateCellDeclaration(field, `props.fields[${i}]`, issues)
    if (field.key) {
      if (keys.has(field.key)) {
        issues.push({
          severity: 'error',
          path: `props.fields[${i}].key`,
          message: `重复的 key: ${field.key}`,
        })
      }
      keys.add(field.key)
    }
  }

  validateDictReferences(props.fields, schema, 'props.fields', issues)
}

function validateDescriptions(
  props: DescriptionsProps,
  schema: SchemlySchema,
  issues: ValidationIssue[],
): void {
  if (!props.items || props.items.length === 0) {
    issues.push({ severity: 'error', path: 'props.items', message: 'items 不能为空' })
    return
  }

  for (let i = 0; i < props.items.length; i++) {
    validateCellDeclaration(props.items[i], `props.items[${i}]`, issues)
  }

  validateDictReferences(props.items, schema, 'props.items', issues)
}
