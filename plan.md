# 时间轴工具架构设计

## 概述
本文档描述了一个类似Unity Timeline的Web工具的架构设计。该工具使用React和Tweakpane实现，支持多轨道、持续时间和瞬间对象，以及对象属性编辑功能。

## 核心组件

### 1. 时间轴组件 (Timeline)
- 负责整体时间轴的渲染和管理
- 支持缩放和滚动功能
- 管理所有轨道和对象

### 2. 轨道组件 (Track)
- 每个轨道可以包含多个对象
- 支持不同类型的对象（持续时间和瞬间对象）
- 处理轨道内的对象布局和交互

### 3. 对象组件 (TimelineObject)
- 基础对象类，支持持续时间和瞬间两种类型
- 处理对象的渲染和基本交互
- 管理对象的属性和状态

### 4. 属性编辑器 (PropertyEditor)
- 使用Tweakpane实现属性编辑界面
- 支持固定属性模板
- 与选中的对象绑定

## 数据结构

### TimelineState
```typescript
interface TimelineState {
  tracks: Track[];
  zoomLevel: number;
  scrollPosition: number;
  selectedObject: TimelineObject | null;
}
```

### Track
```typescript
interface Track {
  id: string;
  name: string;
  objects: TimelineObject[];
}
```

### TimelineObject
```typescript
interface TimelineObject {
  id: string;
  type: 'duration' | 'instant';
  startTime: number;
  duration?: number; // 仅用于持续时间对象
  properties: Record<string, any>;
}
```

## 功能需求

1. **多轨道支持**: 每个时间轴可以包含多个轨道
2. **对象类型支持**:
   - 持续时间对象（有开始时间和持续时间）
   - 瞬间对象（只有开始时间）
3. **基本交互**:
   - 缩放时间轴
   - 滚动时间轴
   - 选择对象
4. **属性编辑**:
   - 使用Tweakpane编辑选中对象的属性
   - 支持固定属性模板

## 技术栈
- React (UI框架)
- Tweakpane (属性编辑面板)
- TypeScript (类型安全)
- CSS Modules (样式管理)

## 实现步骤
1. 创建React项目并安装依赖
2. 实现基本的时间轴组件
3. 实现轨道组件
4. 实现对象组件（支持两种类型）
5. 集成Tweakpane进行属性编辑
6. 实现基本的交互功能
7. 测试和调试