<p align="center">
  <h1 align="center">Schemly</h1>
  <p align="center">Schema 驱动的 Vue 3 业务展示类库</p>
</p>

<p align="center">
  <a href="https://hanlang123.github.io/schemly/">📖 在线文档</a> ·
  <a href="https://github.com/hanlang123/schemly/issues">🐛 报告问题</a> ·
  <a href="https://github.com/hanlang123/schemly/issues">💡 功能建议</a>
</p>

---

## 简介

**Schemly** 是一个基于 **Vue 3 + Element Plus** 的 Schema 驱动业务展示类库，面向后台管理系统。通过一份 Schema 即可描述一个组件实例的完整展示行为——由 **Designer** 可视化产出，由 **Runtime** 消费渲染。

## ✨ 核心特性

- 🧩 **Cell 原子单元** — 11 种数据语义类型，自动推导 display / edit 双模态渲染器，大多数场景无需显式指定
- 📊 **三种布局容器** — DataTable 数据表格、Form 通用表单、Descriptions 描述列表，覆盖后台管理核心场景
- 🔐 **三级权限体系** — Type 级 → Action 级 → Cell 级，细粒度到单个字段的查看/编辑权限控制
- 📡 **灵活数据源** — 静态字典、动态接口、远程搜索三种模式，通过 `options` 前缀协议无缝切换
- 🎨 **可视化 Designer** — 面向开发者的 Schema 可视化编辑器，替代手写 JSON，实时预览与校验
- 🔌 **自定义扩展** — 可注册自定义 Cell 类型、展示渲染器、编辑渲染器，轻松扩展业务组件

## 📐 分层架构

```
Schema 协议层
├── Cell（原子单元，数据语义层）
│   ├── displayAs → 展示渲染器
│   └── editAs   → 编辑渲染器
├── Field = Cell + 表单行为（rules、disabled 等）
└── Type（布局容器，消费 Cell 或 Field）
    ├── DataTable — 表格列 + 内建增删改表单
    ├── Form      — 搜索、筛选、独立编辑等通用表单
    └── Descriptions — 详情描述列表
```

## 📦 Monorepo 结构

```
schemly/
├── packages/
│   ├── core/           # @schemly/core — Schema 类型定义、校验、工具函数
│   ├── runtime/        # @schemly/runtime — 运行时渲染引擎（Vue 3 组件）
│   └── designer/       # @schemly/designer — 可视化 Schema 编辑器
├── playground/         # 开发调试用 Playground
├── docs/               # VitePress 文档站点
└── package.json        # 根工作区配置
```

| 包名 | 说明 | 版本 |
|------|------|------|
| `@schemly/core` | Schema 协议类型、校验与工具函数 | 0.1.0 |
| `@schemly/runtime` | 运行时渲染引擎，消费 Schema 渲染 Vue 3 组件 | 0.1.0 |
| `@schemly/designer` | 可视化 Schema 编辑器 | 0.1.0 |

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18
- **pnpm** >= 8

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/hanlang123/schemly.git
cd schemly

# 安装所有依赖
pnpm install
```

### 常用命令

```bash
# 启动 Playground 开发服务器
pnpm dev

# 构建所有包
pnpm build

# 单独构建
pnpm build:core
pnpm build:runtime
pnpm build:designer

# 运行测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# 启动文档开发服务器
pnpm docs:dev

# 构建文档
pnpm docs:build
```

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | [Vue 3](https://vuejs.org/) |
| UI 组件库 | [Element Plus](https://element-plus.org/) |
| 构建工具 | [Vite](https://vitejs.dev/) |
| 包管理 | [pnpm](https://pnpm.io/)（Monorepo 工作区） |
| 文档 | [VitePress](https://vitepress.dev/) |
| 测试 | [Vitest](https://vitest.dev/) |
| 类型系统 | [TypeScript](https://www.typescriptlang.org/) |

## 📖 文档

完整文档已部署至 GitHub Pages：

👉 **[hanlang123.github.io/schemly](https://hanlang123.github.io/schemly/)**

文档涵盖：

- [概述 & 快速开始](https://hanlang123.github.io/schemly/guide/introduction)
- [Schema 协议](https://hanlang123.github.io/schemly/schema/top-level)
- [Type 协议](https://hanlang123.github.io/schemly/types/data-table)（DataTable / Form / Descriptions）
- [高级用法](https://hanlang123.github.io/schemly/advanced/external-deps)（外部依赖、Runtime 接口、自定义扩展）
- [Designer 设计规范](https://hanlang123.github.io/schemly/designer/)
- [TypeScript 类型 & 完整示例](https://hanlang123.github.io/schemly/reference/typescript)

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/my-feature`
3. 提交改动：`git commit -m 'feat: add some feature'`
4. 推送分支：`git push origin feat/my-feature`
5. 提交 Pull Request

## 📄 许可证

本项目基于 [MIT License](https://opensource.org/licenses/MIT) 开源。

Copyright © 2024-present Schemly Team
