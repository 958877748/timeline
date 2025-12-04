/**
 * 时间轴类型定义测试
 */

import {
  TimelineState,
  Track,
  TimelineObject,
  TimelineObjectType,
  TimelineAction,
  TimelineConfig,
  PropertyTemplate
} from '../../src/types/timeline';

describe('Timeline Types', () => {
  describe('Basic Type Definitions', () => {
    it('should define TimelineObjectType correctly', () => {
      const durationType: TimelineObjectType = 'duration';
      const instantType: TimelineObjectType = 'instant';

      expect(durationType).toBe('duration');
      expect(instantType).toBe('instant');
    });

    it('should create valid TimelineObject', () => {
      const durationObject: TimelineObject = {
        id: 'obj_1',
        type: 'duration',
        startTime: 10,
        duration: 5,
        properties: {
          name: 'Test Object',
          color: '#ff0000'
        }
      };

      const instantObject: TimelineObject = {
        id: 'obj_2',
        type: 'instant',
        startTime: 15,
        properties: {
          name: 'Instant Object',
          color: '#00ff00'
        }
      };

      expect(durationObject.type).toBe('duration');
      expect(durationObject.duration).toBe(5);
      expect(instantObject.type).toBe('instant');
      expect(instantObject.duration).toBeUndefined();
    });

    it('should create valid Track', () => {
      const track: Track = {
        id: 'track_1',
        name: 'Test Track',
        objects: [
          {
            id: 'obj_1',
            type: 'duration',
            startTime: 0,
            duration: 10,
            properties: {}
          }
        ]
      };

      expect(track.id).toBe('track_1');
      expect(track.name).toBe('Test Track');
      expect(track.objects).toHaveLength(1);
    });

    it('should create valid TimelineState', () => {
      const state: TimelineState = {
        tracks: [
          {
            id: 'track_1',
            name: 'Track 1',
            objects: []
          }
        ],
        zoomLevel: 1.5,
        scrollPosition: 100,
        selectedObjectId: 'obj_1'
      };

      expect(state.tracks).toHaveLength(1);
      expect(state.zoomLevel).toBe(1.5);
      expect(state.scrollPosition).toBe(100);
      expect(state.selectedObjectId).toBe('obj_1');
    });
  });

  describe('TimelineAction Types', () => {
    it('should handle ADD_TRACK action', () => {
      const action: TimelineAction = {
        type: 'ADD_TRACK',
        payload: { name: 'New Track' }
      };

      expect(action.type).toBe('ADD_TRACK');
      expect(action.payload.name).toBe('New Track');
    });

    it('should handle ADD_OBJECT action', () => {
      const action: TimelineAction = {
        type: 'ADD_OBJECT',
        payload: {
          trackId: 'track_1',
          object: {
            type: 'duration',
            startTime: 5,
            duration: 10,
            properties: { name: 'New Object' }
          }
        }
      };

      expect(action.type).toBe('ADD_OBJECT');
      expect(action.payload.trackId).toBe('track_1');
      expect(action.payload.object.type).toBe('duration');
    });

    it('should handle UPDATE_OBJECT action', () => {
      const action: TimelineAction = {
        type: 'UPDATE_OBJECT',
        payload: {
          trackId: 'track_1',
          objectId: 'obj_1',
          updates: {
            startTime: 20,
            properties: { name: 'Updated Object' }
          }
        }
      };

      expect(action.type).toBe('UPDATE_OBJECT');
      expect(action.payload.updates.startTime).toBe(20);
    });

    it('should handle SELECT_OBJECT action', () => {
      const action: TimelineAction = {
        type: 'SELECT_OBJECT',
        payload: { objectId: 'obj_1' }
      };

      expect(action.type).toBe('SELECT_OBJECT');
      expect(action.payload.objectId).toBe('obj_1');
    });

    it('should handle SET_ZOOM action', () => {
      const action: TimelineAction = {
        type: 'SET_ZOOM',
        payload: { zoomLevel: 2.5 }
      };

      expect(action.type).toBe('SET_ZOOM');
      expect(action.payload.zoomLevel).toBe(2.5);
    });

    it('should handle MOVE_OBJECT action', () => {
      const action: TimelineAction = {
        type: 'MOVE_OBJECT',
        payload: {
          fromTrackId: 'track_1',
          toTrackId: 'track_2',
          objectId: 'obj_1',
          newStartTime: 15
        }
      };

      expect(action.type).toBe('MOVE_OBJECT');
      expect(action.payload.fromTrackId).toBe('track_1');
      expect(action.payload.toTrackId).toBe('track_2');
      expect(action.payload.newStartTime).toBe(15);
    });
  });

  describe('Configuration Types', () => {
    it('should create valid TimelineConfig', () => {
      const config: TimelineConfig = {
        minZoom: 0.1,
        maxZoom: 10,
        defaultZoom: 1,
        timeUnit: 'seconds',
        fps: 30
      };

      expect(config.minZoom).toBe(0.1);
      expect(config.maxZoom).toBe(10);
      expect(config.timeUnit).toBe('seconds');
    });

    it('should create valid PropertyTemplate', () => {
      const template: PropertyTemplate = {
        name: 'opacity',
        type: 'number',
        label: '透明度',
        defaultValue: 1,
        min: 0,
        max: 1,
        step: 0.1
      };

      expect(template.name).toBe('opacity');
      expect(template.type).toBe('number');
      expect(template.min).toBe(0);
      expect(template.max).toBe(1);
    });

    it('should handle different property template types', () => {
      const stringTemplate: PropertyTemplate = {
        name: 'name',
        type: 'string',
        label: '名称'
      };

      const selectTemplate: PropertyTemplate = {
        name: 'color',
        type: 'select',
        label: '颜色',
        options: ['red', 'green', 'blue']
      };

      const booleanTemplate: PropertyTemplate = {
        name: 'visible',
        type: 'boolean',
        label: '可见性'
      };

      expect(stringTemplate.type).toBe('string');
      expect(selectTemplate.type).toBe('select');
      expect(selectTemplate.options).toEqual(['red', 'green', 'blue']);
      expect(booleanTemplate.type).toBe('boolean');
    });
  });

  describe('Type Safety', () => {
    it('should enforce type constraints', () => {
      // 测试duration对象必须有duration属性
      const durationObject: TimelineObject = {
        id: 'obj_1',
        type: 'duration',
        startTime: 0,
        duration: 10, // duration属性是必需的
        properties: {}
      };

      // 测试instant对象不应该有duration属性
      const instantObject: TimelineObject = {
        id: 'obj_2',
        type: 'instant',
        startTime: 5,
        properties: {}
        // duration属性不应该存在
      };

      expect(durationObject.duration).toBeDefined();
      expect(instantObject.duration).toBeUndefined();
    });

    it('should handle flexible properties', () => {
      const object: TimelineObject = {
        id: 'obj_1',
        type: 'duration',
        startTime: 0,
        duration: 10,
        properties: {
          name: 'Test Object',
          color: '#ff0000',
          customProperty: 'custom value',
          nested: {
            value: 42
          }
        }
      };

      expect(object.properties.name).toBe('Test Object');
      expect(object.properties.customProperty).toBe('custom value');
      expect(object.properties.nested.value).toBe(42);
    });
  });
});