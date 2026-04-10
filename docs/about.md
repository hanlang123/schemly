# 关于 Schemly

## 项目简介

**Schemly** 是一个基于 Vue 3 + Element Plus 的 Schema 驱动业务展示类库，面向后台管理系统。通过一份 Schema 描述即可定义一个组件实例的完整展示行为——由 **Designer** 可视化产出，由 **Runtime** 消费渲染。

它涵盖数据表格、表单、描述列表等常见后台管理场景，提供从 Schema 定义、渲染引擎到可视化编辑器的完整工具链。

## 站点信息

| 项目 | 信息 |
| --- | --- |
| 📦 仓库地址 | [github.com/hanlang123/schemly](https://github.com/hanlang123/schemly) |
| 🌐 文档站点 | [hanlang123.github.io/schemly](https://hanlang123.github.io/schemly/) |
| 📖 文档框架 | [VitePress](https://vitepress.dev/) |
| 🚀 部署方式 | GitHub Pages（通过 GitHub Actions 自动部署） |
| 📂 文档源码 | [`docs/`](https://github.com/hanlang123/schemly/tree/master/docs) |
| 📋 协议版本 | Schema 协议 v1.0 |

## 核心特性

| 特性 | 说明 |
| --- | --- |
| 🧩 Cell 原子单元 | 11 种数据语义类型（text、number、date、enum 等），自动推导 display / edit 双模态渲染器 |
| 📊 三种布局容器 | DataTable 数据表格、Form 通用表单、Descriptions 描述列表 |
| 🔐 三级权限体系 | Type 级 → Action 级 → Cell 级，细粒度到单个字段的查看/编辑权限控制 |
| 📡 灵活数据源 | 静态字典、动态接口（`options:api`）、远程搜索（`options:search`）三种模式 |
| 🎨 可视化 Designer | 面向开发者的 Schema 可视化编辑器，实时预览与校验，替代手写 JSON |
| 🔌 自定义扩展 | 可注册自定义 Cell 类型、展示渲染器、编辑渲染器 |

## 包结构

Schemly 采用 **pnpm Monorepo** 工程管理，包含三个核心子包：

| 包名 | 路径 | 说明 |
| --- | --- | --- |
| `@schemly/core` | `packages/core` | Schema 协议类型定义、校验逻辑与工具函数 |
| `@schemly/runtime` | `packages/runtime` | 运行时渲染引擎，消费 Schema 渲染 Vue 3 组件 |
| `@schemly/designer` | `packages/designer` | 可视化 Schema 编辑器，产出 Schema JSON |

依赖关系：`designer → runtime → core`

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 前端框架 | [Vue 3](https://vuejs.org/) |
| UI 组件库 | [Element Plus](https://element-plus.org/) |
| 构建工具 | [Vite](https://vitejs.dev/) / [unbuild](https://github.com/unjs/unbuild)（core） |
| 包管理 | [pnpm](https://pnpm.io/)（Monorepo 工作区） |
| 文档 | [VitePress](https://vitepress.dev/) |
| 测试 | [Vitest](https://vitest.dev/) |
| 类型系统 | [TypeScript](https://www.typescriptlang.org/) |
| CI/CD | GitHub Actions → GitHub Pages |

## 设计原则

- **一个 Schema = 一个组件实例**：Schema 描述局部区域（页面主体、弹窗、抽屉等），不描述完整页面
- **Cell 是最小原子单元**：所有高级展示形式（表格列、描述项、表单字段）都消费 Cell
- **cell type = 数据语义**：Cell 描述"这个字段是什么类型的数据"，而非"用什么组件渲染"
- **双模态派生**：每个 cell type 默认推导出 display 和 edit 渲染器，大多数场景无需显式指定
- **Schema 纯展示描述**：不包含请求逻辑、路由逻辑，数据由 Runtime props 传入
- **声明与实现分离**：Schema 只声明 key，Runtime 注入具体实现

## 路线图

- [x] Schema 协议 v1.0 规范制定
- [x] 项目工程架构搭建（Monorepo + CI/CD）
- [x] 文档站点上线（VitePress + GitHub Pages）
- [ ] `@schemly/core` — 类型定义与 Schema 校验
- [ ] `@schemly/runtime` — 渲染引擎核心实现
- [ ] `@schemly/designer` — 可视化编辑器
- [ ] Playground 在线体验
- [ ] 单元测试覆盖
- [ ] npm 发包

## 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/my-feature`
3. 提交改动：`git commit -m 'feat: add some feature'`
4. 推送分支：`git push origin feat/my-feature`
5. 提交 Pull Request

## 常见问题

### Schemly 和低代码平台有什么区别？

Schemly 不是低代码平台。它是一个 **Schema 驱动的展示层类库**，聚焦于用 Schema 描述组件的展示行为。它不包含页面路由、数据请求、状态管理等能力，这些由业务代码自行处理。

### 支持哪些 UI 组件库？

当前版本基于 **Element Plus** 实现。架构上，渲染器层与 UI 库解耦，未来可扩展支持其他组件库。

### Schema 是手写还是可视化生成？

两者均可。可以直接编写 JSON，也可以通过 **Designer** 可视化编辑器拖拽生成。Designer 产出的 Schema 和手写的完全一致。

## 许可证

本项目基于 [MIT License](https://opensource.org/licenses/MIT) 开源。

Copyright © 2024-present Schemly Team
