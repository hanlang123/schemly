import { describe, it, expect, vi } from 'vitest'
import { useDictionary } from '../composables/useDictionary'
import type { DictItem, Providers } from '@schemly/core'

describe('useDictionary', () => {
  const schemaDicts: Record<string, DictItem[]> = {
    status: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' },
    ],
  }

  it('通过 dict: 前缀获取 schema 字典', () => {
    const { getDictItems } = useDictionary(schemaDicts, {})
    const items = getDictItems('dict:status')
    expect(items).toHaveLength(2)
    expect(items[0].label).toBe('启用')
  })

  it('dict 不存在时返回空数组', () => {
    const { getDictItems } = useDictionary(schemaDicts, {})
    expect(getDictItems('dict:unknown')).toHaveLength(0)
  })

  it('无效前缀返回空数组', () => {
    const { getDictItems } = useDictionary(schemaDicts, {})
    expect(getDictItems('invalid')).toHaveLength(0)
  })

  it('remote: 前缀返回空数组 (不在 useDictionary 处理)', () => {
    const { getDictItems } = useDictionary(schemaDicts, {})
    expect(getDictItems('remote:searchUser')).toHaveLength(0)
  })

  it('api: 前缀首次返回空数组（异步加载）', () => {
    const providers: Providers = {
      functions: {
        fetchList: vi.fn().mockResolvedValue([
          { label: 'A', value: 'a' },
        ]),
      },
    }
    const { getDictItems } = useDictionary(schemaDicts, providers)
    const items = getDictItems('api:fetchList')
    expect(items).toHaveLength(0) // 首次异步未完成
  })

  it('api: 加载后有缓存', async () => {
    const providers: Providers = {
      functions: {
        fetchList: vi.fn().mockResolvedValue([
          { label: 'A', value: 'a' },
        ]),
      },
    }
    const { getDictItems, cache } = useDictionary(schemaDicts, providers)
    getDictItems('api:fetchList')
    // 等待异步
    await new Promise((r) => setTimeout(r, 10))
    expect(cache.value.fetchList).toHaveLength(1)
    // 再次获取应该有缓存
    const items = getDictItems('api:fetchList')
    expect(items).toHaveLength(1)
  })

  it('api: 函数不存在时不报错', () => {
    const { getDictItems } = useDictionary(schemaDicts, {})
    expect(getDictItems('api:unknown')).toHaveLength(0)
  })

  it('preloadApiDicts 批量预加载', async () => {
    const fn = vi.fn().mockResolvedValue([{ label: 'X', value: 'x' }])
    const providers: Providers = { functions: { load1: fn } }
    const { preloadApiDicts, cache } = useDictionary(schemaDicts, providers)
    preloadApiDicts(['api:load1', 'dict:status'])
    await new Promise((r) => setTimeout(r, 10))
    expect(fn).toHaveBeenCalledOnce()
    expect(cache.value.load1).toHaveLength(1)
  })

  it('api: 加载失败不崩溃', async () => {
    const providers: Providers = {
      functions: {
        broken: vi.fn().mockRejectedValue(new Error('fail')),
      },
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { getDictItems } = useDictionary(schemaDicts, providers)
    getDictItems('api:broken')
    await new Promise((r) => setTimeout(r, 10))
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
