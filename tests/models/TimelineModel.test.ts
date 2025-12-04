/**
 * TimelineModel 测试
 */

import { TimelineModel } from '../../src/models/TimelineModel';
import { TimelineState, TimelineObject, Track } from '../../src/types/timeline';

describe('TimelineModel', () => {
  let timeline: TimelineModel;

  beforeEach(() => {
    timeline = new TimelineModel();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const state = timeline.getState();
      expect(state.tracks).toEqual([]);
      expect(state.zoomLevel).toBe(1);
      expect(state.scrollPosition).toBe(0);
      expect(state.selectedObjectId).toBeNull();
    });

    it('should initialize with custom state', () => {
      const customState: Partial<TimelineState> = {
        tracks: [
          {
            id: 'track_1',
            name: 'Test Track',
            objects: []
          }
        ],
        zoomLevel: 2,
        scrollPosition: 50,
        selectedObjectId: 'obj_1'
      };

      const customTimeline = new TimelineModel(customState);
      const state = customTimeline.getState();

      expect(state.tracks).toHaveLength(1);
      expect(state.tracks[0].name).toBe('Test Track');
      expect(state.zoomLevel).toBe(2);
      expect(state.scrollPosition).toBe(50);
      expect(state.selectedObjectId).toBe('obj_1');
    });

    it('should initialize with custom config', () => {
      const customTimeline = new TimelineModel(undefined, {
        minZoom: 0.5,
        maxZoom: 5,
        defaultZoom: 2,
        timeUnit: 'frames',
        fps: 60
      });

      const config = customTimeline.getConfig();
      expect(config.minZoom).toBe(0.5);
      expect(config.maxZoom).toBe(5);
      expect(config.defaultZoom).toBe(2);
      expect(config.timeUnit).toBe('frames');
      expect(config.fps).toBe(60);
    });
  });

  describe('Track Operations', () => {
    it('should add track', () => {
      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'New Track' }
      });

      const state = timeline.getState();
      expect(state.tracks).toHaveLength(1);
      expect(state.tracks[0].name).toBe('New Track');
      expect(state.tracks[0].objects).toEqual([]);
      expect(state.tracks[0].id).toBeDefined();
    });

    it('should remove track', () => {
      // 先添加轨道
      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Track 1' }
      });

      const trackId = timeline.getState().tracks[0].id;

      // 移除轨道
      timeline.dispatch({
        type: 'REMOVE_TRACK',
        payload: { trackId }
      });

      const state = timeline.getState();
      expect(state.tracks).toHaveLength(0);
    });

    it('should handle removing non-existent track', () => {
      const initialState = timeline.getState();

      timeline.dispatch({
        type: 'REMOVE_TRACK',
        payload: { trackId: 'non_existent' }
      });

      const state = timeline.getState();
      expect(state).toEqual(initialState);
    });
  });

  describe('Object Operations', () => {
    let trackId: string;

    beforeEach(() => {
      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Test Track' }
      });
      trackId = timeline.getState().tracks[0].id;
    });

    it('should add duration object', () => {
      timeline.dispatch({
        type: 'ADD_OBJECT',
        payload: {
          trackId,
          object: {
            type: 'duration',
            startTime: 10,
            duration: 5,
            properties: { name: 'Duration Object' }
          }
        }
      });

      const track = timeline.getState().tracks[0];
      expect(track.objects).toHaveLength(1);
      expect(track.objects[0].type).toBe('duration');
      expect(track.objects[0].startTime).toBe(10);
      expect(track.objects[0].duration).toBe(5);
    });

    it('should add instant object', () => {
      timeline.dispatch({
        type: 'ADD_OBJECT',
        payload: {
          trackId,
          object: {
            type: 'instant',
            startTime: 15,
            properties: { name: 'Instant Object' }
          }
        }
      });

      const track = timeline.getState().tracks[0];
      expect(track.objects).toHaveLength(1);
      expect(track.objects[0].type).toBe('instant');
      expect(track.objects[0].startTime).toBe(15);
      expect(track.objects[0].duration).toBeUndefined();
    });

    it('should remove object', () => {
      // 添加对象
      timeline.dispatch({
        type: 'ADD_OBJECT',
        payload: {
          trackId,
          object: {
            type: 'duration',
            startTime: 0,
            duration: 10,
            properties: {}
          }
        }
      });

      const objectId = timeline.getState().tracks[0].objects[0].id;

      // 移除对象
      timeline.dispatch({
        type: 'REMOVE_OBJECT',
        payload: { trackId, objectId }
      });

      const track = timeline.getState().tracks[0];
      expect(track.objects).toHaveLength(0);
    });

    it('should update object', () => {
      // 添加对象
      timeline.dispatch({
        type: 'ADD_OBJECT',
        payload: {
          trackId,
          object: {
            type: 'duration',
            startTime: 0,
            duration: 10,
            properties: { name: 'Original Name' }
          }
        }
      });

      const objectId = timeline.getState().tracks[0].objects[0].id;

      // 更新对象
      timeline.dispatch({
        type: 'UPDATE_OBJECT',
        payload: {
          trackId,
          objectId,
          updates: {
            startTime: 5,
            duration: 15,
            properties: { name: 'Updated Name' }
          }
        }
      });

      const object = timeline.getState().tracks[0].objects[0];
      expect(object.startTime).toBe(5);
      expect(object.duration).toBe(15);
      expect(object.properties.name).toBe('Updated Name');
    });

    it('should handle operations on non-existent track', () => {
      const initialState = timeline.getState();

      // 尝试在非存在轨道上添加对象
      timeline.dispatch({
        type: 'ADD_OBJECT',
        payload: {
          trackId: 'non_existent',
          object: {
            type: 'duration',
            startTime: 0,
            duration: 10,
            properties: {}
          }
        }
      });

      const state = timeline.getState();
      expect(state).toEqual(initialState);
    });
  });

  describe('Selection Operations', () => {
    let trackId: string;
    let objectId: string;

    beforeEach(() => {
      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Test Track' }
      });
      trackId = timeline.getState().tracks[0].id;

      timeline.dispatch({
        type: 'ADD_OBJECT',
        payload: {
          trackId,
          object: {
            type: 'duration',
            startTime: 0,
            duration: 10,
            properties: {}
          }
        }
      });
      objectId = timeline.getState().tracks[0].objects[0].id;
    });

    it('should select object', () => {
      timeline.dispatch({
        type: 'SELECT_OBJECT',
        payload: { objectId }
      });

      const state = timeline.getState();
      expect(state.selectedObjectId).toBe(objectId);
    });

    it('should deselect object', () => {
      // 先选择对象
      timeline.dispatch({
        type: 'SELECT_OBJECT',
        payload: { objectId }
      });

      // 取消选择
      timeline.dispatch({
        type: 'SELECT_OBJECT',
        payload: { objectId: null }
      });

      const state = timeline.getState();
      expect(state.selectedObjectId).toBeNull();
    });

    it('should get selected object', () => {
      timeline.dispatch({
        type: 'SELECT_OBJECT',
        payload: { objectId }
      });

      const selectedObject = timeline.getSelectedObject();
      expect(selectedObject).toBeDefined();
      expect(selectedObject?.id).toBe(objectId);
    });

    it('should find object by ID', () => {
      const foundObject = timeline.findObjectById(objectId);
      expect(foundObject).toBeDefined();
      expect(foundObject?.id).toBe(objectId);
    });

    it('should find track by object ID', () => {
      const foundTrack = timeline.findTrackByObjectId(objectId);
      expect(foundTrack).toBeDefined();
      expect(foundTrack?.id).toBe(trackId);
    });
  });

  describe('View Operations', () => {
    it('should set zoom level', () => {
      timeline.dispatch({
        type: 'SET_ZOOM',
        payload: { zoomLevel: 2.5 }
      });

      const state = timeline.getState();
      expect(state.zoomLevel).toBe(2.5);
    });

    it('should constrain zoom level within limits', () => {
      // 测试最小缩放限制
      timeline.dispatch({
        type: 'SET_ZOOM',
        payload: { zoomLevel: 0.05 }
      });

      let state = timeline.getState();
      expect(state.zoomLevel).toBe(0.1); // 应该是配置的最小值

      // 测试最大缩放限制
      timeline.dispatch({
        type: 'SET_ZOOM',
        payload: { zoomLevel: 20 }
      });

      state = timeline.getState();
      expect(state.zoomLevel).toBe(10); // 应该是配置的最大值
    });

    it('should set scroll position', () => {
      timeline.dispatch({
        type: 'SET_SCROLL',
        payload: { scrollPosition: 150 }
      });

      const state = timeline.getState();
      expect(state.scrollPosition).toBe(150);
    });

    it('should constrain scroll position to non-negative', () => {
      timeline.dispatch({
        type: 'SET_SCROLL',
        payload: { scrollPosition: -50 }
      });

      const state = timeline.getState();
      expect(state.scrollPosition).toBe(0);
    });
  });

  describe('Move Operations', () => {
    let track1Id: string;
    let track2Id: string;
    let objectId: string;

    beforeEach(() => {
      // 创建两个轨道
      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Track 1' }
      });
      track1Id = timeline.getState().tracks[0].id;

      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Track 2' }
      });
      track2Id = timeline.getState().tracks[1].id;

      // 在第一个轨道添加对象
      timeline.dispatch({
        type: 'ADD_OBJECT',
        payload: {
          trackId: track1Id,
          object: {
            type: 'duration',
            startTime: 0,
            duration: 10,
            properties: {}
          }
        }
      });
      objectId = timeline.getState().tracks[0].objects[0].id;
    });

    it('should move object between tracks', () => {
      timeline.dispatch({
        type: 'MOVE_OBJECT',
        payload: {
          fromTrackId: track1Id,
          toTrackId: track2Id,
          objectId,
          newStartTime: 20
        }
      });

      const state = timeline.getState();
      expect(state.tracks[0].objects).toHaveLength(0);
      expect(state.tracks[1].objects).toHaveLength(1);
      expect(state.tracks[1].objects[0].startTime).toBe(20);
    });

    it('should handle move with invalid track IDs', () => {
      const initialState = timeline.getState();

      timeline.dispatch({
        type: 'MOVE_OBJECT',
        payload: {
          fromTrackId: 'invalid_from',
          toTrackId: 'invalid_to',
          objectId,
          newStartTime: 20
        }
      });

      const state = timeline.getState();
      expect(state).toEqual(initialState);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      // 添加一些轨道和对象用于测试
      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Track 1' }
      });

      const trackId = timeline.getState().tracks[0].id;

      // 添加几个对象
      for (let i = 0; i < 3; i++) {
        timeline.dispatch({
          type: 'ADD_OBJECT',
          payload: {
            trackId,
            object: {
              type: 'duration',
              startTime: i * 10,
              duration: 5,
              properties: { name: `Object ${i}` }
            }
          }
        });
      }
    });

    it('should get track count', () => {
      expect(timeline.getTrackCount()).toBe(1);

      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Track 2' }
      });

      expect(timeline.getTrackCount()).toBe(2);
    });

    it('should get object count', () => {
      expect(timeline.getObjectCount()).toBe(3);
    });

    it('should get time range', () => {
      const timeRange = timeline.getTimeRange();
      expect(timeRange.start).toBe(0);
      expect(timeRange.end).toBe(25); // 最后一个对象的结束时间
    });

    it('should get property config', () => {
      const propertyConfig = timeline.getPropertyConfig();
      expect(propertyConfig.propertyTemplates).toBeDefined();
      expect(propertyConfig.propertyTemplates.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle removing track with selected object', () => {
      // 添加轨道和对象
      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Track with Selection' }
      });

      const trackId = timeline.getState().tracks[0].id;

      timeline.dispatch({
        type: 'ADD_OBJECT',
        payload: {
          trackId,
          object: {
            type: 'duration',
            startTime: 0,
            duration: 10,
            properties: {}
          }
        }
      });

      const objectId = timeline.getState().tracks[0].objects[0].id;

      // 选择对象
      timeline.dispatch({
        type: 'SELECT_OBJECT',
        payload: { objectId }
      });

      expect(timeline.getState().selectedObjectId).toBe(objectId);

      // 移除轨道
      timeline.dispatch({
        type: 'REMOVE_TRACK',
        payload: { trackId }
      });

      // 选中对象ID应该被清除
      expect(timeline.getState().selectedObjectId).toBeNull();
    });

    it('should handle removing object with selection', () => {
      // 添加轨道和对象
      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Test Track' }
      });

      const trackId = timeline.getState().tracks[0].id;

      timeline.dispatch({
        type: 'ADD_OBJECT',
        payload: {
          trackId,
          object: {
            type: 'duration',
            startTime: 0,
            duration: 10,
            properties: {}
          }
        }
      });

      const objectId = timeline.getState().tracks[0].objects[0].id;

      // 选择对象
      timeline.dispatch({
        type: 'SELECT_OBJECT',
        payload: { objectId }
      });

      // 移除对象
      timeline.dispatch({
        type: 'REMOVE_OBJECT',
        payload: { trackId, objectId }
      });

      // 选中对象ID应该被清除
      expect(timeline.getState().selectedObjectId).toBeNull();
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();

      // 添加多个轨道和对象来测试ID生成
      for (let i = 0; i < 10; i++) {
        timeline.dispatch({
          type: 'ADD_TRACK',
          payload: { name: `Track ${i}` }
        });

        const trackId = timeline.getState().tracks[i].id;
        ids.add(trackId);

        timeline.dispatch({
          type: 'ADD_OBJECT',
          payload: {
            trackId,
            object: {
              type: 'duration',
              startTime: 0,
              duration: 10,
              properties: {}
            }
          }
        });

        const objectId = timeline.getState().tracks[i].objects[0].id;
        ids.add(objectId);
      }

      // 所有ID应该是唯一的
      expect(ids.size).toBe(20); // 10个轨道ID + 10个对象ID
    });
  });
});