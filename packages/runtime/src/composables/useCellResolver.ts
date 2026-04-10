import { computed, type Ref } from 'vue'
import type { CellDeclaration, DictItem, Providers } from '@schemly/core'
import {
  resolveDisplayAs,
  resolveEditAs,
  isValidDisplayCombination,
  isValidEditCombination,
  parseOptionsPrefix,
  resolveDictItems,
  checkCellViewPermission,
  checkCellEditPermission,
} from '@schemly/core'
import type { FieldOverride } from '@schemly/core'

export interface ResolvedCell {
  cell: CellDeclaration
  displayAs: string
  editAs: string
  dictItems: DictItem[]
  viewVisible: boolean
  editMode: 'edit' | 'display' | 'hidden'
}

/**
 * 解析单个 Cell 的完整渲染信息
 */
export function useCellResolver(
  cell: CellDeclaration,
  schemaDicts: Record<string, DictItem[]>,
  providers: Providers,
  override?: FieldOverride,
): ResolvedCell {
  // Display
  let displayAs = resolveDisplayAs(cell)
  if (cell.displayAs && !isValidDisplayCombination(cell.cell, cell.displayAs)) {
    if (import.meta.env?.DEV) {
      console.warn(`[Schemly] displayAs "${cell.displayAs}" 与 cell "${cell.cell}" 不是合法组合，回退到默认`)
    }
    displayAs = resolveDisplayAs({ ...cell, displayAs: undefined })
  }

  // Edit
  const effectiveEditAs = override?.editAs ?? cell.editAs
  let editAs = resolveEditAs({ ...cell, editAs: effectiveEditAs })
  if (effectiveEditAs && !isValidEditCombination(cell.cell, effectiveEditAs)) {
    if (import.meta.env?.DEV) {
      console.warn(`[Schemly] editAs "${effectiveEditAs}" 与 cell "${cell.cell}" 不是合法组合，回退到默认`)
    }
    editAs = resolveEditAs({ ...cell, editAs: undefined })
  }

  // Dict
  let dictItems: DictItem[] = []
  const options = (cell.cellProps as { options?: string })?.options
  if (options) {
    const parsed = parseOptionsPrefix(options)
    if (parsed?.type === 'dict') {
      dictItems = resolveDictItems(parsed.key, schemaDicts, providers.dicts) ?? []
    }
  }

  // Permission
  const hasPermission = providers.auth?.hasPermission
  const viewVisible = checkCellViewPermission(cell, hasPermission, override)
  const editMode = checkCellEditPermission(cell, hasPermission, override)

  return { cell, displayAs, editAs, dictItems, viewVisible, editMode }
}
