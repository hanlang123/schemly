import type { CustomCellTypeConfig, MigrationFn, SchemlySchema } from './types'

// ============ 自定义 Cell Type 注册 ============

const customCellTypes = new Map<string, CustomCellTypeConfig>()

export function registerCellType(name: string, config: CustomCellTypeConfig): void {
  customCellTypes.set(name, config)
}

export function getCustomCellType(name: string): CustomCellTypeConfig | undefined {
  return customCellTypes.get(name)
}

export function getRegisteredCellTypes(): Map<string, CustomCellTypeConfig> {
  return new Map(customCellTypes)
}

// ============ 自定义渲染器注册 ============

type DisplayRendererFn = (value: unknown, cellProps: Record<string, unknown>, row: Record<string, unknown>) => unknown
type EditRendererFn = (modelValue: unknown, cellProps: Record<string, unknown>, onChange: (value: unknown) => void) => unknown

const displayRenderers = new Map<string, DisplayRendererFn>()
const editRenderers = new Map<string, EditRendererFn>()

export function registerDisplayRenderer(name: string, fn: DisplayRendererFn): void {
  displayRenderers.set(name, fn)
}

export function getDisplayRenderer(name: string): DisplayRendererFn | undefined {
  return displayRenderers.get(name)
}

export function registerEditRenderer(name: string, fn: EditRendererFn): void {
  editRenderers.set(name, fn)
}

export function getEditRenderer(name: string): EditRendererFn | undefined {
  return editRenderers.get(name)
}

// ============ 版本迁移 ============

interface MigrationEntry {
  from: string
  to: string
  fn: MigrationFn
}

const migrations: MigrationEntry[] = []

export function registerMigration(from: string, to: string, fn: MigrationFn): void {
  migrations.push({ from, to, fn })
}

/**
 * 解析版本号 major.minor
 */
function parseVersion(version: string): { major: number; minor: number } {
  const [major, minor] = version.split('.').map(Number)
  return { major: major ?? 1, minor: minor ?? 0 }
}

/**
 * 比较版本号，返回 -1 / 0 / 1
 */
function compareVersions(a: string, b: string): number {
  const va = parseVersion(a)
  const vb = parseVersion(b)
  if (va.major !== vb.major) return va.major < vb.major ? -1 : 1
  if (va.minor !== vb.minor) return va.minor < vb.minor ? -1 : 1
  return 0
}

/**
 * 迁移 schema 到目标版本
 * 按 from 版本排序后链式执行
 */
export function migrateSchema(
  schema: SchemlySchema,
  targetVersion: string,
): SchemlySchema {
  const schemaVersion = schema.version || '1.0'

  if (compareVersions(schemaVersion, targetVersion) >= 0) {
    return schema
  }

  // 找出需要执行的迁移，按 from 版本排序
  const applicable = migrations
    .filter((m) => compareVersions(m.from, schemaVersion) >= 0 && compareVersions(m.to, targetVersion) <= 0)
    .sort((a, b) => compareVersions(a.from, b.from))

  let result = { ...schema }
  for (const migration of applicable) {
    result = migration.fn(result)
  }

  return result
}

/**
 * 检查 schema 版本兼容性
 */
export function checkVersionCompatibility(
  schemaVersion: string,
  runtimeVersion: string,
): 'compatible' | 'migrate' | 'incompatible' {
  const sv = parseVersion(schemaVersion || '1.0')
  const rv = parseVersion(runtimeVersion)

  if (sv.major === rv.major) return 'compatible'
  if (sv.major < rv.major) return 'migrate'
  return 'incompatible'
}

// ============ 重置（测试用） ============

export function resetRegistry(): void {
  customCellTypes.clear()
  displayRenderers.clear()
  editRenderers.clear()
  migrations.length = 0
}
