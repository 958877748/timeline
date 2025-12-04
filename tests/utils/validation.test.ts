/**
 * 验证函数测试
 */

import {
  validateTimelineObject,
  validateTrack,
  validateTimelineState,
  validateTimelineConfig,
  validatePropertyTemplate,
  validateTimelineProject,
  checkObjectOverlap,
  checkTrackOverlap,
  checkAllTrackOverlaps
} from '../../src/utils/validation';

import {
  TimelineObject,
  TimelineObjectType,
  Track,
  TimelineState,
  TimelineConfig,
  PropertyTemplate
} from '../../src/types/timeline';

describe('Validation Functions', () => {
  describe('validateTimelineObject', () => {
    it('should validate valid duration object', () => {
      const object: TimelineObject = {
        id: 'obj_1',
        type: 'duration',
        startTime: 10,
        duration: 5,
        properties: {
          name: 'Test Object',
          color: '#ff0000'
        }
      };

      const result = validateTimelineObject(object);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid instant object', () => {
      const object: TimelineObject = {
        id: 'obj_2',
        type: 'instant',
        startTime: 15,
        properties: {
          name: 'Instant Object'
        }
      };

      const result = validateTimelineObject(object);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid object structure', () => {
      const result = validateTimelineObject(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('时间轴对象必须是对象类型');
    });

    it('should detect missing ID', () => {
      const object = {
        type: 'duration',
        startTime: 10,
        duration: 5,
        properties: {}
      } as any;

      const result = validateTimelineObject(object);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('时间轴对象必须有字符串类型的ID');
    });

    it('should detect invalid type', () => {
      const object = {
        id: 'obj_1',
        type: 'invalid_type',
        startTime: 10,
        properties: {}
      } as any;

      const result = validateTimelineObject(object);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('时间轴对象类型必须是 "duration" 或 "instant"');
    });

    it('should detect negative start time', () => {
      const object: TimelineObject = {
        id: 'obj_1',
        type: 'duration',
        startTime: -10,
        duration: 5,
        properties: {}
      };

      const result = validateTimelineObject(object);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('开始时间必须是非负数');
    });

    it('should detect missing duration for duration object', () => {
      const object = {
        id: 'obj_1',
        type: 'duration',
        startTime: 10,
        properties: {}
      } as any;

      const result = validateTimelineObject(object);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('持续时间对象必须有正数的持续时间');
    });

    it('should detect invalid duration for duration object', () => {
      const object: TimelineObject = {
        id: 'obj_1',
        type: 'duration',
        startTime: 10,
        duration: 0,
        properties: {}
      };

      const result = validateTimelineObject(object);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('持续时间对象必须有正数的持续时间');
    });

    it('should warn about duration on instant object', () => {
      const object: TimelineObject = {
        id: 'obj_1',
        type: 'instant',
        startTime: 10,
        duration: 5,
        properties: {}
      };

      const result = validateTimelineObject(object);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('瞬间对象不应该有duration属性');
    });

    it('should detect missing properties', () => {
      const object = {
        id: 'obj_1',
        type: 'duration',
        startTime: 10,
        duration: 5
      } as any;

      const result = validateTimelineObject(object);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('时间轴对象必须有properties对象');
    });

    it('should validate color values', () => {
      const object: TimelineObject = {
        id: 'obj_1',
        type: 'duration',
        startTime: 10,
        duration: 5,
        properties: {
          color: 'invalid_color'
        }
      };

      const result = validateTimelineObject(object);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('颜色值格式不正确，应该是有效的CSS颜色值');
    });

    it('should validate opacity values', () => {
      const object: TimelineObject = {
        id: 'obj_1',
        type: 'duration',
        startTime: 10,
        duration: 5,
        properties: {
          opacity: 1.5
        }
      };

      const result = validateTimelineObject(object);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('透明度值应该在0到1之间');
    });

    it('should accept valid color formats', () => {
      const validColors = [
        '#ff0000',
        '#f00',
        'rgb(255, 0, 0)',
        'rgba(255, 0, 0, 0.5)',
        'hsl(0, 100%, 50%)',
        'red',
        'blue',
        'green'
      ];

      validColors.forEach(color => {
        const object: TimelineObject = {
          id: 'obj_1',
          type: 'duration',
          startTime: 10,
          duration: 5,
          properties: { color }
        };

        const result = validateTimelineObject(object);
        expect(result.isValid).toBe(true);
        expect(result.warnings).not.toContain('颜色值格式不正确，应该是有效的CSS颜色值');
      });
    });
  });

  describe('validateTrack', () => {
    it('should validate valid track', () => {
      const track: Track = {
        id: 'track_1',
        name: 'Test Track',
        objects: [
          {
            id: 'obj_1',
            type: 'duration',
            startTime: 10,
            duration: 5,
            properties: {}
          }
        ]
      };

      const result = validateTrack(track);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid track structure', () => {
      const result = validateTrack(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('轨道必须是对象类型');
    });

    it('should detect missing track ID', () => {
      const track = {
        name: 'Test Track',
        objects: []
      } as any;

      const result = validateTrack(track);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('轨道必须有字符串类型的ID');
    });

    it('should detect missing track name', () => {
      const track = {
        id: 'track_1',
        objects: []
      } as any;

      const result = validateTrack(track);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('轨道必须有字符串类型的名称');
    });

    it('should detect invalid objects array', () => {
      const track = {
        id: 'track_1',
        name: 'Test Track',
        objects: 'not an array'
      } as any;

      const result = validateTrack(track);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('轨道必须有objects数组');
    });

    it('should validate objects within track', () => {
      const track: Track = {
        id: 'track_1',
        name: 'Test Track',
        objects: [
          {
            id: 'obj_1',
            type: 'duration',
            startTime: -5, // 无效的开始时间
            duration: 5,
            properties: {}
          }
        ]
      };

      const result = validateTrack(track);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('轨道中对象[0]验证失败');
    });

    it('should detect duplicate object IDs', () => {
      const track: Track = {
        id: 'track_1',
        name: 'Test Track',
        objects: [
          {
            id: 'duplicate_id',
            type: 'duration',
            startTime: 10,
            duration: 5,
            properties: {}
          },
          {
            id: 'duplicate_id',
            type: 'instant',
            startTime: 20,
            properties: {}
          }
        ]
      };

      const result = validateTrack(track);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('轨道中存在重复的对象ID: duplicate_id');
    });
  });

  describe('validateTimelineState', () => {
    it('should validate valid timeline state', () => {
      const state: TimelineState = {
        tracks: [
          {
            id: 'track_1',
            name: 'Test Track',
            objects: [
              {
                id: 'obj_1',
                type: 'duration',
                startTime: 10,
                duration: 5,
                properties: {}
              }
            ]
          }
        ],
        zoomLevel: 1,
        scrollPosition: 0,
        selectedObjectId: null
      };

      const result = validateTimelineState(state);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid state structure', () => {
      const result = validateTimelineState(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('时间轴状态必须是对象类型');
    });

    it('should detect missing tracks array', () => {
      const state = {
        zoomLevel: 1,
        scrollPosition: 0,
        selectedObjectId: null
      } as any;

      const result = validateTimelineState(state);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('时间轴状态必须有tracks数组');
    });

    it('should validate tracks within state', () => {
      const state: TimelineState = {
        tracks: [
          {
            id: 'track_1',
            name: 'Test Track',
            objects: [
              {
                id: 'obj_1',
                type: 'invalid_type', // 无效类型
                startTime: 10,
                properties: {}
              }
            ]
          }
        ],
        zoomLevel: 1,
        scrollPosition: 0,
        selectedObjectId: null
      };

      const result = validateTimelineState(state);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('轨道[0]验证失败');
    });

    it('should detect duplicate track IDs', () => {
      const state: TimelineState = {
        tracks: [
          {
            id: 'duplicate_id',
            name: 'Track 1',
            objects: []
          },
          {
            id: 'duplicate_id',
            name: 'Track 2',
            objects: []
          }
        ],
        zoomLevel: 1,
        scrollPosition: 0,
        selectedObjectId: null
      };

      const result = validateTimelineState(state);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('存在重复的轨道ID: duplicate_id');
    });

    it('should validate zoom level', () => {
      const state: TimelineState = {
        tracks: [],
        zoomLevel: 0,
        scrollPosition: 0,
        selectedObjectId: null
      };

      const result = validateTimelineState(state);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('缩放级别必须是正数');
    });

    it('should validate scroll position', () => {
      const state: TimelineState = {
        tracks: [],
        zoomLevel: 1,
        scrollPosition: -10,
        selectedObjectId: null
      };

      const result = validateTimelineState(state);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('滚动位置必须是非负数');
    });

    it('should validate selected object ID', () => {
      const state: TimelineState = {
        tracks: [],
        zoomLevel: 1,
        scrollPosition: 0,
        selectedObjectId: 123 as any // 无效类型
      };

      const result = validateTimelineState(state);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('选中的对象ID必须是字符串或null');
    });

    it('should warn about non-existent selected object', () => {
      const state: TimelineState = {
        tracks: [],
        zoomLevel: 1,
        scrollPosition: 0,
        selectedObjectId: 'non_existent'
      };

      const result = validateTimelineState(state);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('选中的对象ID在轨道中不存在');
    });
  });

  describe('validateTimelineConfig', () => {
    it('should validate valid config', () => {
      const config: TimelineConfig = {
        minZoom: 0.1,
        maxZoom: 10,
        defaultZoom: 1,
        timeUnit: 'seconds'
      };

      const result = validateTimelineConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid config structure', () => {
      const result = validateTimelineConfig(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('配置必须是对象类型');
    });

    it('should validate zoom values', () => {
      const config = {
        minZoom: 0,
        maxZoom: 10,
        defaultZoom: 1,
        timeUnit: 'seconds'
      } as any;

      const result = validateTimelineConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('最小缩放必须是正数');
    });

    it('should validate zoom range', () => {
      const config = {
        minZoom: 5,
        maxZoom: 2,
        defaultZoom: 1,
        timeUnit: 'seconds'
      } as any;

      const result = validateTimelineConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('最小缩放必须小于最大缩放');
    });

    it('should validate time unit', () => {
      const config = {
        minZoom: 0.1,
        maxZoom: 10,
        defaultZoom: 1,
        timeUnit: 'invalid_unit'
      } as any;

      const result = validateTimelineConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('时间单位必须是 "seconds" 或 "frames"');
    });

    it('should validate fps', () => {
      const config = {
        minZoom: 0.1,
        maxZoom: 10,
        defaultZoom: 1,
        timeUnit: 'frames',
        fps: 0
      } as any;

      const result = validateTimelineConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('帧率必须是正数');
    });

    it('should warn about fps with non-frame time unit', () => {
      const config = {
        minZoom: 0.1,
        maxZoom: 10,
        defaultZoom: 1,
        timeUnit: 'seconds',
        fps: 30
      } as any;

      const result = validateTimelineConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('只有在帧时间单位下才需要设置帧率');
    });
  });

  describe('validatePropertyTemplate', () => {
    it('should validate valid property template', () => {
      const template: PropertyTemplate = {
        name: 'opacity',
        type: 'number',
        label: '透明度',
        min: 0,
        max: 1,
        step: 0.1
      };

      const result = validatePropertyTemplate(template);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid template structure', () => {
      const result = validatePropertyTemplate(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('属性模板必须是对象类型');
    });

    it('should validate template name', () => {
      const template = {
        type: 'string',
        label: 'Name'
      } as any;

      const result = validatePropertyTemplate(template);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('属性模板必须有字符串类型的名称');
    });

    it('should validate template type', () => {
      const template = {
        name: 'test',
        type: 'invalid_type',
        label: 'Test'
      } as any;

      const result = validatePropertyTemplate(template);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('属性模板类型必须是以下之一: string, number, boolean, color, select, multiselect');
    });

    it('should validate number template constraints', () => {
      const template = {
        name: 'opacity',
        type: 'number',
        label: '透明度',
        min: 'invalid' as any,
        max: 1,
        step: 0.1
      };

      const result = validatePropertyTemplate(template);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('数字类型的最小值必须是数字');
    });

    it('should validate select template options', () => {
      const template = {
        name: 'color',
        type: 'select',
        label: '颜色'
      } as any;

      const result = validatePropertyTemplate(template);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('选择类型必须有options数组');
    });
  });

  describe('validateTimelineProject', () => {
    it('should validate complete project', () => {
      const state: TimelineState = {
        tracks: [],
        zoomLevel: 1,
        scrollPosition: 0,
        selectedObjectId: null
      };

      const config: TimelineConfig = {
        minZoom: 0.1,
        maxZoom: 10,
        defaultZoom: 1,
        timeUnit: 'seconds'
      };

      const result = validateTimelineProject(state, config);
      expect(result.isValid).toBe(true);
    });

    it('should combine state and config validation errors', () => {
      const state: TimelineState = {
        tracks: [],
        zoomLevel: 0,
        scrollPosition: -10,
        selectedObjectId: null
      };

      const config: TimelineConfig = {
        minZoom: 5,
        maxZoom: 2,
        defaultZoom: 1,
        timeUnit: 'seconds'
      };

      const result = validateTimelineProject(state, config);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('checkObjectOverlap', () => {
    it('should detect overlapping duration objects', () => {
      const obj1: TimelineObject = {
        id: 'obj_1',
        type: 'duration',
        startTime: 10,
        duration: 10,
        properties: {}
      };

      const obj2: TimelineObject = {
        id: 'obj_2',
        type: 'duration',
        startTime: 15,
        duration: 10,
        properties: {}
      };

      const overlap = checkObjectOverlap(obj1, obj2);
      expect(overlap).toBe(true);
    });

    it('should not detect overlap for non-overlapping objects', () => {
      const obj1: TimelineObject = {
        id: 'obj_1',
        type: 'duration',
        startTime: 10,
        duration: 5,
        properties: {}
      };

      const obj2: TimelineObject = {
        id: 'obj_2',
        type: 'duration',
        startTime: 20,
        duration: 5,
        properties: {}
      };

      const overlap = checkObjectOverlap(obj1, obj2);
      expect(overlap).toBe(false);
    });

    it('should handle instant objects', () => {
      const obj1: TimelineObject = {
        id: 'obj_1',
        type: 'instant',
        startTime: 10,
        properties: {}
      };

      const obj2: TimelineObject = {
        id: 'obj_2',
        type: 'duration',
        startTime: 8,
        duration: 5,
        properties: {}
      };

      const overlap = checkObjectOverlap(obj1, obj2);
      expect(overlap).toBe(true);
    });

    it('should not detect overlap for same object', () => {
      const obj: TimelineObject = {
        id: 'obj_1',
        type: 'duration',
        startTime: 10,
        duration: 5,
        properties: {}
      };

      const overlap = checkObjectOverlap(obj, obj);
      expect(overlap).toBe(false);
    });
  });

  describe('checkTrackOverlap', () => {
    it('should detect overlapping objects in track', () => {
      const track: Track = {
        id: 'track_1',
        name: 'Test Track',
        objects: [
          {
            id: 'obj_1',
            type: 'duration',
            startTime: 10,
            duration: 10,
            properties: { name: 'Object 1' }
          },
          {
            id: 'obj_2',
            type: 'duration',
            startTime: 15,
            duration: 10,
            properties: { name: 'Object 2' }
          }
        ]
      };

      const result = checkTrackOverlap(track);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('存在时间重叠');
    });

    it('should not warn for non-overlapping objects', () => {
      const track: Track = {
        id: 'track_1',
        name: 'Test Track',
        objects: [
          {
            id: 'obj_1',
            type: 'duration',
            startTime: 10,
            duration: 5,
            properties: { name: 'Object 1' }
          },
          {
            id: 'obj_2',
            type: 'duration',
            startTime: 20,
            duration: 5,
            properties: { name: 'Object 2' }
          }
        ]
      };

      const result = checkTrackOverlap(track);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle empty track', () => {
      const track: Track = {
        id: 'track_1',
        name: 'Empty Track',
        objects: []
      };

      const result = checkTrackOverlap(track);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('checkAllTrackOverlaps', () => {
    it('should check all tracks for overlaps', () => {
      const state: TimelineState = {
        tracks: [
          {
            id: 'track_1',
            name: 'Track 1',
            objects: [
              {
                id: 'obj_1',
                type: 'duration',
                startTime: 10,
                duration: 10,
                properties: { name: 'Object 1' }
              },
              {
                id: 'obj_2',
                type: 'duration',
                startTime: 15,
                duration: 10,
                properties: { name: 'Object 2' }
              }
            ]
          },
          {
            id: 'track_2',
            name: 'Track 2',
            objects: [
              {
                id: 'obj_3',
                type: 'duration',
                startTime: 30,
                duration: 10,
                properties: { name: 'Object 3' }
              }
            ]
          }
        ],
        zoomLevel: 1,
        scrollPosition: 0,
        selectedObjectId: null
      };

      const result = checkAllTrackOverlaps(state);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Track 1');
    });

    it('should handle timeline with no overlaps', () => {
      const state: TimelineState = {
        tracks: [
          {
            id: 'track_1',
            name: 'Track 1',
            objects: [
              {
                id: 'obj_1',
                type: 'duration',
                startTime: 10,
                duration: 5,
                properties: { name: 'Object 1' }
              }
            ]
          }
        ],
        zoomLevel: 1,
        scrollPosition: 0,
        selectedObjectId: null
      };

      const result = checkAllTrackOverlaps(state);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Edge Cases and Comprehensive Validation', () => {
    it('should handle complex nested validation errors', () => {
      const state: TimelineState = {
        tracks: [
          {
            id: 'track_1',
            name: 'Test Track',
            objects: [
              {
                id: 'obj_1',
                type: 'duration',
                startTime: -5,
                duration: 0,
                properties: null
              } as any
            ]
          }
        ],
        zoomLevel: -1,
        scrollPosition: -10,
        selectedObjectId: 123 as any
      };

      const result = validateTimelineState(state);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty arrays and null values appropriately', () => {
      const state: TimelineState = {
        tracks: [],
        zoomLevel: 1,
        scrollPosition: 0,
        selectedObjectId: null
      };

      const result = validateTimelineState(state);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should provide detailed error messages for debugging', () => {
      const track: Track = {
        id: 'track_1',
        name: 'Test Track',
        objects: [
          {
            id: 'obj_1',
            type: 'invalid_type',
            startTime: 'invalid' as any,
            properties: {}
          } as any
        ]
      };

      const result = validateTrack(track);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('轨道中对象[0]验证失败');
    });
  });
});