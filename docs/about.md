# 关于 Schemly

## 项目简介

**Schemly** 是一个基于 Vue 3 + Element Plus 的 Schema 驱动业务展示类库。通过一份 Schema 描述即可定义一个组件实例的完整展示行为，涵盖数据表格、表单、描述列表等常见后台管理场景。

## 站点信息

| 项目 | 信息 |
| --- | --- |
| 📦 仓库地址 | [github.com/hanlang123/schemly](https://github.com/hanlang123/schemly) |
| 🌐 文档站点 | [hanlang123.github.io/schemly](https://hanlang123.github.io/schemly/) |
| 📖 文档框架 | [VitePress](https://vitepress.dev/) |
| 🚀 部署方式 | GitHub Pages（通过 GitHub Actions 自动部署） |
| 📂 文档源码 | [`docs/`](https://github.com/hanlang123/schemly/tree/main/docs) |

## 技术栈

- **前端框架**：[Vue 3](https://vuejs.org/)
- **UI 组件库**：[Element Plus](https://element-plus.org/)
- **构建工具**：[Vite](https://vitejs.dev/)
- **文档工具**：[VitePress](https://vitepress.dev/)
- **包管理**：[pnpm](https://pnpm.io/)（Monorepo 工作区）
- **测试框架**：[Vitest](https://vitest.dev/)
- **类型系统**：[TypeScript](https://www.typescriptlang.org/)

## 核心特性

- 🧩 **Cell 原子单元** — 11 种数据语义类型，自动推导 display / edit 双模态渲染器
- 📊 **三种布局容器** — DataTable、Form、Descriptions，覆盖后台管理核心场景
- 🔐 **三级权限体系** — Type 级 → Action 级 → Cell 级细粒度控制
- 📡 **灵活数据源** — 静态字典、动态接口、远程搜索三种模式
- 🎨 **可视化 Designer** — Schema 可视化编辑器，替代手写 JSON
- 🔌 **自定义扩展** — 可注册自定义 Cell 类型、渲染器

## 许可证

本项目基于 [MIT License](https://opensource.org/licenses/MIT) 开源。

Copyright © 2024-present Schemly Team
