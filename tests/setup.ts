/**
 * 测试环境配置
 */

// 导入 React Testing Library 的扩展
import '@testing-library/jest-dom';

// 全局测试配置
const originalConsole = { ...console };
(globalThis as any).console = {
  ...originalConsole,
  // 在测试中忽略警告，但保留错误
  warn: jest.fn(),
  error: originalConsole.error,
  log: originalConsole.log,
  info: originalConsole.info,
  debug: originalConsole.debug,
};

// 模拟 DOM 方法
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // 废弃
    removeListener: jest.fn(), // 废弃
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 模拟 IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
} as any;

// 模拟 ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// 模拟定时器
jest.useFakeTimers();

// 测试辅助函数
const testUtils = {
  /**
   * 创建测试用的时间轴对象
   */
  createMockTimelineObject: (overrides = {}) => ({
    id: `test_obj_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    type: 'duration' as const,
    startTime: 0,
    duration: 10,
    properties: {
      name: 'Test Object',
      color: '#3b82f6',
      opacity: 1
    },
    ...overrides
  }),

  /**
   * 创建测试用的轨道
   */
  createMockTrack: (overrides = {}) => ({
    id: `test_track_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    name: 'Test Track',
    objects: [],
    ...overrides
  }),

  /**
   * 创建测试用的时间轴状态
   */
  createMockTimelineState: (overrides = {}) => ({
    tracks: [],
    zoomLevel: 1,
    scrollPosition: 0,
    selectedObjectId: null,
    ...overrides
  }),

  /**
   * 生成唯一ID
   */
  generateTestId: (prefix = 'test') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
};

// 导出测试工具
export { testUtils };