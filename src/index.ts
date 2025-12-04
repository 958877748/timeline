/**
 * 时间轴工具 - 纯数据版本
 *
 * 这是一个基于纯数据模型的时间轴工具，提供完整的数据结构定义、操作函数和验证机制。
 * 所有功能都通过纯函数和不可变数据操作实现，便于测试和维护。
 */

// 类型定义
export * from './types/timeline';

// 数据模型
export { TimelineModel } from './models/TimelineModel';

// 工具函数
export * from './utils/timelineUtils';
export * from './utils/validation';

// 示例数据
export {
  createDurationObject,
  createInstantObject,
  createTrack,
  basicTimelineConfig,
  animationTimelineConfig,
  createSimpleTimelineState,
  createComplexTimelineState,
  createEmptyTimelineState,
  createEducationalTimelineState,
  getAllMockData
} from './data/mockData';

// 版本信息
export const VERSION = '1.0.0';
export const AUTHOR = 'Timeline Tool Team';
export const DESCRIPTION = 'A pure data-driven timeline tool similar to Unity Timeline';

/**
 * 创建时间轴工具实例
 */
export function createTimeline(initialState?: any, config?: any) {
  const { TimelineModel } = require('./models/TimelineModel');
  return new TimelineModel(initialState, config);
}

/**
 * 获取工具信息
 */
export function getToolInfo() {
  return {
    version: VERSION,
    author: AUTHOR,
    description: DESCRIPTION,
    features: [
      'Pure data-driven architecture',
      'Immutable data operations',
      'TypeScript support',
      'Comprehensive validation',
      'Multiple object types (duration/instant)',
      'Multi-track support',
      'Property templates',
      'Time-based operations',
      'Zoom and scroll management',
      'Object selection and manipulation'
    ]
  };
}