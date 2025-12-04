/**
 * 示例数据测试
 */

import {
  createDurationObject,
  createInstantObject,
  createTrack,
  basicTimelineConfig,
  animationTimelineConfig,
  createSimpleTimelineState,
  createComplexTimelineState,
  createEmptyTimelineState,
  createEducationalTimelineState,
  getAllMockData
} from '../../src/data/mockData';

import { validateTimelineState, validateTimelineConfig } from '../../src/utils/validation';

describe('Mock Data', () => {
  describe('Object Creation Functions', () => {
    describe('createDurationObject', () => {
      it('should create valid duration object', () => {
        const object = createDurationObject(10, 5, { name: 'Test Object' });

        expect(object.type).toBe('duration');
        expect(object.startTime).toBe(10);
        expect(object.duration).toBe(5);
        expect(object.properties.name).toBe('Test Object');
        expect(object.id).toBeUndefined(); // ID should be generated later
      });

      it('should create duration object with default properties', () => {
        const object = createDurationObject(0, 10);

        expect(object.properties.name).toBe('Duration Object 0');
        expect(object.properties.color).toBe('#3b82f6');
        expect(object.properties.opacity).toBe(1);
      });

      it('should override default properties with custom ones', () => {
        const object = createDurationObject(5, 15, {
          name: 'Custom Name',
          color: '#ff0000',
          opacity: 0.8,
          customProp: 'custom value'
        });

        expect(object.properties.name).toBe('Custom Name');
        expect(object.properties.color).toBe('#ff0000');
        expect(object.properties.opacity).toBe(0.8);
        expect(object.properties.customProp).toBe('custom value');
      });

      it('should generate unique IDs when used in track creation', () => {
        const track = createTrack('Test Track', [
          createDurationObject(0, 5),
          createDurationObject(10, 5),
          createDurationObject(20, 5)
        ]);

        const objectIds = track.objects.map(obj => obj.id);
        const uniqueIds = new Set(objectIds);

        expect(uniqueIds.size).toBe(3);
        expect(objectIds[0]).not.toBe(objectIds[1]);
        expect(objectIds[1]).not.toBe(objectIds[2]);
      });
    });

    describe('createInstantObject', () => {
      it('should create valid instant object', () => {
        const object = createInstantObject(15, { name: 'Instant Object' });

        expect(object.type).toBe('instant');
        expect(object.startTime).toBe(15);
        expect(object.duration).toBeUndefined();
        expect(object.properties.name).toBe('Instant Object');
      });

      it('should create instant object with default properties', () => {
        const object = createInstantObject(25);

        expect(object.properties.name).toBe('Instant Object 25');
        expect(object.properties.color).toBe('#ef4444');
        expect(object.properties.opacity).toBe(1);
      });

      it('should allow custom properties', () => {
        const object = createInstantObject(30, {
          effectType: 'flash',
          intensity: 0.8
        });

        expect(object.properties.effectType).toBe('flash');
        expect(object.properties.intensity).toBe(0.8);
      });
    });

    describe('createTrack', () => {
      it('should create valid track', () => {
        const track = createTrack('Test Track');

        expect(track.name).toBe('Test Track');
        expect(track.objects).toEqual([]);
        expect(track.id).toBeDefined();
        expect(track.id).toMatch(/^id_/);
      });

      it('should create track with objects', () => {
        const objects = [
          createDurationObject(0, 10, { name: 'Object 1' }),
          createInstantObject(15, { name: 'Object 2' })
        ];

        const track = createTrack('Test Track', objects);

        expect(track.objects).toHaveLength(2);
        expect(track.objects[0].properties.name).toBe('Object 1');
        expect(track.objects[1].properties.name).toBe('Object 2');
      });

      it('should assign unique IDs to objects', () => {
        const track = createTrack('Test Track', [
          createDurationObject(0, 5),
          createDurationObject(10, 5),
          createDurationObject(20, 5)
        ]);

        const ids = track.objects.map(obj => obj.id);
        const uniqueIds = new Set(ids);

        expect(uniqueIds.size).toBe(3);
        expect(ids.every(id => id && id.startsWith('id_'))).toBe(true);
      });
    });
  });

  describe('Configuration Objects', () => {
    describe('basicTimelineConfig', () => {
      it('should have correct basic configuration values', () => {
        expect(basicTimelineConfig.minZoom).toBe(0.5);
        expect(basicTimelineConfig.maxZoom).toBe(5);
        expect(basicTimelineConfig.defaultZoom).toBe(1);
        expect(basicTimelineConfig.timeUnit).toBe('seconds');
      });

      it('should be valid configuration', () => {
        const result = validateTimelineConfig(basicTimelineConfig);
        expect(result.isValid).toBe(true);
      });
    });

    describe('animationTimelineConfig', () => {
      it('should have correct animation configuration values', () => {
        expect(animationTimelineConfig.minZoom).toBe(0.1);
        expect(animationTimelineConfig.maxZoom).toBe(10);
        expect(animationTimelineConfig.defaultZoom).toBe(1);
        expect(animationTimelineConfig.timeUnit).toBe('frames');
        expect(animationTimelineConfig.fps).toBe(30);
      });

      it('should be valid configuration', () => {
        const result = validateTimelineConfig(animationTimelineConfig);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Timeline State Creators', () => {
    describe('createSimpleTimelineState', () => {
      it('should create valid simple timeline state', () => {
        const state = createSimpleTimelineState();

        expect(state.tracks).toHaveLength(2);
        expect(state.tracks[0].name).toBe('视频轨道');
        expect(state.tracks[1].name).toBe('音频轨道');
        expect(state.zoomLevel).toBe(1);
        expect(state.scrollPosition).toBe(0);
        expect(state.selectedObjectId).toBeNull();
      });

      it('should have correct objects in video track', () => {
        const state = createSimpleTimelineState();
        const videoTrack = state.tracks[0];

        expect(videoTrack.objects).toHaveLength(2);
        expect(videoTrack.objects[0].type).toBe('duration');
        expect(videoTrack.objects[0].startTime).toBe(0);
        expect(videoTrack.objects[0].duration).toBe(10);
        expect(videoTrack.objects[0].properties.name).toBe('片头视频');

        expect(videoTrack.objects[1].startTime).toBe(15);
        expect(videoTrack.objects[1].duration).toBe(20);
        expect(videoTrack.objects[1].properties.name).toBe('主要内容');
      });

      it('should have correct objects in audio track', () => {
        const state = createSimpleTimelineState();
        const audioTrack = state.tracks[1];

        expect(audioTrack.objects).toHaveLength(1);
        expect(audioTrack.objects[0].type).toBe('duration');
        expect(audioTrack.objects[0].startTime).toBe(0);
        expect(audioTrack.objects[0].duration).toBe(35);
        expect(audioTrack.objects[0].properties.name).toBe('背景音乐');
        expect(audioTrack.objects[0].properties.volume).toBe(0.5);
      });

      it('should be valid timeline state', () => {
        const state = createSimpleTimelineState();
        const result = validateTimelineState(state);
        expect(result.isValid).toBe(true);
      });
    });

    describe('createComplexTimelineState', () => {
      it('should create valid complex timeline state', () => {
        const state = createComplexTimelineState();

        expect(state.tracks).toHaveLength(4);
        expect(state.tracks[0].name).toBe('摄像机轨道');
        expect(state.tracks[1].name).toBe('角色轨道');
        expect(state.tracks[2].name).toBe('特效轨道');
        expect(state.tracks[3].name).toBe('灯光轨道');
      });

      it('should have camera track with single long duration object', () => {
        const state = createComplexTimelineState();
        const cameraTrack = state.tracks[0];

        expect(cameraTrack.objects).toHaveLength(1);
        expect(cameraTrack.objects[0].properties.name).toBe('主摄像机');
        expect(cameraTrack.objects[0].duration).toBe(120);
        expect(cameraTrack.objects[0].properties.position).toEqual({ x: 0, y: 0, z: 0 });
        expect(cameraTrack.objects[0].properties.fov).toBe(60);
      });

      it('should have character track with multiple objects', () => {
        const state = createComplexTimelineState();
        const characterTrack = state.tracks[1];

        expect(characterTrack.objects).toHaveLength(2);
        expect(characterTrack.objects[0].properties.name).toBe('主角出场');
        expect(characterTrack.objects[0].startTime).toBe(0);
        expect(characterTrack.objects[0].properties.animation).toBe('walk');

        expect(characterTrack.objects[1].properties.name).toBe('主角对话');
        expect(characterTrack.objects[1].startTime).toBe(60);
        expect(characterTrack.objects[1].properties.animation).toBe('talk');
      });

      it('should have effects track with instant objects', () => {
        const state = createComplexTimelineState();
        const effectsTrack = state.tracks[2];

        expect(effectsTrack.objects).toHaveLength(2);
        expect(effectsTrack.objects[0].type).toBe('instant');
        expect(effectsTrack.objects[0].properties.name).toBe('爆炸特效');
        expect(effectsTrack.objects[0].properties.effectType).toBe('explosion');

        expect(effectsTrack.objects[1].type).toBe('instant');
        expect(effectsTrack.objects[1].properties.name).toBe('闪光特效');
        expect(effectsTrack.objects[1].properties.effectType).toBe('flash');
      });

      it('should be valid complex timeline state', () => {
        const state = createComplexTimelineState();
        const result = validateTimelineState(state);
        expect(result.isValid).toBe(true);
      });
    });

    describe('createEmptyTimelineState', () => {
      it('should create empty timeline state', () => {
        const state = createEmptyTimelineState();

        expect(state.tracks).toHaveLength(0);
        expect(state.zoomLevel).toBe(1);
        expect(state.scrollPosition).toBe(0);
        expect(state.selectedObjectId).toBeNull();
      });

      it('should be valid empty timeline state', () => {
        const state = createEmptyTimelineState();
        const result = validateTimelineState(state);
        expect(result.isValid).toBe(true);
      });
    });

    describe('createEducationalTimelineState', () => {
      it('should create educational timeline state', () => {
        const state = createEducationalTimelineState();

        expect(state.tracks).toHaveLength(1);
        expect(state.tracks[0].name).toBe('演示轨道');
        expect(state.selectedObjectId).toBe('demo_1');
      });

      it('should have various object types for demonstration', () => {
        const state = createEducationalTimelineState();
        const demoTrack = state.tracks[0];

        expect(demoTrack.objects).toHaveLength(5);

        // 短持续时间对象
        expect(demoTrack.objects[0].type).toBe('duration');
        expect(demoTrack.objects[0].duration).toBe(5);
        expect(demoTrack.objects[0].properties.name).toBe('短持续时间对象');

        // 瞬间对象
        expect(demoTrack.objects[1].type).toBe('instant');
        expect(demoTrack.objects[1].properties.name).toBe('瞬间对象');

        // 长持续时间对象
        expect(demoTrack.objects[2].type).toBe('duration');
        expect(demoTrack.objects[2].duration).toBe(15);
        expect(demoTrack.objects[2].properties.name).toBe('长持续时间对象');
        expect(demoTrack.objects[2].properties.opacity).toBe(0.8);

        // 重叠对象1
        expect(demoTrack.objects[3].type).toBe('duration');
        expect(demoTrack.objects[3].startTime).toBe(20);
        expect(demoTrack.objects[3].duration).toBe(10);
        expect(demoTrack.objects[3].properties.name).toBe('重叠对象1');

        // 重叠对象2
        expect(demoTrack.objects[4].type).toBe('duration');
        expect(demoTrack.objects[4].startTime).toBe(25);
        expect(demoTrack.objects[4].duration).toBe(10);
        expect(demoTrack.objects[4].properties.name).toBe('重叠对象2');
      });

      it('should be valid educational timeline state', () => {
        const state = createEducationalTimelineState();
        const result = validateTimelineState(state);
        expect(result.isValid).toBe(true);
      });

      it('should demonstrate time overlap', () => {
        const state = createEducationalTimelineState();
        const demoTrack = state.tracks[0];

        const overlap1 = demoTrack.objects[3]; // 20-30
        const overlap2 = demoTrack.objects[4]; // 25-35

        expect(overlap1.startTime).toBeLessThan(overlap2.startTime + (overlap2.duration || 0));
        expect(overlap1.startTime + (overlap1.duration || 0)).toBeGreaterThan(overlap2.startTime);
      });
    });
  });

  describe('Helper Functions', () => {
    describe('getAllMockData', () => {
      it('should return all mock data types', () => {
        const allData = getAllMockData();

        expect(allData).toHaveProperty('simple');
        expect(allData).toHaveProperty('complex');
        expect(allData).toHaveProperty('empty');
        expect(allData).toHaveProperty('educational');
      });

      it('should return valid timeline states', () => {
        const allData = getAllMockData();

        Object.entries(allData).forEach(([key, state]) => {
          const result = validateTimelineState(state);
          expect(result.isValid).toBe(true);
        });
      });

      it('should have different characteristics for each type', () => {
        const allData = getAllMockData();

        // Simple should have 2 tracks
        expect(allData.simple.tracks).toHaveLength(2);

        // Complex should have 4 tracks
        expect(allData.complex.tracks).toHaveLength(4);

        // Empty should have no tracks
        expect(allData.empty.tracks).toHaveLength(0);

        // Educational should have 1 track with pre-selected object
        expect(allData.educational.tracks).toHaveLength(1);
        expect(allData.educational.selectedObjectId).toBe('demo_1');
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistent object ID generation', () => {
      const track1 = createTrack('Track 1', [
        createDurationObject(0, 5),
        createInstantObject(10)
      ]);

      const track2 = createTrack('Track 2', [
        createDurationObject(20, 5),
        createInstantObject(30)
      ]);

      // All objects should have IDs
      const allObjects = [...track1.objects, ...track2.objects];
      expect(allObjects.every(obj => obj.id && obj.id.startsWith('id_'))).toBe(true);

      // All IDs should be unique
      const ids = allObjects.map(obj => obj.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should maintain proper time ordering in complex timeline', () => {
      const state = createComplexTimelineState();

      // Check that objects are properly ordered within tracks
      state.tracks.forEach(track => {
        for (let i = 1; i < track.objects.length; i++) {
          const prevObject = track.objects[i - 1];
          const currentObject = track.objects[i];

          const prevEndTime = prevObject.type === 'duration' && prevObject.duration
            ? prevObject.startTime + prevObject.duration
            : prevObject.startTime;

          // Current object should start after or at the same time as previous object ends
          expect(currentObject.startTime).toBeGreaterThanOrEqual(prevEndTime);
        }
      });
    });

    it('should have valid configurations for all timeline types', () => {
      const configs = [basicTimelineConfig, animationTimelineConfig];

      configs.forEach(config => {
        const result = validateTimelineConfig(config);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Educational Value', () => {
    it('should demonstrate different object types clearly', () => {
      const state = createEducationalTimelineState();
      const objects = state.tracks[0].objects;

      // Should have both duration and instant objects
      const durationObjects = objects.filter(obj => obj.type === 'duration');
      const instantObjects = objects.filter(obj => obj.type === 'instant');

      expect(durationObjects.length).toBeGreaterThan(0);
      expect(instantObjects.length).toBeGreaterThan(0);
    });

    it('should demonstrate different durations clearly', () => {
      const state = createEducationalTimelineState();
      const objects = state.tracks[0].objects;

      const shortDuration = objects.find(obj => obj.properties.name === '短持续时间对象');
      const longDuration = objects.find(obj => obj.properties.name === '长持续时间对象');

      expect(shortDuration?.duration).toBe(5);
      expect(longDuration?.duration).toBe(15);
      expect(longDuration?.duration).toBeGreaterThan(shortDuration?.duration || 0);
    });

    it('should have descriptive names for learning purposes', () => {
      const state = createEducationalTimelineState();
      const objects = state.tracks[0].objects;

      const names = objects.map(obj => obj.properties.name);

      expect(names).toContain('短持续时间对象');
      expect(names).toContain('瞬间对象');
      expect(names).toContain('长持续时间对象');
      expect(names).toContain('重叠对象1');
      expect(names).toContain('重叠对象2');
    });

    it('should have descriptions for educational objects', () => {
      const state = createEducationalTimelineState();
      const objects = state.tracks[0].objects;

      objects.forEach(obj => {
        expect(obj.properties.description).toBeDefined();
        expect(typeof obj.properties.description).toBe('string');
        expect(obj.properties.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle creation of many objects efficiently', () => {
      const startTime = Date.now();

      const manyObjects = Array.from({ length: 100 }, (_, i) =>
        createDurationObject(i * 10, 5, { name: `Object ${i}` })
      );

      const track = createTrack('Performance Test Track', manyObjects);

      const endTime = Date.now();
      const creationTime = endTime - startTime;

      expect(track.objects).toHaveLength(100);
      expect(creationTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should generate unique IDs even with rapid creation', () => {
      const objects = Array.from({ length: 50 }, () =>
        createDurationObject(0, 5)
      );

      const track = createTrack('Rapid Creation Test', objects);
      const ids = track.objects.map(obj => obj.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});