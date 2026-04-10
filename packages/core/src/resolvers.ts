import type {
  CellDeclaration,
  CellPermission,
  CellType,
  DictItem,
  DisplayAs,
  EditAs,
  FieldOverride,
  Providers,
  SchemlySchema,
} from './types'
import {
  DEFAULT_DISPLAY_AS,
  DEFAULT_EDIT_AS,
  OPTIONS_PREFIX,
  VALID_DISPLAY_COMBINATIONS,
  VALID_EDIT_COMBINATIONS,
} from './constants'
import { getCustomCellType } from './registry'

// ============ Cell 解析 ============

/**
 * 解析 Cell 的 displayAs，考虑自定义类型和 enum 远程搜索降级
 */
export function resolveDisplayAs(cell: CellDeclaration): DisplayAs {
  if (cell.displayAs) {
    return cell.displayAs
  }

  // enum 远程搜索降级为 text
  if (cell.cell === 'enum') {
    const options = (cell.cellProps as { options?: string })?.options
    if (options && options.startsWith(OPTIONS_PREFIX.REMOTE)) {
      return 'text'
    }
  }

  // 内置类型
  const builtIn = DEFAULT_DISPLAY_AS[cell.cell]
  if (builtIn) {
    return builtIn
  }

  // 自定义类型
  const custom = getCustomCellType(cell.cell)
  if (custom) {
    return custom.defaultDisplayAs as DisplayAs
  }

  return 'text'
}

/**
 * 解析 Cell 的 editAs，考虑自定义类型
 */
export function resolveEditAs(cell: CellDeclaration): EditAs {
  if (cell.editAs) {
    return cell.editAs
  }

  const builtIn = DEFAULT_EDIT_AS[cell.cell]
  if (builtIn) {
    return builtIn
  }

  const custom = getCustomCellType(cell.cell)
  if (custom) {
    return custom.defaultEditAs as EditAs
  }

  return 'input'
}

/**
 * 检查 displayAs 组合是否合法
 */
export function isValidDisplayCombination(cellType: CellType, displayAs: DisplayAs): boolean {
  const valid = VALID_DISPLAY_COMBINATIONS[cellType]
  if (!valid) return true // 自定义类型不做校验
  return valid.includes(displayAs)
}

/**
 * 检查 editAs 组合是否合法
 */
export function isValidEditCombination(cellType: CellType, editAs: EditAs): boolean {
  const valid = VALID_EDIT_COMBINATIONS[cellType]
  if (!valid) return true
  return valid.includes(editAs)
}

// ============ 权限解析 ============

/**
 * 规范化 permission 声明为 CellPermission 对象
 */
export function normalizePermission(
  permission?: string | CellPermission,
): CellPermission {
  if (permission === undefined || permission === null) {
    return { view: true, edit: true }
  }
  if (typeof permission === 'string') {
    return { view: permission, edit: permission }
  }
  return {
    view: permission.view ?? true,
    edit: permission.edit ?? true,
  }
}

/**
 * 合并 form overrides 中的 permission 覆盖（overrides 优先）
 */
export function mergeFieldPermission(
  cellPermission: CellPermission,
  override?: FieldOverride,
): CellPermission {
  if (!override?.permission) {
    return cellPermission
  }
  const overrideNorm = normalizePermission(override.permission)
  return { ...cellPermission, ...overrideNorm }
}

/**
 * 判断是否有权限
 */
export function checkPermission(
  code: string | boolean,
  hasPermission?: (code: string) => boolean,
): boolean {
  if (typeof code === 'boolean') return code
  if (!hasPermission) return true
  return hasPermission(code)
}

/**
 * Cell 级 display 模式权限判定
 * 返回 true 表示可渲染
 */
export function checkCellViewPermission(
  cell: CellDeclaration,
  hasPermission?: (code: string) => boolean,
  override?: FieldOverride,
): boolean {
  const perm = mergeFieldPermission(normalizePermission(cell.permission), override)
  return checkPermission(perm.view ?? true, hasPermission)
}

/**
 * Cell 级 edit 模式权限判定
 * 返回 'edit' | 'display' | 'hidden'
 */
export function checkCellEditPermission(
  cell: CellDeclaration,
  hasPermission?: (code: string) => boolean,
  override?: FieldOverride,
): 'edit' | 'display' | 'hidden' {
  const perm = mergeFieldPermission(normalizePermission(cell.permission), override)

  // 先检查 view 权限
  if (!checkPermission(perm.view ?? true, hasPermission)) {
    return 'hidden'
  }

  // 再检查 edit 权限
  if (!checkPermission(perm.edit ?? true, hasPermission)) {
    return 'display'
  }

  return 'edit'
}

// ============ 字典解析 ============

/**
 * 解析 options 前缀，返回类型和 key
 */
export function parseOptionsPrefix(options: string): {
  type: 'dict' | 'api' | 'remote'
  key: string
} | null {
  if (options.startsWith(OPTIONS_PREFIX.DICT)) {
    return { type: 'dict', key: options.slice(OPTIONS_PREFIX.DICT.length) }
  }
  if (options.startsWith(OPTIONS_PREFIX.API)) {
    return { type: 'api', key: options.slice(OPTIONS_PREFIX.API.length) }
  }
  if (options.startsWith(OPTIONS_PREFIX.REMOTE)) {
    return { type: 'remote', key: options.slice(OPTIONS_PREFIX.REMOTE.length) }
  }
  return null
}

/**
 * 解析字典数据，按优先级查找：schema.dicts → providers.dicts
 */
export function resolveDictItems(
  dictKey: string,
  schemaDicts?: Record<string, DictItem[]>,
  providerDicts?: Record<string, DictItem[]>,
): DictItem[] | null {
  // 优先 schema.dicts
  if (schemaDicts?.[dictKey]) {
    return schemaDicts[dictKey]
  }
  // 其次 providers.dicts
  if (providerDicts?.[dictKey]) {
    return providerDicts[dictKey]
  }
  return null
}

/**
 * 从字典项中查找 label
 */
export function findDictLabel(
  value: unknown,
  items: DictItem[],
): string | undefined {
  const item = items.find((i) => i.value === value)
  return item?.label
}

/**
 * 从字典项中查找 color
 */
export function findDictColor(
  value: unknown,
  items: DictItem[],
  colorsMap?: Record<string, string>,
): string {
  // 优先 cellProps.colors
  if (colorsMap && value !== undefined && value !== null) {
    const color = colorsMap[String(value)]
    if (color) return color
  }
  // 其次 dict 项中的 color
  const item = items.find((i) => i.value === value)
  if (item?.color) return item.color
  // 默认
  return 'info'
}

// ============ Schema 解析 ============

/**
 * 解析 schema，填充默认值
 */
export function parseSchema(schema: SchemlySchema): SchemlySchema {
  return {
    ...schema,
    version: schema.version || '1.0',
    dicts: schema.dicts ?? {},
    externalDeps: schema.externalDeps ?? { dicts: [], functions: [], permissions: [] },
  }
}
