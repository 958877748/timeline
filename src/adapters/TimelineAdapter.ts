import { TimelineModel } from '../models/TimelineModel';
import { TimelineState, TimelineConfig, TimelineObject, Track } from '../types/timeline';

/**
 * TimelineAdapter 类负责在React组件和纯数据逻辑之间进行适配
 * 处理React生命周期与数据模型的同步，以及状态转换
 */
export class TimelineAdapter {
  private model: TimelineModel;
  private listeners: Set<(state: TimelineState) => void> = new Set();
  private validationListeners: Set<(errors: string[], warnings: string[]) => void> = new Set();

  constructor(initialState?: Partial<TimelineState>, config?: Partial<TimelineConfig>) {
    this.model = new TimelineModel(initialState, config);
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: (state: TimelineState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 订阅验证结果变化
   */
  subscribeToValidation(listener: (errors: string[], warnings: string[]) => void): () => void {
    this.validationListeners.add(listener);
    return () => {
      this.validationListeners.delete(listener);
    };
  }

  /**
   * 获取当前状态
   */
  getState(): TimelineState {
    return this.model.getState();
  }

  /**
   * 获取配置
   */
  getConfig(): TimelineConfig {
    return this.model.getConfig();
  }

  /**
   * 分发操作并通知监听器
   */
  dispatch(action: any): void {
    try {
      this.model.dispatch(action);
      this.notifyListeners();
      this.notifyValidationListeners();
    } catch (error) {
      console.error('Timeline dispatch error:', error);
      throw error;
    }
  }

  /**
   * 通知所有状态监听器
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Timeline listener error:', error);
      }
    });
  }

  /**
   * 通知所有验证监听器
   */
  private notifyValidationListeners(): void {
    const validation = this.validate();
    this.validationListeners.forEach(listener => {
      try {
        listener(validation.errors, validation.warnings);
      } catch (error) {
        console.error('Timeline validation listener error:', error);
      }
    });
  }

  /**
   * 验证当前状态
   */
  validate() {
    return this.model.validate();
  }

  /**
   * 获取选中的对象
   */
  getSelectedObject(): TimelineObject | null {
    return this.model.getSelectedObject();
  }

  /**
   * 根据ID获取轨道
   */
  getTrackById(trackId: string): Track | null {
    return this.model.getTrackById(trackId);
  }

  /**
   * 根据ID获取对象
   */
  getObjectById(objectId: string): TimelineObject | null {
    return this.model.getObjectById(objectId);
  }

  /**
   * 获取指定时间范围内的对象
   */
  getObjectsInTimeRange(startTime: number, endTime: number): TimelineObject[] {
    return this.model.getObjectsInTimeRange(startTime, endTime);
  }

  /**
   * 获取时间轴的总时间范围
   */
  getTimelineRange(): { startTime: number; endTime: number } {
    const range = this.model.getTimeRange();
    return { startTime: range.start, endTime: range.end };
  }

  /**
   * 导出当前状态
   */
  exportState(): TimelineState {
    return this.model.getState();
  }

  /**
   * 导入状态
   */
  importState(state: TimelineState): void {
    // 创建新的模型实例
    this.model = new TimelineModel(state, this.getConfig());
    this.notifyListeners();
    this.notifyValidationListeners();
  }

  /**
   * 重置到初始状态
   */
  reset(): void {
    this.model = new TimelineModel(undefined, this.getConfig());
    this.notifyListeners();
    this.notifyValidationListeners();
  }

  /**
   * 撤销操作
   */
  undo(): boolean {
    // TODO: 实现撤销功能
    return false;
  }

  /**
   * 重做操作
   */
  redo(): boolean {
    // TODO: 实现重做功能
    return false;
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    // TODO: 实现撤销状态检查
    return false;
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    // TODO: 实现重做状态检查
    return false;
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    this.listeners.clear();
    this.validationListeners.clear();
  }
}

/**
 * 创建TimelineAdapter实例的工厂函数
 */
export function createTimelineAdapter(
  initialState?: Partial<TimelineState>,
  config?: Partial<TimelineConfig>
): TimelineAdapter {
  return new TimelineAdapter(initialState, config);
}