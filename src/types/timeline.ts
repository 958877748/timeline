/**
 * 时间轴对象类型定义
 */
export type TimelineObjectType = 'duration' | 'instant';

/**
 * 时间轴对象属性接口
 */
export interface TimelineObjectProperties {
  [key: string]: any;
}

/**
 * 时间轴对象接口
 */
export interface TimelineObject {
  id: string;
  type: TimelineObjectType;
  startTime: number;
  duration?: number; // 仅用于持续时间对象
  properties: TimelineObjectProperties;
}

/**
 * 轨道接口
 */
export interface Track {
  id: string;
  name: string;
  objects: TimelineObject[];
}

/**
 * 时间轴状态接口
 */
export interface TimelineState {
  tracks: Track[];
  zoomLevel: number;
  scrollPosition: number;
  selectedObjectId: string | null;
}

/**
 * 时间轴配置接口
 */
export interface TimelineConfig {
  minZoom: number;
  maxZoom: number;
  defaultZoom: number;
  timeUnit: 'seconds' | 'frames';
  fps?: number; // 仅在 timeUnit 为 'frames' 时使用
}

/**
 * 属性编辑器配置接口
 */
export interface PropertyEditorConfig {
  propertyTemplates: PropertyTemplate[];
}

/**
 * 属性模板接口
 */
export interface PropertyTemplate {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'multiselect';
  label: string;
  defaultValue?: any;
  options?: string[]; // 用于 select 和 multiselect 类型
  min?: number; // 用于 number 类型
  max?: number; // 用于 number 类型
  step?: number; // 用于 number 类型
}

/**
 * 时间轴操作类型
 */
export type TimelineAction =
  | { type: 'ADD_TRACK'; payload: Omit<Track, 'id' | 'objects'> }
  | { type: 'REMOVE_TRACK'; payload: { trackId: string } }
  | { type: 'UPDATE_TRACK_NAME'; payload: { trackId: string; name: string } }
  | { type: 'ADD_OBJECT'; payload: { trackId: string; object: Omit<TimelineObject, 'id'> } }
  | { type: 'REMOVE_OBJECT'; payload: { objectId: string } }
  | { type: 'UPDATE_OBJECT'; payload: { objectId: string; updates: Partial<TimelineObject> } }
  | { type: 'SELECT_OBJECT'; payload: { objectId: string | null } }
  | { type: 'SET_ZOOM'; payload: { zoomLevel: number } }
  | { type: 'SET_SCROLL'; payload: { scrollPosition: number } }
  | { type: 'SET_ZOOM_LEVEL'; payload: { zoomLevel: number } }
  | { type: 'SET_SCROLL_POSITION'; payload: { scrollPosition: number } }
  | { type: 'MOVE_OBJECT'; payload: { objectId: string; newStartTime: number; newTrackId?: string } }
  | { type: 'DUPLICATE_OBJECT'; payload: { objectId: string } }
  | { type: 'MOVE_OBJECT'; payload: { fromTrackId: string; toTrackId: string; objectId: string; newStartTime: number } };