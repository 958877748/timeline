# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个纯数据驱动的时间轴工具，类似于 Unity Timeline，使用 TypeScript 和 React 构建。项目提供了带有纯函数的核心数据模型和用于可视化的 React UI 层。

## 架构

项目采用双层架构：

### 核心数据层 (`src/`)
- **TimelineModel**: 通过纯函数管理时间轴状态和操作的主要类
- **Types**: `src/types/timeline.ts` 中的完整 TypeScript 定义
- **Utils**: 验证和时间轴操作工具
- **Data Models**: 使用类似 Redux 操作的不可变状态管理

### React UI 层 (`src/react/`, `src/components/`)
- **Timeline**: 带缩放/滚动功能的主要时间轴可视化组件
- **Track**: 用于组织时间轴对象的多轨道支持
- **TimelineObject**: 支持持续时间和瞬间对象类型
- **PropertyEditor**: Tweakpane 集成的对象属性编辑器
- **Adapters**: 纯数据模型和 React 组件之间的桥梁

## 核心功能

- 纯数据驱动架构，支持不可变操作
- 带缩放和滚动功能的多轨道时间轴
- 两种对象类型：持续时间对象（开始时间 + 持续时间）和瞬间对象（仅开始时间）
- 集成 Tweakpane 的属性模板系统
- 全面的验证和错误处理
- 状态管理的 React hooks（`useTimeline`、`useTrack`、`useTimelineObject`）

## 开发命令

```bash
# 核心库构建
npm run build                    # 构建 TypeScript 到 dist/
npm run build:react             # 使用 Vite 构建 React 示例

# 开发
npm run dev                      # 启动 Vite 开发服务器（端口 3000）
npm run dev:ts                   # TypeScript 监听模式

# 测试
npm run test                     # 运行 Jest 测试
npm run test:watch              # Jest 监听模式
npm run test:coverage           # 生成覆盖率报告
npm run test:verbose            # 详细测试输出

# 代码质量
npm run lint                     # ESLint 检查
npm run lint:fix                 # 自动修复 ESLint 问题
npm run clean                    # 清理 dist/ 和 coverage/

# 打包
npm run prepublishOnly           # 发布前清理 + 构建
```

## 项目结构

```
src/
├── types/timeline.ts           # 核心 TypeScript 定义
├── models/TimelineModel.ts     # 主要数据模型类
├── utils/                      # 验证和工具函数
├── data/mockData.ts           # 示例数据和工厂函数
├── hooks/                     # 状态管理的 React hooks
├── components/                # React UI 组件
│   ├── Timeline/              # 主要时间轴可视化
│   ├── Track/                 # 轨道组件
│   ├── TimelineObject/        # 时间轴对象组件
│   ├── TimelineControls/      # 缩放/滚动控件
│   └── PropertyEditor/        # Tweakpane 属性编辑器
├── adapters/                  # 数据-UI 桥接层
└── react/index.ts            # React 层入口点
```

## 数据模型核心概念

- **TimelineState**: 完整的时间轴状态，包括轨道、缩放、滚动、选择
- **TimelineAction**: 用于状态变更的 Redux 风格操作
- **TimelineObject**: 基础对象类型，支持持续时间/瞬间变体
- **PropertyTemplate**: 对象的可配置属性架构
- **Validation**: 内置重叠检测和时间范围验证

## 测试策略

项目使用 Jest 和 React Testing Library。测试应覆盖：
- `src/utils/` 中的纯函数工具
- TimelineModel 状态变更
- React 组件渲染和交互
- 验证和错误场景

## 构建系统

- **核心库**: TypeScript 编译到 `dist/`
- **React 示例**: Vite 构建到 `dist-examples/`
- **CSS Modules**: 使用 camelCase 命名的组件作用域样式
- **路径别名**: `@/` 映射到 `src/` 用于导入

## 属性编辑器集成

使用 Tweakpane (`@tweakpane/plugin-essentials`) 进行属性编辑：
- 在 TimelineModel 中定义的固定属性模板
- 与选定时间轴对象的动态绑定
- 支持字符串、数字、布尔值、颜色、选择类型