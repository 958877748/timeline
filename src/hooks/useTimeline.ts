import { useState, useCallback, useRef } from 'react';
import { TimelineModel } from '../models/TimelineModel';
import { TimelineState, TimelineConfig, TimelineAction, Track, TimelineObject } from '../types/timeline';

export interface UseTimelineReturn {
  // 状态
  state: TimelineState;
  config: TimelineConfig;

  // 轨道操作
  addTrack: (name?: string) => void;
  removeTrack: (trackId: string) => void;
  updateTrackName: (trackId: string, name: string) => void;

  // 对象操作
  addObject: (trackId: string, object: Omit<TimelineObject, 'id'>) => void;
  removeObject: (objectId: string) => void;
  updateObject: (objectId: string, updates: Partial<TimelineObject>) => void;
  moveObject: (objectId: string, newStartTime: number, newTrackId?: string) => void;
  duplicateObject: (objectId: string) => void;

  // 选择操作
  selectObject: (objectId: string | null) => void;
  clearSelection: () => void;

  // 视图操作
  setZoomLevel: (zoomLevel: number) => void;
  setScrollPosition: (scrollPosition: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;

  // 工具方法
  getSelectedObject: () => TimelineObject | null;
  getTrackById: (trackId: string) => Track | null;
  getObjectById: (objectId: string) => TimelineObject | null;
  getObjectsInTimeRange: (startTime: number, endTime: number) => TimelineObject[];

  // 验证
  validate: () => { errors: string[]; warnings: string[] };
}

export interface UseTimelineOptions {
  initialState?: Partial<TimelineState>;
  config?: Partial<TimelineConfig>;
  onStateChange?: ((state: TimelineState) => void) | undefined;
  onError?: ((error: string) => void) | undefined;
}

export function useTimeline(options: UseTimelineOptions = {}): UseTimelineReturn {
  const { initialState, config, onStateChange, onError } = options;

  // 使用ref来存储模型实例，避免重复创建
  const modelRef = useRef<TimelineModel | null>(null);

  // React状态，用于触发重新渲染
  const [state, setState] = useState<TimelineState>(() => {
    if (!modelRef.current) {
      modelRef.current = new TimelineModel(initialState, config);
    }
    return modelRef.current.getState();
  });

  // 配置状态
  const [timelineConfig] = useState<TimelineConfig>(() =>
    modelRef.current?.getConfig() || {
      minZoom: 0.1,
      maxZoom: 10,
      defaultZoom: 1,
      timeUnit: 'seconds',
      snapToGrid: false,
      gridSize: 1
    }
  );

  // 同步模型状态到React状态
  const syncState = useCallback(() => {
    if (modelRef.current) {
      const newState = modelRef.current.getState();
      setState(newState);
      onStateChange?.(newState);
    }
  }, [onStateChange]);

  // 分发操作的包装函数
  const dispatch = useCallback((action: TimelineAction) => {
    if (!modelRef.current) return;

    try {
      modelRef.current.dispatch(action);
      syncState();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError?.(errorMessage);
      console.error('Timeline action error:', error);
    }
  }, [syncState, onError]);

  // 轨道操作
  const addTrack = useCallback((name?: string) => {
    dispatch({ type: 'ADD_TRACK', payload: { name: name || '新轨道' } });
  }, [dispatch]);

  const removeTrack = useCallback((trackId: string) => {
    dispatch({ type: 'REMOVE_TRACK', payload: { trackId } });
  }, [dispatch]);

  const updateTrackName = useCallback((trackId: string, name: string) => {
    dispatch({ type: 'UPDATE_TRACK_NAME', payload: { trackId, name } });
  }, [dispatch]);

  // 对象操作
  const addObject = useCallback((trackId: string, object: Omit<TimelineObject, 'id'>) => {
    dispatch({ type: 'ADD_OBJECT', payload: { trackId, object } });
  }, [dispatch]);

  const removeObject = useCallback((objectId: string) => {
    dispatch({ type: 'REMOVE_OBJECT', payload: { objectId } });
  }, [dispatch]);

  const updateObject = useCallback((objectId: string, updates: Partial<TimelineObject>) => {
    dispatch({ type: 'UPDATE_OBJECT', payload: { objectId, updates } });
  }, [dispatch]);

  const moveObject = useCallback((objectId: string, newStartTime: number, newTrackId?: string) => {
    const payload: any = { objectId, newStartTime };
    if (newTrackId) {
      payload.newTrackId = newTrackId;
    }
    dispatch({ type: 'MOVE_OBJECT', payload });
  }, [dispatch]);

  const duplicateObject = useCallback((objectId: string) => {
    dispatch({ type: 'DUPLICATE_OBJECT', payload: { objectId } });
  }, [dispatch]);

  // 选择操作
  const selectObject = useCallback((objectId: string | null) => {
    dispatch({ type: 'SELECT_OBJECT', payload: { objectId } });
  }, [dispatch]);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'SELECT_OBJECT', payload: { objectId: null } });
  }, [dispatch]);

  // 视图操作
  const setZoomLevel = useCallback((zoomLevel: number) => {
    dispatch({ type: 'SET_ZOOM_LEVEL', payload: { zoomLevel } });
  }, [dispatch]);

  const setScrollPosition = useCallback((scrollPosition: number) => {
    dispatch({ type: 'SET_SCROLL_POSITION', payload: { scrollPosition } });
  }, [dispatch]);

  const zoomIn = useCallback(() => {
    if (modelRef.current) {
      const currentZoom = state.zoomLevel;
      const newZoom = Math.min(currentZoom * 1.2, timelineConfig.maxZoom);
      setZoomLevel(newZoom);
    }
  }, [state.zoomLevel, timelineConfig.maxZoom, setZoomLevel]);

  const zoomOut = useCallback(() => {
    if (modelRef.current) {
      const currentZoom = state.zoomLevel;
      const newZoom = Math.max(currentZoom / 1.2, timelineConfig.minZoom);
      setZoomLevel(newZoom);
    }
  }, [state.zoomLevel, timelineConfig.minZoom, setZoomLevel]);

  // 工具方法
  const getSelectedObject = useCallback((): TimelineObject | null => {
    if (!modelRef.current || !state.selectedObjectId) return null;
    return modelRef.current.getObjectById(state.selectedObjectId);
  }, [state.selectedObjectId]);

  const getTrackById = useCallback((trackId: string): Track | null => {
    return modelRef.current?.getTrackById(trackId) || null;
  }, []);

  const getObjectById = useCallback((objectId: string): TimelineObject | null => {
    return modelRef.current?.getObjectById(objectId) || null;
  }, []);

  const getObjectsInTimeRange = useCallback((startTime: number, endTime: number): TimelineObject[] => {
    return modelRef.current?.getObjectsInTimeRange(startTime, endTime) || [];
  }, []);

  // 验证
  const validate = useCallback(() => {
    if (!modelRef.current) {
      return { errors: ['Timeline model not initialized'], warnings: [] };
    }
    return modelRef.current.validate();
  }, []);

  return {
    // 状态
    state,
    config: timelineConfig,

    // 轨道操作
    addTrack,
    removeTrack,
    updateTrackName,

    // 对象操作
    addObject,
    removeObject,
    updateObject,
    moveObject,
    duplicateObject,

    // 选择操作
    selectObject,
    clearSelection,

    // 视图操作
    setZoomLevel,
    setScrollPosition,
    zoomIn,
    zoomOut,

    // 工具方法
    getSelectedObject,
    getTrackById,
    getObjectById,
    getObjectsInTimeRange,

    // 验证
    validate
  };
}