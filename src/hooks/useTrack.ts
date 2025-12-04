import { useCallback } from 'react';
import { useTimeline } from './useTimeline';
import { Track, TimelineObject } from '../types/timeline';

export interface UseTrackReturn {
  // 轨道信息
  track: Track | null;

  // 轨道操作
  updateName: (name: string) => void;
  remove: () => void;

  // 对象操作
  addObject: (object: Omit<TimelineObject, 'id'>) => void;
  removeObject: (objectId: string) => void;
  updateObject: (objectId: string, updates: Partial<TimelineObject>) => void;
  moveObject: (objectId: string, newStartTime: number) => void;
  duplicateObject: (objectId: string) => void;

  // 工具方法
  getObjectsInTimeRange: (startTime: number, endTime: number) => TimelineObject[];
  hasObject: (objectId: string) => boolean;
}

export interface UseTrackOptions {
  trackId: string;
}

export function useTrack(options: UseTrackOptions): UseTrackReturn {
  const { trackId } = options;
  const timeline = useTimeline();

  // 获取轨道信息
  const track = timeline.getTrackById(trackId);

  // 轨道操作
  const updateName = useCallback((name: string) => {
    timeline.updateTrackName(trackId, name);
  }, [timeline, trackId]);

  const remove = useCallback(() => {
    timeline.removeTrack(trackId);
  }, [timeline, trackId]);

  // 对象操作
  const addObject = useCallback((object: Omit<TimelineObject, 'id'>) => {
    timeline.addObject(trackId, object);
  }, [timeline, trackId]);

  const removeObject = useCallback((objectId: string) => {
    timeline.removeObject(objectId);
  }, [timeline]);

  const updateObject = useCallback((objectId: string, updates: Partial<TimelineObject>) => {
    timeline.updateObject(objectId, updates);
  }, [timeline]);

  const moveObject = useCallback((objectId: string, newStartTime: number) => {
    timeline.moveObject(objectId, newStartTime, trackId);
  }, [timeline, trackId]);

  const duplicateObject = useCallback((objectId: string) => {
    timeline.duplicateObject(objectId);
  }, [timeline]);

  // 工具方法
  const getObjectsInTimeRange = useCallback((startTime: number, endTime: number) => {
    if (!track) return [];
    return track.objects.filter(obj => {
      const objEndTime = obj.type === 'duration' ? obj.startTime + (obj.duration || 0) : obj.startTime;
      return obj.startTime <= endTime && objEndTime >= startTime;
    });
  }, [track]);

  const hasObject = useCallback((objectId: string) => {
    return track?.objects.some(obj => obj.id === objectId) || false;
  }, [track]);

  return {
    // 轨道信息
    track,

    // 轨道操作
    updateName,
    remove,

    // 对象操作
    addObject,
    removeObject,
    updateObject,
    moveObject,
    duplicateObject,

    // 工具方法
    getObjectsInTimeRange,
    hasObject
  };
}