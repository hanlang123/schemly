import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Schemly',
  description: 'Schema 驱动的 Vue 3 业务展示类库',
  lang: 'zh-CN',
  base: '/schemly/',

  head: [
    ['meta', { name: 'keywords', content: 'schemly, vue3, schema, low-code, element-plus, 低代码' }],
    ['meta', { name: 'author', content: 'Schemly Team' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Schemly',

    nav: [
      { text: '指南', link: '/guide/introduction', activeMatch: '/guide/' },
      { text: 'Schema 协议', link: '/schema/top-level', activeMatch: '/schema/' },
      { text: 'Type 协议', link: '/types/data-table', activeMatch: '/types/' },
      { text: '高级', link: '/advanced/external-deps', activeMatch: '/advanced/' },
      { text: 'Designer', link: '/designer/', activeMatch: '/designer/' },
      { text: '参考', link: '/reference/typescript', activeMatch: '/reference/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '概述', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '工程架构', link: '/guide/architecture' },
          ],
        },
      ],
      '/schema/': [
        {
          text: 'Schema 协议',
          items: [
            { text: '顶层结构', link: '/schema/top-level' },
            { text: 'Cell 体系', link: '/schema/cell' },
            { text: '展示渲染器', link: '/schema/display-renderers' },
            { text: '编辑渲染器', link: '/schema/edit-renderers' },
            { text: '数据源与字典', link: '/schema/data-source' },
            { text: '权限体系', link: '/schema/permission' },
          ],
        },
      ],
      '/types/': [
        {
          text: 'Type 协议',
          items: [
            { text: 'DataTable', link: '/types/data-table' },
            { text: 'Form', link: '/types/form' },
            { text: 'Descriptions', link: '/types/descriptions' },
          ],
        },
      ],
      '/advanced/': [
        {
          text: '高级',
          items: [
            { text: '外部依赖声明', link: '/advanced/external-deps' },
            { text: 'Runtime 接口', link: '/advanced/runtime' },
            { text: '自定义扩展', link: '/advanced/custom-extension' },
            { text: '版本迁移', link: '/advanced/migration' },
          ],
        },
      ],
      '/designer/': [
        {
          text: 'Designer',
          items: [
            { text: '设计规范', link: '/designer/' },
          ],
        },
      ],
      '/reference/': [
        {
          text: '参考',
          items: [
            { text: 'TypeScript 类型', link: '/reference/typescript' },
            { text: '完整示例', link: '/reference/examples' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/user/schemly' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Schemly Team',
    },

    outline: {
      level: [2, 3],
      label: '本页目录',
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '未找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    lastUpdated: {
      text: '最后更新于',
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
  },
})
