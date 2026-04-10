import type {
  CellDeclaration,
  DataTableProps,
  DescriptionsProps,
  ExternalDeps,
  FormDialogConfig,
  FormProps,
  FunctionDep,
  FunctionDepType,
  PermissionDep,
  PermissionScope,
  SchemlySchema,
} from './types'
import { normalizePermission, parseOptionsPrefix } from './resolvers'

/**
 * 扫描 schema 自动生成 externalDeps
 */
export function generateExternalDeps(schema: SchemlySchema): ExternalDeps {
  const dicts = new Set<string>()
  const functionsMap = new Map<string, FunctionDep>()
  const permissionsMap = new Map<string, PermissionDep>()

  // Type 级权限
  if (schema.permission) {
    addPermission(permissionsMap, schema.permission, `查看${schema.name}`, 'type', schema.id)
  }

  switch (schema.type) {
    case 'DataTable':
      scanDataTable(schema.props as DataTableProps, schema, dicts, functionsMap, permissionsMap)
      break
    case 'Form':
      scanCells((schema.props as FormProps).fields, schema, dicts, functionsMap, permissionsMap)
      break
    case 'Descriptions':
      scanCells((schema.props as DescriptionsProps).items, schema, dicts, functionsMap, permissionsMap)
      break
  }

  return {
    dicts: Array.from(dicts),
    functions: Array.from(functionsMap.values()),
    permissions: Array.from(permissionsMap.values()),
  }
}

function scanDataTable(
  props: DataTableProps,
  schema: SchemlySchema,
  dicts: Set<string>,
  functionsMap: Map<string, FunctionDep>,
  permissionsMap: Map<string, PermissionDep>,
): void {
  // columns
  scanCells(props.columns, schema, dicts, functionsMap, permissionsMap)

  // toolbarActions
  if (props.toolbarActions) {
    for (const action of props.toolbarActions) {
      if (action.permission) {
        addPermission(permissionsMap, action.permission, action.label, 'action', action.key)
      }
    }
  }

  // rowActions
  if (props.rowActions) {
    for (const action of props.rowActions) {
      if (action.permission) {
        addPermission(permissionsMap, action.permission, action.label, 'action', action.key)
      }
    }
  }

  // createForm / updateForm
  if (props.createForm) {
    scanFormDialog(props.createForm, props.columns, permissionsMap, functionsMap)
  }
  if (props.updateForm) {
    scanFormDialog(props.updateForm, props.columns, permissionsMap, functionsMap)
  }
}

function scanCells(
  cells: CellDeclaration[],
  schema: SchemlySchema,
  dicts: Set<string>,
  functionsMap: Map<string, FunctionDep>,
  permissionsMap: Map<string, PermissionDep>,
): void {
  for (const cell of cells) {
    // Cell 级权限
    if (cell.permission) {
      const perm = normalizePermission(cell.permission)
      if (typeof perm.view === 'string') {
        addPermission(permissionsMap, perm.view, `查看${cell.label}`, 'cell:view', cell.key)
      }
      if (typeof perm.edit === 'string') {
        addPermission(permissionsMap, perm.edit, `编辑${cell.label}`, 'cell:edit', cell.key)
      }
    }

    // options 引用
    const options = (cell.cellProps as { options?: string })?.options
    if (options) {
      const parsed = parseOptionsPrefix(options)
      if (parsed) {
        if (parsed.type === 'dict') {
          // 不在 schema.dicts 中才算外部依赖
          if (!schema.dicts?.[parsed.key]) {
            dicts.add(parsed.key)
          }
        } else if (parsed.type === 'api') {
          addFunction(functionsMap, parsed.key, 'api', `获取${cell.label}数据`)
        } else if (parsed.type === 'remote') {
          addFunction(functionsMap, parsed.key, 'remote', `搜索${cell.label}`)
        }
      }
    }

    // 上传函数
    if (cell.cell === 'image') {
      const uploadFn = (cell.cellProps as { uploadFn?: string })?.uploadFn || 'uploadImage'
      addFunction(functionsMap, uploadFn, 'upload:image', '上传图片')
    }
    if (cell.cell === 'file') {
      const uploadFn = (cell.cellProps as { uploadFn?: string })?.uploadFn || 'uploadFile'
      addFunction(functionsMap, uploadFn, 'upload:file', '上传文件')
    }
  }
}

function scanFormDialog(
  form: FormDialogConfig,
  columns: CellDeclaration[],
  permissionsMap: Map<string, PermissionDep>,
  functionsMap: Map<string, FunctionDep>,
): void {
  // overrides 中的 permission
  if (form.overrides) {
    for (const [key, override] of Object.entries(form.overrides)) {
      if (override.permission) {
        const perm = normalizePermission(override.permission)
        const col = columns.find((c) => c.key === key)
        const label = col?.label ?? key
        if (typeof perm.view === 'string') {
          addPermission(permissionsMap, perm.view, `查看${label}`, 'cell:view', key)
        }
        if (typeof perm.edit === 'string') {
          addPermission(permissionsMap, perm.edit, `编辑${label}`, 'cell:edit', key)
        }
      }
    }
  }

  // rules 中的 validator
  if (form.rules) {
    for (const rules of Object.values(form.rules)) {
      for (const rule of rules) {
        if (rule.validator) {
          addFunction(functionsMap, rule.validator, 'validator', `${rule.validator} 校验`)
        }
      }
    }
  }
}

function addPermission(
  map: Map<string, PermissionDep>,
  code: string,
  name: string,
  scope: PermissionScope,
  target: string,
): void {
  if (!map.has(code)) {
    map.set(code, { code, name, scope, target })
  }
}

function addFunction(
  map: Map<string, FunctionDep>,
  key: string,
  type: FunctionDepType,
  description: string,
): void {
  if (!map.has(key)) {
    map.set(key, { key, type, description })
  }
}
