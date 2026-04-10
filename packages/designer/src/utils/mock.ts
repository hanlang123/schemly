import type { CellType } from '@schemly/core'

/** 根据 cell 类型自动生成 mock 值 */
export const generateMockValue = (cellType: CellType, key: string, index: number): unknown => {
  switch (cellType) {
    case 'text': return `${key}-${index + 1}`
    case 'number': return 1234 + index * 111
    case 'currency': return 9999.0 + index * 100
    case 'enum': return 'pending'
    case 'boolean': return index % 2 === 0
    case 'datetime': return '2024-01-15 10:30:00'
    case 'dateRange': return ['2024-01-01', '2024-01-31']
    case 'image': return 'https://via.placeholder.com/100'
    case 'file': return { name: '示例文件.pdf', url: '#', size: 1024000 }
    case 'link': return 'https://example.com'
    case 'detail': return '这是一段详情内容的示例文本，用于展示详情弹窗效果...'
    default: return '—'
  }
}
