/**
 * 时间轴工具函数测试
 */

import {
  createTimelineState,
  createTrack,
  createTimelineObject,
  generateId,
  findObjectById,
  findTrackById,
  findTrackByObjectId,
  addTrack,
  removeTrack,
  addObjectToTrack,
  removeObjectFromTrack,
  updateObject,
  updateObjectById,
  selectObject,
  moveObjectToTrack,
  setZoom,
  setScroll,
  getTimeRange,
  getTrackCount,
  getObjectCount,
  getAllObjects,
  getObjectsByTime,
  getObjectsInTimeRange,
  duplicateObject,
  batchCreateObjects,
  clearTimeline,
  clearTrack
} from '../../src/utils/timelineUtils';

import { TimelineState, TimelineObject, Track, TimelineObjectType } from '../../src/types/timeline';

describe('TimelineUtils', () => {
  describe('Creation Functions', () => {
    describe('createTimelineState', () => {
      it('should create timeline state with default values', () => {
        const state = createTimelineState();

        expect(state.tracks).toEqual([]);
        expect(state.zoomLevel).toBe(1);
        expect(state.scrollPosition).toBe(0);
        expect(state.selectedObjectId).toBeNull();
      });

      it('should create timeline state with custom values', () => {
        const tracks: Track[] = [
          {
            id: 'track_1',
            name: 'Test Track',
            objects: []
          }
        ];

        const state = createTimelineState(tracks, 2, 100, 'obj_1');

        expect(state.tracks).toHaveLength(1);
        expect(state.zoomLevel).toBe(2);
        expect(state.scrollPosition).toBe(100);
        expect(state.selectedObjectId).toBe('obj_1');
      });

      it('should ensure scroll position is non-negative', () => {
        const state = createTimelineState([], 1, -50);
        expect(state.scrollPosition).toBe(0);
      });
    });

    describe('createTrack', () => {
      it('should create track with default values', () => {
        const track = createTrack('Test Track');

        expect(track.name).toBe('Test Track');
        expect(track.objects).toEqual([]);
        expect(track.id).toBeDefined();
        expect(track.id).toMatch(/^id_/);
      });

      it('should create track with objects', () => {
        const objects: TimelineObject[] = [
          {
            id: 'obj_1',
            type: 'duration',
            startTime: 0,
            duration: 10,
            properties: {}
          }
        ];

        const track = createTrack('Test Track', objects);

        expect(track.objects).toHaveLength(1);
        expect(track.objects[0].id).toBe('obj_1');
      });
    });

    describe('createTimelineObject', () => {
      it('should create duration object', () => {
        const object = createTimelineObject('duration', 10, 5, { name: 'Test' });

        expect(object.type).toBe('duration');
        expect(object.startTime).toBe(10);
        expect(object.duration).toBe(5);
        expect(object.properties.name).toBe('Test');
        expect(object.id).toBeDefined();
      });

      it('should create instant object', () => {
        const object = createTimelineObject('instant', 15, undefined, { name: 'Instant' });

        expect(object.type).toBe('instant');
        expect(object.startTime).toBe(15);
        expect(object.duration).toBeUndefined();
        expect(object.properties.name).toBe('Instant');
      });

      it('should ensure start time is non-negative', () => {
        const object = createTimelineObject('duration', -10, 5);
        expect(object.startTime).toBe(0);
      });

      it('should ensure duration is positive for duration objects', () => {
        const object = createTimelineObject('duration', 0, -5);
        expect(object.duration).toBe(0);
      });
    });

    describe('generateId', () => {
      it('should generate unique IDs', () => {
        const id1 = generateId();
        const id2 = generateId();

        expect(id1).not.toBe(id2);
        expect(id1).toMatch(/^id_/);
        expect(id2).toMatch(/^id_/);
      });

      it('should generate IDs with correct format', () => {
        const id = generateId();
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Query Functions', () => {
    let state: TimelineState;
    let trackId: string;
    let objectId: string;

    beforeEach(() => {
      state = createTimelineState();
      const track = createTrack('Test Track');
      trackId = track.id;
      state = addTrack(state, track);

      const object = createTimelineObject('duration', 10, 5, { name: 'Test Object' });
      state = addObjectToTrack(state, trackId, object);
      // 从添加后的状态中获取对象的实际ID（因为addObjectToTrack会生成新ID）
      objectId = state.tracks[0].objects[0].id;
    });

    describe('findObjectById', () => {
      it('should find object by ID', () => {
        const foundObject = findObjectById(state, objectId);
        expect(foundObject).toBeDefined();
        expect(foundObject?.id).toBe(objectId);
        expect(foundObject?.properties.name).toBe('Test Object');
      });

      it('should return null for non-existent object', () => {
        const foundObject = findObjectById(state, 'non_existent');
        expect(foundObject).toBeNull();
      });
    });

    describe('findTrackById', () => {
      it('should find track by ID', () => {
        const foundTrack = findTrackById(state, trackId);
        expect(foundTrack).toBeDefined();
        expect(foundTrack?.id).toBe(trackId);
        expect(foundTrack?.name).toBe('Test Track');
      });

      it('should return null for non-existent track', () => {
        const foundTrack = findTrackById(state, 'non_existent');
        expect(foundTrack).toBeNull();
      });
    });

    describe('findTrackByObjectId', () => {
      it('should find track containing object', () => {
        const foundTrack = findTrackByObjectId(state, objectId);
        expect(foundTrack).toBeDefined();
        expect(foundTrack?.id).toBe(trackId);
      });

      it('should return null for non-existent object', () => {
        const foundTrack = findTrackByObjectId(state, 'non_existent');
        expect(foundTrack).toBeNull();
      });
    });
  });

  describe('Modification Functions', () => {
    let state: TimelineState;

    beforeEach(() => {
      state = createTimelineState();
    });

    describe('addTrack', () => {
      it('should add track to timeline', () => {
        const newState = addTrack(state, { name: 'New Track' });

        expect(newState.tracks).toHaveLength(1);
        expect(newState.tracks[0].name).toBe('New Track');
        expect(newState.tracks[0].id).toBeDefined();
      });

      it('should not modify original state', () => {
        const originalState = { ...state };
        addTrack(state, { name: 'New Track' });

        expect(state).toEqual(originalState);
      });
    });

    describe('removeTrack', () => {
      beforeEach(() => {
        state = addTrack(state, { name: 'Track 1' });
        state = addTrack(state, { name: 'Track 2' });
      });

      it('should remove track by ID', () => {
        const trackId = state.tracks[0].id;
        const newState = removeTrack(state, trackId);

        expect(newState.tracks).toHaveLength(1);
        expect(newState.tracks[0].name).toBe('Track 2');
      });

      it('should clear selection if selected object was in removed track', () => {
        const trackId = state.tracks[0].id;

        // 添加对象并选择
        const object = createTimelineObject('duration', 0, 10);
        state = addObjectToTrack(state, trackId, object);
        state = selectObject(state, object.id);

        expect(state.selectedObjectId).toBe(object.id);

        // 移除轨道
        const newState = removeTrack(state, trackId);
        expect(newState.selectedObjectId).toBeNull();
      });

      it('should handle removing non-existent track', () => {
        const newState = removeTrack(state, 'non_existent');
        expect(newState).toEqual(state);
      });
    });

    describe('addObjectToTrack', () => {
      let trackId: string;

      beforeEach(() => {
        const track = createTrack('Test Track');
        trackId = track.id;
        state = addTrack(state, track);
      });

      it('should add object to track', () => {
        const object = createTimelineObject('duration', 10, 5, { name: 'Test' });
        const newState = addObjectToTrack(state, trackId, object);

        expect(newState.tracks[0].objects).toHaveLength(1);
        expect(newState.tracks[0].objects[0].type).toBe('duration');
        expect(newState.tracks[0].objects[0].properties.name).toBe('Test');
      });

      it('should generate new ID for added object', () => {
        const object = createTimelineObject('duration', 10, 5);
        const originalId = object.id;
        const newState = addObjectToTrack(state, trackId, object);

        expect(newState.tracks[0].objects[0].id).not.toBe(originalId);
      });
    });

    describe('removeObjectFromTrack', () => {
      let trackId: string;
      let objectId: string;

      beforeEach(() => {
        const track = createTrack('Test Track');
        trackId = track.id;
        state = addTrack(state, track);

        const object = createTimelineObject('duration', 10, 5);
        state = addObjectToTrack(state, trackId, object);
        objectId = state.tracks[0].objects[0].id;
      });

      it('should remove object from track', () => {
        const newState = removeObjectFromTrack(state, trackId, objectId);

        expect(newState.tracks[0].objects).toHaveLength(0);
      });

      it('should clear selection if removed object was selected', () => {
        state = selectObject(state, objectId);
        expect(state.selectedObjectId).toBe(objectId);

        const newState = removeObjectFromTrack(state, trackId, objectId);
        expect(newState.selectedObjectId).toBeNull();
      });
    });

    describe('updateObject', () => {
      let trackId: string;
      let objectId: string;

      beforeEach(() => {
        const track = createTrack('Test Track');
        trackId = track.id;
        state = addTrack(state, track);

        const object = createTimelineObject('duration', 10, 5, { name: 'Original' });
        state = addObjectToTrack(state, trackId, object);
        objectId = state.tracks[0].objects[0].id;
      });

      it('should update object properties', () => {
        const updates = {
          startTime: 20,
          duration: 15,
          properties: { name: 'Updated' }
        };

        const newState = updateObject(state, trackId, objectId, updates);
        const updatedObject = newState.tracks[0].objects[0];

        expect(updatedObject.startTime).toBe(20);
        expect(updatedObject.duration).toBe(15);
        expect(updatedObject.properties.name).toBe('Updated');
      });
    });

    describe('updateObjectById', () => {
      let objectId: string;

      beforeEach(() => {
        const track = createTrack('Test Track');
        state = addTrack(state, track);

        const object = createTimelineObject('duration', 10, 5, { name: 'Original' });
        state = addObjectToTrack(state, track.id, object);
        objectId = state.tracks[0].objects[0].id;
      });

      it('should update object by ID without specifying track', () => {
        const updates = {
          properties: { name: 'Updated by ID' }
        };

        const newState = updateObjectById(state, objectId, updates);
        const updatedObject = newState.tracks[0].objects[0];

        expect(updatedObject.properties.name).toBe('Updated by ID');
      });
    });

    describe('selectObject', () => {
      let objectId: string;

      beforeEach(() => {
        const track = createTrack('Test Track');
        state = addTrack(state, track);

        const object = createTimelineObject('duration', 10, 5);
        state = addObjectToTrack(state, track.id, object);
        objectId = state.tracks[0].objects[0].id;
      });

      it('should select object', () => {
        const newState = selectObject(state, objectId);
        expect(newState.selectedObjectId).toBe(objectId);
      });

      it('should deselect object', () => {
        state = selectObject(state, objectId);
        expect(state.selectedObjectId).toBe(objectId);

        const newState = selectObject(state, null);
        expect(newState.selectedObjectId).toBeNull();
      });
    });

    describe('moveObjectToTrack', () => {
      let track1Id: string;
      let track2Id: string;
      let objectId: string;

      beforeEach(() => {
        const track1 = createTrack('Track 1');
        const track2 = createTrack('Track 2');
        track1Id = track1.id;
        track2Id = track2.id;

        state = addTrack(state, track1);
        state = addTrack(state, track2);

        const object = createTimelineObject('duration', 10, 5);
        state = addObjectToTrack(state, track1Id, object);
        objectId = state.tracks[0].objects[0].id;
      });

      it('should move object between tracks', () => {
        const newState = moveObjectToTrack(state, track1Id, track2Id, objectId, 20);

        expect(newState.tracks[0].objects).toHaveLength(0);
        expect(newState.tracks[1].objects).toHaveLength(1);
        expect(newState.tracks[1].objects[0].startTime).toBe(20);
      });

      it('should handle move without time change', () => {
        const newState = moveObjectToTrack(state, track1Id, track2Id, objectId);

        expect(newState.tracks[0].objects).toHaveLength(0);
        expect(newState.tracks[1].objects).toHaveLength(1);
        expect(newState.tracks[1].objects[0].startTime).toBe(10);
      });
    });
  });

  describe('View Functions', () => {
    describe('setZoom', () => {
      it('should set zoom level', () => {
        const state = createTimelineState();
        const newState = setZoom(state, 2.5);

        expect(newState.zoomLevel).toBe(2.5);
      });

      it('should constrain zoom within limits', () => {
        const state = createTimelineState();

        const minZoomState = setZoom(state, 0.05, 0.1, 10);
        expect(minZoomState.zoomLevel).toBe(0.1);

        const maxZoomState = setZoom(state, 15, 0.1, 10);
        expect(maxZoomState.zoomLevel).toBe(10);
      });
    });

    describe('setScroll', () => {
      it('should set scroll position', () => {
        const state = createTimelineState();
        const newState = setScroll(state, 150);

        expect(newState.scrollPosition).toBe(150);
      });

      it('should ensure scroll position is non-negative', () => {
        const state = createTimelineState();
        const newState = setScroll(state, -50);

        expect(newState.scrollPosition).toBe(0);
      });
    });
  });

  describe('Analysis Functions', () => {
    let state: TimelineState;

    beforeEach(() => {
      state = createTimelineState();

      // 添加轨道和对象用于测试
      const track = createTrack('Test Track');
      state = addTrack(state, track);
      const trackId = state.tracks[0].id;

      state = addObjectToTrack(state, trackId, createTimelineObject('duration', 10, 20));
      state = addObjectToTrack(state, trackId, createTimelineObject('instant', 5));
      state = addObjectToTrack(state, trackId, createTimelineObject('duration', 40, 15));
    });

    describe('getTimeRange', () => {
      it('should calculate correct time range', () => {
        const timeRange = getTimeRange(state);
        expect(timeRange.start).toBe(5);
        expect(timeRange.end).toBe(55);
      });

      it('should handle empty timeline', () => {
        const emptyState = createTimelineState();
        const timeRange = getTimeRange(emptyState);
        expect(timeRange.start).toBe(0);
        expect(timeRange.end).toBe(100);
      });
    });

    describe('getTrackCount', () => {
      it('should return correct track count', () => {
        expect(getTrackCount(state)).toBe(1);

        const newTrack = createTrack('New Track');
        const newState = addTrack(state, newTrack);
        expect(getTrackCount(newState)).toBe(2);
      });
    });

    describe('getObjectCount', () => {
      it('should return correct object count', () => {
        expect(getObjectCount(state)).toBe(3);
      });

      it('should return 0 for empty timeline', () => {
        const emptyState = createTimelineState();
        expect(getObjectCount(emptyState)).toBe(0);
      });
    });

    describe('getAllObjects', () => {
      it('should return all objects from all tracks', () => {
        const allObjects = getAllObjects(state);
        expect(allObjects).toHaveLength(3);
      });
    });

    describe('getObjectsByTime', () => {
      it('should return objects sorted by start time', () => {
        const sortedObjects = getObjectsByTime(state);
        expect(sortedObjects).toHaveLength(3);
        expect(sortedObjects[0].startTime).toBe(5);
        expect(sortedObjects[1].startTime).toBe(10);
        expect(sortedObjects[2].startTime).toBe(40);
      });
    });

    describe('getObjectsInTimeRange', () => {
      it('should return objects within time range', () => {
        const objectsInRange = getObjectsInTimeRange(state, 8, 25);
        expect(objectsInRange).toHaveLength(1);

        const startTimes = objectsInRange.map(obj => obj.startTime);
        expect(startTimes).toContain(10); // 只有对象1在范围内
      });

      it('should handle duration objects correctly', () => {
        const objectsInRange = getObjectsInTimeRange(state, 15, 35);
        expect(objectsInRange).toHaveLength(1);

        const startTimes = objectsInRange.map(obj => obj.startTime);
        expect(startTimes).toContain(10); // 只有对象1在范围内（10-30）
      });
    });
  });

  describe('Advanced Functions', () => {
    describe('duplicateObject', () => {
      let state: TimelineState;
      let trackId: string;
      let objectId: string;

      beforeEach(() => {
        state = createTimelineState();
        const track = createTrack('Test Track');
        state = addTrack(state, track);
        trackId = state.tracks[0].id;

        const object = createTimelineObject('duration', 10, 5, { name: 'Original' });
        state = addObjectToTrack(state, trackId, object);
        objectId = state.tracks[0].objects[0].id;
      });

      it('should duplicate object with offset', () => {
        const newState = duplicateObject(state, objectId, 20);

        expect(newState.tracks[0].objects).toHaveLength(2);

        const originalObject = newState.tracks[0].objects.find(obj => obj.id === objectId);
        const duplicatedObject = newState.tracks[0].objects.find(obj => obj.id !== objectId);

        expect(originalObject?.startTime).toBe(10);
        expect(duplicatedObject?.startTime).toBe(30);
        expect(duplicatedObject?.properties.name).toBe('Original (Copy)');
      });

      it('should return original state for non-existent object', () => {
        const newState = duplicateObject(state, 'non_existent', 20);
        expect(newState).toEqual(state);
      });
    });

    describe('batchCreateObjects', () => {
      it('should create multiple objects at once', () => {
        let state = createTimelineState();
        const track = createTrack('Test Track');
        state = addTrack(state, track);
        const trackId = state.tracks[0].id;

        const objects = [
          createTimelineObject('duration', 0, 10, { name: 'Object 1' }),
          createTimelineObject('instant', 15, undefined, { name: 'Object 2' }),
          createTimelineObject('duration', 20, 5, { name: 'Object 3' })
        ];

        const newState = batchCreateObjects(state, trackId, objects);

        expect(newState.tracks[0].objects).toHaveLength(3);
        expect(newState.tracks[0].objects[0].properties.name).toBe('Object 1');
        expect(newState.tracks[0].objects[1].properties.name).toBe('Object 2');
        expect(newState.tracks[0].objects[2].properties.name).toBe('Object 3');
      });
    });

    describe('clearTimeline', () => {
      it('should clear all tracks and selections', () => {
        let state = createTimelineState();

        // 添加轨道和对象
        const track1 = createTrack('Track 1');
        const track2 = createTrack('Track 2');
        state = addTrack(state, track1);
        state = addTrack(state, track2);

        const object = createTimelineObject('duration', 10, 5);
        state = addObjectToTrack(state, state.tracks[0].id, object);
        state = selectObject(state, object.id);

        expect(state.tracks).toHaveLength(2);
        expect(state.selectedObjectId).toBe(object.id);

        // 清空时间轴
        const clearedState = clearTimeline(state);

        expect(clearedState.tracks).toHaveLength(0);
        expect(clearedState.selectedObjectId).toBeNull();
      });
    });

    describe('clearTrack', () => {
      it('should clear specific track', () => {
        let state = createTimelineState();

        const track1 = createTrack('Track 1');
        const track2 = createTrack('Track 2');
        state = addTrack(state, track1);
        state = addTrack(state, track2);

        const track1Id = state.tracks[0].id;
        const track2Id = state.tracks[1].id;

        // 添加对象到两个轨道
        const object1 = createTimelineObject('duration', 10, 5);
        const object2 = createTimelineObject('duration', 20, 5);
        state = addObjectToTrack(state, track1Id, object1);
        state = addObjectToTrack(state, track2Id, object2);

        // 选择第一个对象
        state = selectObject(state, object1.id);

        // 清空第一个轨道
        const newState = clearTrack(state, track1Id);

        expect(newState.tracks[0].objects).toHaveLength(0);
        expect(newState.tracks[1].objects).toHaveLength(1);
        expect(newState.selectedObjectId).toBeNull(); // 选中对象被清除
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle operations on non-existent IDs gracefully', () => {
      const state = createTimelineState();

      // 这些操作应该返回原始状态而不是抛出错误
      expect(removeTrack(state, 'non_existent')).toEqual(state);
      expect(removeObjectFromTrack(state, 'non_existent', 'non_existent')).toEqual(state);
      expect(updateObject(state, 'non_existent', 'non_existent', {})).toEqual(state);
      expect(moveObjectToTrack(state, 'non_existent', 'non_existent', 'non_existent')).toEqual(state);
    });

    it('should handle empty arrays correctly', () => {
      const state = createTimelineState();

      expect(getAllObjects(state)).toEqual([]);
      expect(getObjectsByTime(state)).toEqual([]);
      expect(getObjectsInTimeRange(state, 0, 100)).toEqual([]);
    });

    it('should maintain immutability throughout all operations', () => {
      let state = createTimelineState();
      const originalState = { ...state };

      // 添加轨道
      const track = createTrack('Test Track');
      const newState1 = addTrack(state, track);
      expect(newState1).not.toBe(state);
      expect(state).toEqual(originalState);

      // 添加对象
      const object = createTimelineObject('duration', 10, 5);
      const newState2 = addObjectToTrack(newState1, newState1.tracks[0].id, object);
      expect(newState2).not.toBe(newState1);

      // 更新对象
      const newState3 = updateObject(newState2, newState2.tracks[0].id, newState2.tracks[0].objects[0].id, {
        properties: { name: 'Updated' }
      });
      expect(newState3).not.toBe(newState2);
    });
  });
});