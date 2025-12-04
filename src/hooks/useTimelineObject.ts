import { useCallback } from 'react';
import { useTimeline } from './useTimeline';
import { TimelineObject } from '../types/timeline';

export interface UseTimelineObjectReturn {
  // 对象信息
  object: TimelineObject | null;

  // 对象操作
  update: (updates: Partial<TimelineObject>) => void;
  remove: () => void;
  duplicate: () => void;
  move: (newStartTime: number, newTrackId?: string) => void;

  // 属性操作
  updateProperty: (key: string, value: any) => void;
  updateProperties: (properties: Record<string, any>) => void;

  // 选择操作
  select: () => void;
  isSelected: boolean;
}

export interface UseTimelineObjectOptions {
  objectId: string;
}

export function useTimelineObject(options: UseTimelineObjectOptions): UseTimelineObjectReturn {
  const { objectId } = options;
  const timeline = useTimeline();

  // 获取对象信息
  const object = timeline.getObjectById(objectId);
  const isSelected = timeline.state.selectedObjectId === objectId;

  // 对象操作
  const update = useCallback((updates: Partial<TimelineObject>) => {
    timeline.updateObject(objectId, updates);
  }, [timeline, objectId]);

  const remove = useCallback(() => {
    timeline.removeObject(objectId);
  }, [timeline, objectId]);

  const duplicate = useCallback(() => {
    timeline.duplicateObject(objectId);
  }, [timeline, objectId]);

  const move = useCallback((newStartTime: number, newTrackId?: string) => {
    timeline.moveObject(objectId, newStartTime, newTrackId);
  }, [timeline, objectId]);

  // 属性操作
  const updateProperty = useCallback((key: string, value: any) => {
    if (!object) return;
    const updatedProperties = { ...object.properties, [key]: value };
    timeline.updateObject(objectId, { properties: updatedProperties });
  }, [timeline, objectId, object]);

  const updateProperties = useCallback((properties: Record<string, any>) => {
    if (!object) return;
    const updatedProperties = { ...object.properties, ...properties };
    timeline.updateObject(objectId, { properties: updatedProperties });
  }, [timeline, objectId, object]);

  // 选择操作
  const select = useCallback(() => {
    timeline.selectObject(objectId);
  }, [timeline, objectId]);

  return {
    // 对象信息
    object,

    // 对象操作
    update,
    remove,
    duplicate,
    move,

    // 属性操作
    updateProperty,
    updateProperties,

    // 选择操作
    select,
    isSelected
  };
}