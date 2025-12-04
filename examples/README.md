# 时间轴工具React界面演示

这个演示展示了时间轴工具的React界面组件的使用方法。

## 安装依赖

```bash
npm install
```

## 启动演示

```bash
npm run dev
```

这将在 http://localhost:3000 启动演示应用。

## 功能特性

### 核心组件

1. **Timeline** - 主时间轴组件
   - 多轨道支持
   - 缩放和滚动
   - 对象选择和编辑

2. **Track** - 轨道组件
   - 轨道管理（添加/删除/重命名）
   - 对象容器
   - 拖放支持

3. **TimelineObject** - 时间轴对象组件
   - 持续时间对象和瞬间对象
   - 拖拽移动
   - 调整大小（持续时间对象）

4. **PropertyEditor** - 属性编辑器
   - 对象属性编辑
   - 时间属性编辑
   - 自定义属性支持

5. **TimelineControls** - 时间轴控制栏
   - 缩放控制
   - 轨道管理
   - 视图操作

### 胶水层Hook

1. **useTimeline** - 主时间轴Hook
   - 状态管理
   - 操作封装
   - 事件处理

2. **useTrack** - 轨道Hook
   - 轨道操作
   - 对象管理

3. **useTimelineObject** - 对象Hook
   - 对象操作
   - 属性编辑
   - 选择管理

### 适配器层

1. **TimelineAdapter** - 数据模型适配器
   - React生命周期管理
   - 状态同步
   - 事件订阅

## 使用示例

```tsx
import React from 'react';
import { Timeline, PropertyEditor, useTimeline } from 'timeline-tool/react';

function App() {
  const timeline = useTimeline({
    initialState: createSimpleTimelineState(),
    onStateChange: (state) => {
      console.log('Timeline state changed:', state);
    }
  });

  return (
    <div className="app">
      <div className="timeline-section">
        <Timeline />
      </div>
      <div className="property-section">
        <PropertyEditor />
      </div>
    </div>
  );
}
```

## 架构设计

### 三层架构

1. **界面层 (React组件)**
   - 纯UI组件
   - 通过props接收数据和回调
   - 保持组件纯粹性

2. **胶水层 (React适配层)**
   - 连接React与纯数据逻辑
   - 处理生命周期同步
   - 状态转换管理

3. **数据层 (现有纯数据逻辑)**
   - 完全不变的纯数据逻辑
   - 提供所有业务逻辑
   - 与UI框架无关

### 优势

- **职责分离**: 每层都有明确的职责边界
- **可测试性**: 每层都可以独立测试
- **可维护性**: 修改一层不会影响其他层
- **可扩展性**: 容易添加新功能
- **框架无关**: 数据层保持纯逻辑

## 样式

所有组件都使用CSS Modules，支持：
- 暗色主题
- 响应式设计
- 自定义样式
- 主题切换

## 测试

```bash
# 运行所有测试
npm test

# 运行React组件测试
npm test -- tests/react

# 运行测试并查看覆盖率
npm run test:coverage
```