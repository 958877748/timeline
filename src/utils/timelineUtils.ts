import {
  TimelineState,
  Track,
  TimelineObject,
  TimelineObjectType
} from '../types/timeline';

/**
 * 时间轴工具函数集合
 * 提供纯函数式的时间轴数据操作
 */

/**
 * 创建新的时间轴状态
 */
export function createTimelineState(
  tracks: Track[] = [],
  zoomLevel: number = 1,
  scrollPosition: number = 0,
  selectedObjectId: string | null = null
): TimelineState {
  return {
    tracks: [...tracks],
    zoomLevel,
    scrollPosition: Math.max(0, scrollPosition),
    selectedObjectId
  };
}

/**
 * 创建新的轨道
 */
export function createTrack(name: string, objects: TimelineObject[] = []): Track {
  return {
    id: generateId(),
    name,
    objects: [...objects]
  };
}

/**
 * 创建新的时间轴对象
 */
export function createTimelineObject(
  type: TimelineObjectType,
  startTime: number,
  duration?: number,
  properties: Record<string, any> = {}
): TimelineObject {
  return {
    id: generateId(),
    type,
    startTime: Math.max(0, startTime),
    duration: type === 'duration' ? Math.max(0, duration || 1) : undefined,
    properties: { ...properties }
  } as TimelineObject;
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 查找对象通过ID
 */
export function findObjectById(state: TimelineState, objectId: string): TimelineObject | null {
  for (const track of state.tracks) {
    const object = track.objects.find(obj => obj.id === objectId);
    if (object) return object;
  }
  return null;
}

/**
 * 查找轨道通过对象ID
 */
export function findTrackByObjectId(state: TimelineState, objectId: string): Track | null {
  return state.tracks.find(track =>
    track.objects.some(obj => obj.id === objectId)
  ) || null;
}

/**
 * 查找轨道通过ID
 */
export function findTrackById(state: TimelineState, trackId: string): Track | null {
  return state.tracks.find(track => track.id === trackId) || null;
}

/**
 * 添加轨道到时间轴
 */
export function addTrack(state: TimelineState, track: Omit<Track, 'id'> | Track): TimelineState {
  const newTrack: Track = {
    ...track,
    id: (track as Track).id || generateId(), // 如果轨道已经有ID则使用它，否则生成新ID
    objects: (track as Track).objects || []
  };
  return {
    ...state,
    tracks: [...state.tracks, newTrack]
  };
}

/**
 * 从时间轴移除轨道
 */
export function removeTrack(state: TimelineState, trackId: string): TimelineState {
  const newTracks = state.tracks.filter(track => track.id !== trackId);
  const selectedObjectId = state.selectedObjectId && !findTrackByObjectId({ ...state, tracks: newTracks }, state.selectedObjectId)
    ? null
    : state.selectedObjectId;

  return {
    ...state,
    tracks: newTracks,
    selectedObjectId
  };
}

/**
 * 添加对象到轨道
 */
export function addObjectToTrack(
  state: TimelineState,
  trackId: string,
  objectData: Omit<TimelineObject, 'id'>
): TimelineState {
  const newObject: TimelineObject = {
    ...objectData,
    id: generateId()
  };

  return {
    ...state,
    tracks: state.tracks.map(track =>
      track.id === trackId
        ? { ...track, objects: [...track.objects, newObject] }
        : track
    )
  };
}

/**
 * 从轨道移除对象
 */
export function removeObjectFromTrack(state: TimelineState, trackId: string, objectId: string): TimelineState {
  const selectedObjectId = state.selectedObjectId === objectId ? null : state.selectedObjectId;

  return {
    ...state,
    tracks: state.tracks.map(track =>
      track.id === trackId
        ? { ...track, objects: track.objects.filter(obj => obj.id !== objectId) }
        : track
    ),
    selectedObjectId
  };
}

/**
 * 更新对象属性
 */
export function updateObject(
  state: TimelineState,
  trackId: string,
  objectId: string,
  updates: Partial<TimelineObject>
): TimelineState {
  return {
    ...state,
    tracks: state.tracks.map(track =>
      track.id === trackId
        ? {
            ...track,
            objects: track.objects.map(obj =>
              obj.id === objectId
                ? { ...obj, ...updates }
                : obj
            )
          }
        : track
    )
  };
}

/**
 * 更新对象属性（不指定轨道ID）
 */
export function updateObjectById(
  state: TimelineState,
  objectId: string,
  updates: Partial<TimelineObject>
): TimelineState {
  return {
    ...state,
    tracks: state.tracks.map(track => ({
      ...track,
      objects: track.objects.map(obj =>
        obj.id === objectId
          ? { ...obj, ...updates }
          : obj
      )
    }))
  };
}

/**
 * 选择对象
 */
export function selectObject(state: TimelineState, objectId: string | null): TimelineState {
  return {
    ...state,
    selectedObjectId: objectId
  };
}

/**
 * 移动对象到其他轨道
 */
export function moveObjectToTrack(
  state: TimelineState,
  fromTrackId: string,
  toTrackId: string,
  objectId: string,
  newStartTime?: number
): TimelineState {
  const object = findObjectById(state, objectId);
  if (!object) return state;

  const fromTrack = findTrackById(state, fromTrackId);
  const toTrack = findTrackById(state, toTrackId);
  if (!fromTrack || !toTrack) return state;

  const updatedObject = newStartTime !== undefined
    ? { ...object, startTime: newStartTime }
    : object;

  return {
    ...state,
    tracks: state.tracks.map(track => {
      if (track.id === fromTrackId) {
        return {
          ...track,
          objects: track.objects.filter(obj => obj.id !== objectId)
        };
      }
      if (track.id === toTrackId) {
        return {
          ...track,
          objects: [...track.objects, updatedObject]
        };
      }
      return track;
    })
  };
}

/**
 * 设置缩放级别
 */
export function setZoom(state: TimelineState, zoomLevel: number, minZoom: number = 0.1, maxZoom: number = 10): TimelineState {
  return {
    ...state,
    zoomLevel: Math.max(minZoom, Math.min(maxZoom, zoomLevel))
  };
}

/**
 * 设置滚动位置
 */
export function setScroll(state: TimelineState, scrollPosition: number): TimelineState {
  return {
    ...state,
    scrollPosition: Math.max(0, scrollPosition)
  };
}

/**
 * 获取时间范围
 */
export function getTimeRange(state: TimelineState): { start: number; end: number } {
  let start = Infinity;
  let end = -Infinity;

  for (const track of state.tracks) {
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
 * 获取轨道数量
 */
export function getTrackCount(state: TimelineState): number {
  return state.tracks.length;
}

/**
 * 获取对象总数
 */
export function getObjectCount(state: TimelineState): number {
  return state.tracks.reduce((count, track) => count + track.objects.length, 0);
}

/**
 * 获取所有对象
 */
export function getAllObjects(state: TimelineState): TimelineObject[] {
  return state.tracks.flatMap(track => track.objects);
}

/**
 * 按时间顺序获取所有对象
 */
export function getObjectsByTime(state: TimelineState): TimelineObject[] {
  return getAllObjects(state).sort((a, b) => a.startTime - b.startTime);
}

/**
 * 获取指定时间范围内的对象
 */
export function getObjectsInTimeRange(state: TimelineState, startTime: number, endTime: number): TimelineObject[] {
  return getAllObjects(state).filter(object => {
    const objectEndTime = object.type === 'duration' && object.duration
      ? object.startTime + object.duration
      : object.startTime;
    return object.startTime <= endTime && objectEndTime >= startTime;
  });
}

/**
 * 复制对象
 */
export function duplicateObject(state: TimelineState, objectId: string, offset: number = 0): TimelineState {
  const object = findObjectById(state, objectId);
  if (!object) return state;

  const track = findTrackByObjectId(state, objectId);
  if (!track) return state;

  const duplicatedObject: TimelineObject = {
    ...object,
    id: generateId(),
    startTime: object.startTime + offset,
    properties: {
      ...object.properties,
      name: `${object.properties.name || 'Object'} (Copy)`
    }
  };

  return addObjectToTrack(state, track.id, duplicatedObject);
}

/**
 * 批量创建对象
 */
export function batchCreateObjects(
  state: TimelineState,
  trackId: string,
  objects: Array<Omit<TimelineObject, 'id'>>
): TimelineState {
  return objects.reduce((currentState, objectData) =>
    addObjectToTrack(currentState, trackId, objectData),
    state
  );
}

/**
 * 清空时间轴
 */
export function clearTimeline(state: TimelineState): TimelineState {
  return {
    ...state,
    tracks: [],
    selectedObjectId: null
  };
}

/**
 * 清空轨道
 */
export function clearTrack(state: TimelineState, trackId: string): TimelineState {
  return {
    ...state,
    tracks: state.tracks.map(track =>
      track.id === trackId
        ? { ...track, objects: [] }
        : track
    ),
    selectedObjectId: state.selectedObjectId && !findObjectById(state, state.selectedObjectId)
      ? null
      : state.selectedObjectId
  };
}