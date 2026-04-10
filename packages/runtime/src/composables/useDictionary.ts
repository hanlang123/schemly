import { ref } from 'vue'
import type { DictItem, Providers } from '@schemly/core'
import { parseOptionsPrefix, resolveDictItems } from '@schemly/core'

/**
 * 字典管理 composable，负责 api 类型字典的缓存加载
 */
export function useDictionary(
  schemaDicts: Record<string, DictItem[]>,
  providers: Providers,
) {
  const cache = ref<Record<string, DictItem[]>>({})
  const loading = ref<Record<string, boolean>>({})

  /**
   * 获取字典数据（同步优先，异步缓存）
   */
  const getDictItems = (optionsStr: string): DictItem[] => {
    const parsed = parseOptionsPrefix(optionsStr)
    if (!parsed) return []

    if (parsed.type === 'dict') {
      return resolveDictItems(parsed.key, schemaDicts, providers.dicts) ?? []
    }

    if (parsed.type === 'api') {
      // 有缓存直接返回
      if (cache.value[parsed.key]) {
        return cache.value[parsed.key]
      }
      // 未加载则异步加载
      if (!loading.value[parsed.key]) {
        loadApiDict(parsed.key)
      }
      return []
    }

    // remote 类型不在这里处理
    return []
  }

  const loadApiDict = async (fnKey: string) => {
    const fn = providers.functions?.[fnKey]
    if (!fn) {
      if (import.meta.env?.DEV) {
        console.warn(`[Schemly] api 函数 "${fnKey}" 未在 providers.functions 中注入`)
      }
      return
    }

    loading.value[fnKey] = true
    try {
      const data = await (fn as () => Promise<Record<string, unknown>[]>)()
      // 默认使用 label/value 格式
      cache.value[fnKey] = data.map((item) => ({
        label: String(item.label ?? ''),
        value: (item.value ?? '') as string | number,
        color: item.color as string | undefined,
      }))
    } catch (e) {
      console.error(`[Schemly] 加载字典 "${fnKey}" 失败:`, e)
    } finally {
      loading.value[fnKey] = false
    }
  }

  /**
   * 批量预加载所有 api 字典
   */
  const preloadApiDicts = (optionsStrings: string[]) => {
    for (const str of optionsStrings) {
      const parsed = parseOptionsPrefix(str)
      if (parsed?.type === 'api' && !cache.value[parsed.key] && !loading.value[parsed.key]) {
        loadApiDict(parsed.key)
      }
    }
  }

  return { getDictItems, preloadApiDicts, cache, loading }
}
