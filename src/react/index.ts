// React UI 层入口文件
export * from '../components';
export * from '../hooks';
export * from '../adapters';

// 工具函数
export { createTimelineAdapter } from '../adapters';

// 类型定义
export type {
  TimelineState,
  TimelineConfig,
  TimelineObject,
  Track,
  PropertyTemplate,
  TimelineAction
} from '../types/timeline';

// 默认导出主要组件
export { Timeline } from '../components';
export { useTimeline } from '../hooks';