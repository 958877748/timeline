import {
  TimelineState,
  Track,
  TimelineObject,
  TimelineConfig,
  PropertyEditorConfig,
  PropertyTemplate,
  TimelineAction
} from '../types/timeline';

/**
 * 时间轴数据模型类
 * 负责管理和操作时间轴的纯数据逻辑
 */
export class TimelineModel {
  private state: TimelineState;
  private config: TimelineConfig;
  private propertyConfig: PropertyEditorConfig;

  constructor(initialState?: Partial<TimelineState>, config?: Partial<TimelineConfig>) {
    this.config = {
      minZoom: 0.1,
      maxZoom: 10,
      defaultZoom: 1,
      timeUnit: 'seconds',
      ...config
    };

    this.propertyConfig = {
      propertyTemplates: this.getDefaultPropertyTemplates()
    };

    this.state = {
      tracks: [],
      zoomLevel: this.config.defaultZoom,
      scrollPosition: 0,
      selectedObjectId: null,
      ...initialState
    };
  }

  /**
   * 获取当前状态
   */
  getState(): TimelineState {
    return { ...this.state };
  }

  /**
   * 获取配置
   */
  getConfig(): TimelineConfig {
    return { ...this.config };
  }

  /**
   * 获取属性编辑器配置
   */
  getPropertyConfig(): PropertyEditorConfig {
    return { ...this.propertyConfig };
  }

  /**
   * 派发操作
   */
  dispatch(action: TimelineAction): void {
    switch (action.type) {
      case 'ADD_TRACK':
        this.addTrack(action.payload);
        break;
      case 'REMOVE_TRACK':
        this.removeTrack(action.payload.trackId);
        break;
      case 'UPDATE_TRACK_NAME':
        this.updateTrackName(action.payload.trackId, action.payload.name);
        break;
      case 'ADD_OBJECT':
        this.addObject(action.payload.trackId, action.payload.object);
        break;
      case 'REMOVE_OBJECT':
        this.removeObjectById(action.payload.objectId);
        break;
      case 'UPDATE_OBJECT':
        this.updateObjectById(action.payload.objectId, action.payload.updates);
        break;
      case 'SELECT_OBJECT':
        this.selectObject(action.payload.objectId);
        break;
      case 'SET_ZOOM':
      case 'SET_ZOOM_LEVEL':
        this.setZoom(action.payload.zoomLevel);
        break;
      case 'SET_SCROLL':
      case 'SET_SCROLL_POSITION':
        this.setScroll(action.payload.scrollPosition);
        break;
      case 'MOVE_OBJECT':
        if ('fromTrackId' in action.payload) {
          // 旧版本的移动操作
          this.moveObject(action.payload.fromTrackId, action.payload.toTrackId, action.payload.objectId, action.payload.newStartTime);
        } else {
          // 新版本的移动操作
          this.moveObjectById(action.payload.objectId, action.payload.newStartTime, action.payload.newTrackId);
        }
        break;
      case 'DUPLICATE_OBJECT':
        this.duplicateObjectById(action.payload.objectId);
        break;
      default:
        throw new Error(`Unknown action type: ${(action as any).type}`);
    }
  }

  /**
   * 添加轨道
   */
  private addTrack(trackData: Omit<Track, 'id' | 'objects'>): void {
    const newTrack: Track = {
      ...trackData,
      id: this.generateId(),
      objects: []
    };
    this.state.tracks.push(newTrack);
  }

  /**
   * 移除轨道
   */
  private removeTrack(trackId: string): void {
    // 在删除轨道前检查选中的对象是否在该轨道上
    if (this.state.selectedObjectId) {
      const trackContainingSelected = this.findTrackByObjectId(this.state.selectedObjectId);
      if (trackContainingSelected && trackContainingSelected.id === trackId) {
        this.state.selectedObjectId = null;
      }
    }

    this.state.tracks = this.state.tracks.filter(track => track.id !== trackId);
  }

  /**
   * 添加对象
   */
  private addObject(trackId: string, objectData: Omit<TimelineObject, 'id'>): void {
    const track = this.state.tracks.find(t => t.id === trackId);
    if (!track) return;

    const newObject: TimelineObject = {
      ...objectData,
      id: this.generateId()
    };
    track.objects.push(newObject);
  }

  /**
   * 移除对象
   */
  private removeObject(trackId: string, objectId: string): void {
    const track = this.state.tracks.find(t => t.id === trackId);
    if (!track) return;

    track.objects = track.objects.filter(obj => obj.id !== objectId);
    if (this.state.selectedObjectId === objectId) {
      this.state.selectedObjectId = null;
    }
  }

  /**
   * 更新对象
   */
  private updateObject(trackId: string, objectId: string, updates: Partial<TimelineObject>): void {
    const track = this.state.tracks.find(t => t.id === trackId);
    if (!track) return;

    const object = track.objects.find(obj => obj.id === objectId);
    if (!object) return;

    Object.assign(object, updates);
  }

  /**
   * 通过对象ID更新对象（不指定轨道）
   */
  private updateObjectById(objectId: string, updates: Partial<TimelineObject>): void {
    const track = this.findTrackByObjectId(objectId);
    if (!track) return;
    this.updateObject(track.id, objectId, updates);
  }

  /**
   * 通过对象ID移除对象（不指定轨道）
   */
  private removeObjectById(objectId: string): void {
    const track = this.findTrackByObjectId(objectId);
    if (!track) return;
    this.removeObject(track.id, objectId);
  }

  /**
   * 通过对象ID移动对象
   */
  private moveObjectById(objectId: string, newStartTime: number, newTrackId?: string): void {
    const currentTrack = this.findTrackByObjectId(objectId);
    if (!currentTrack) return;

    const object = currentTrack.objects.find(obj => obj.id === objectId);
    if (!object) return;

    if (newTrackId && newTrackId !== currentTrack.id) {
      // 移动到不同轨道
      const newTrack = this.state.tracks.find(t => t.id === newTrackId);
      if (!newTrack) return;

      // 从原轨道移除
      currentTrack.objects = currentTrack.objects.filter(obj => obj.id !== objectId);

      // 更新开始时间
      const updatedObject = { ...object, startTime: newStartTime };

      // 添加到新轨道
      newTrack.objects.push(updatedObject);
    } else {
      // 在同一轨道内移动
      object.startTime = newStartTime;
    }
  }

  /**
   * 通过对象ID复制对象
   */
  private duplicateObjectById(objectId: string): void {
    const track = this.findTrackByObjectId(objectId);
    if (!track) return;

    const object = track.objects.find(obj => obj.id === objectId);
    if (!object) return;

    const duplicatedObject = {
      ...object,
      id: this.generateId(),
      startTime: object.startTime + 1 // 稍微偏移一点时间
    };

    track.objects.push(duplicatedObject);
  }

  /**
   * 更新轨道名称
   */
  private updateTrackName(trackId: string, name: string): void {
    const track = this.state.tracks.find(t => t.id === trackId);
    if (!track) return;
    track.name = name;
  }

  /**
   * 选择对象
   */
  private selectObject(objectId: string | null): void {
    this.state.selectedObjectId = objectId;
  }

  /**
   * 设置缩放级别
   */
  private setZoom(zoomLevel: number): void {
    this.state.zoomLevel = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, zoomLevel));
  }

  /**
   * 设置滚动位置
   */
  private setScroll(scrollPosition: number): void {
    this.state.scrollPosition = Math.max(0, scrollPosition);
  }

  /**
   * 移动对象到其他轨道
   */
  private moveObject(fromTrackId: string, toTrackId: string, objectId: string, newStartTime: number): void {
    const fromTrack = this.state.tracks.find(t => t.id === fromTrackId);
    const toTrack = this.state.tracks.find(t => t.id === toTrackId);

    if (!fromTrack || !toTrack) return;

    const objectIndex = fromTrack.objects.findIndex(obj => obj.id === objectId);
    if (objectIndex === -1) return;

    const object = fromTrack.objects[objectIndex];
    const updatedObject = { ...object, startTime: newStartTime };

    // 从原轨道移除
    fromTrack.objects.splice(objectIndex, 1);
    // 添加到新轨道
    toTrack.objects.push(updatedObject);
  }

  /**
   * 根据ID查找对象
   */
  findObjectById(objectId: string): TimelineObject | null {
    for (const track of this.state.tracks) {
      const object = track.objects.find(obj => obj.id === objectId);
      if (object) return object;
    }
    return null;
  }

  /**
   * 根据对象ID查找所在轨道
   */
  findTrackByObjectId(objectId: string): Track | null {
    return this.state.tracks.find(track =>
      track.objects.some(obj => obj.id === objectId)
    ) || null;
  }

  /**
   * 获取当前选中的对象
   */
  getSelectedObject(): TimelineObject | null {
    return this.state.selectedObjectId ? this.findObjectById(this.state.selectedObjectId) : null;
  }

  /**
   * 获取轨道数量
   */
  getTrackCount(): number {
    return this.state.tracks.length;
  }

  /**
   * 获取对象总数
   */
  getObjectCount(): number {
    return this.state.tracks.reduce((count, track) => count + track.objects.length, 0);
  }

  /**
   * 获取时间范围
   */
  getTimeRange(): { start: number; end: number } {
    let start = Infinity;
    let end = -Infinity;

    for (const track of this.state.tracks) {
      for (const object of track.objects) {
        start = Math.min(start, object.startTime);
        if (object.type === 'duration' && object.duration) {
          end = Math.max(end, object.startTime + object.duration);
        } else {
          end = Math.max(end, object.startTime);
        }
      }
    }

    return {
      start: start === Infinity ? 0 : start,
      end: end === -Infinity ? 100 : end
    };
  }

  /**
   * 根据轨道ID获取轨道
   */
  getTrackById(trackId: string): Track | null {
    return this.state.tracks.find(track => track.id === trackId) || null;
  }

  /**
   * 根据对象ID获取对象
   */
  getObjectById(objectId: string): TimelineObject | null {
    return this.findObjectById(objectId);
  }

  /**
   * 获取指定时间范围内的对象
   */
  getObjectsInTimeRange(startTime: number, endTime: number): TimelineObject[] {
    const objects: TimelineObject[] = [];

    for (const track of this.state.tracks) {
      for (const object of track.objects) {
        const objEndTime = object.type === 'duration' && object.duration
          ? object.startTime + object.duration
          : object.startTime;

        if (object.startTime <= endTime && objEndTime >= startTime) {
          objects.push(object);
        }
      }
    }

    return objects;
  }

  /**
   * 验证当前状态
   */
  validate(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查重叠对象
    for (const track of this.state.tracks) {
      const trackObjects = [...track.objects].sort((a, b) => a.startTime - b.startTime);

      for (let i = 0; i < trackObjects.length - 1; i++) {
        const current = trackObjects[i];
        const next = trackObjects[i + 1];

        const currentEnd = current.type === 'duration' && current.duration
          ? current.startTime + current.duration
          : current.startTime;

        if (currentEnd > next.startTime) {
          warnings.push(`轨道 "${track.name}" 中的对象在时间 ${next.startTime} 处重叠`);
        }
      }
    }

    // 检查时间轴范围
    const timeRange = this.getTimeRange();
    if (timeRange.start < 0) {
      errors.push('时间轴开始时间不能为负数');
    }

    if (timeRange.end <= timeRange.start) {
      errors.push('时间轴结束时间必须大于开始时间');
    }

    return { errors, warnings };
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * 获取默认属性模板
   */
  private getDefaultPropertyTemplates(): PropertyTemplate[] {
    return [
      {
        name: 'name',
        type: 'string',
        label: '名称',
        defaultValue: 'New Object'
      },
      {
        name: 'color',
        type: 'color',
        label: '颜色',
        defaultValue: '#3b82f6'
      },
      {
        name: 'opacity',
        type: 'number',
        label: '透明度',
        defaultValue: 1,
        min: 0,
        max: 1,
        step: 0.1
      }
    ];
  }
}