/**
 * 时间轴集成测试
 * 测试各个模块之间的协作
 */

import { TimelineModel } from '../../src/models/TimelineModel';
import {
  createSimpleTimelineState,
  createComplexTimelineState,
  createEmptyTimelineState,
  createEducationalTimelineState
} from '../../src/data/mockData';

import {
  validateTimelineState,
  validateTimelineProject,
  checkAllTrackOverlaps
} from '../../src/utils/validation';

import {
  getTimeRange,
  getTrackCount,
  getObjectCount,
  getAllObjects,
  findObjectById,
  findTrackByObjectId
} from '../../src/utils/timelineUtils';

describe('Timeline Integration Tests', () => {
  describe('Model and Validation Integration', () => {
    it('should create valid timeline through model operations', () => {
      const timeline = new TimelineModel();

      // 添加轨道
      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Video Track' }
      });

      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Audio Track' }
      });

      const state = timeline.getState();

      // 验证状态
      const validation = validateTimelineState(state);
      expect(validation.isValid).toBe(true);
      expect(state.tracks).toHaveLength(2);
      expect(state.tracks[0].name).toBe('Video Track');
      expect(state.tracks[1].name).toBe('Audio Track');
    });

    it('should maintain validation through complex operations', () => {
      const timeline = new TimelineModel();

      // 添加轨道
      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Test Track' }
      });

      const trackId = timeline.getState().tracks[0].id;

      // 添加多个对象
      for (let i = 0; i < 5; i++) {
        timeline.dispatch({
          type: 'ADD_OBJECT',
          payload: {
            trackId,
            object: {
              type: 'duration',
              startTime: i * 10,
              duration: 8,
              properties: { name: `Object ${i}` }
            }
          }
        });
      }

      const state = timeline.getState();
      const validation = validateTimelineState(state);

      expect(validation.isValid).toBe(true);
      expect(state.tracks[0].objects).toHaveLength(5);
    });

    it('should handle validation errors gracefully', () => {
      const timeline = new TimelineModel();

      // 尝试添加无效数据（通过直接操作会失败）
      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Test Track' }
      });

      const trackId = timeline.getState().tracks[0].id;

      // 模型内部应该处理无效数据
      timeline.dispatch({
        type: 'ADD_OBJECT',
        payload: {
          trackId: 'invalid_track_id',
          object: {
            type: 'duration',
            startTime: -10, // 无效时间
            duration: 0,    // 无效持续时间
            properties: {}
          }
        }
      });

      const state = timeline.getState();
      expect(state.tracks[0].objects).toHaveLength(0); // 对象不应该被添加
    });
  });

  describe('Mock Data and Utils Integration', () => {
    it('should use mock data with utility functions', () => {
      const simpleState = createSimpleTimelineState();

      // 测试工具函数与模拟数据
      expect(getTrackCount(simpleState)).toBe(2);
      expect(getObjectCount(simpleState)).toBe(3);

      const timeRange = getTimeRange(simpleState);
      expect(timeRange.start).toBe(0);
      expect(timeRange.end).toBe(35); // 最长对象的结束时间

      const allObjects = getAllObjects(simpleState);
      expect(allObjects).toHaveLength(3);
    });

    it('should find objects and tracks in complex mock data', () => {
      const complexState = createComplexTimelineState();

      // 查找特定对象
      const cameraObject = findObjectById(complexState, 'cam_1');
      expect(cameraObject).toBeDefined();
      expect(cameraObject?.properties.name).toBe('主摄像机');

      // 查找包含对象的轨道
      const cameraTrack = findTrackByObjectId(complexState, 'cam_1');
      expect(cameraTrack).toBeDefined();
      expect(cameraTrack?.name).toBe('摄像机轨道');

      // 验证复杂状态
      const validation = validateTimelineState(complexState);
      expect(validation.isValid).toBe(true);
    });

    it('should perform operations on mock data', () => {
      let state = createSimpleTimelineState();
      const initialObjectCount = getObjectCount(state);

      // 添加新轨道
      const { TimelineModel } = require('../../src/models/TimelineModel');
      const timeline = new TimelineModel(state);

      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Effects Track' }
      });

      state = timeline.getState();
      expect(getTrackCount(state)).toBe(3);

      // 在新轨道添加对象
      const newTrackId = state.tracks[2].id;
      timeline.dispatch({
        type: 'ADD_OBJECT',
        payload: {
          trackId: newTrackId,
          object: {
            type: 'instant',
            startTime: 20,
            properties: { name: 'Effect', type: 'flash' }
          }
        }
      });

      state = timeline.getState();
      expect(getObjectCount(state)).toBe(initialObjectCount + 1);
    });
  });

  describe('Overlap Detection Integration', () => {
    it('should detect overlaps in mock data', () => {
      const educationalState = createEducationalTimelineState();
      const overlapResult = checkAllTrackOverlaps(educationalState);

      // 教育用数据故意包含重叠对象
      expect(overlapResult.warnings.length).toBeGreaterThan(0);
      expect(overlapResult.warnings[0]).toContain('重叠');
    });

    it('should not detect overlaps in properly spaced mock data', () => {
      const simpleState = createSimpleTimelineState();
      const overlapResult = checkAllTrackOverlaps(simpleState);

      // 简单数据不应该有重叠
      expect(overlapResult.warnings).toHaveLength(0);
    });

    it('should handle overlap detection with complex operations', () => {
      const timeline = new TimelineModel(createEmptyTimelineState());

      // 添加轨道
      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Test Track' }
      });

      const trackId = timeline.getState().tracks[0].id;

      // 添加重叠对象
      timeline.dispatch({
        type: 'ADD_OBJECT',
        payload: {
          trackId,
          object: {
            type: 'duration',
            startTime: 10,
            duration: 10,
            properties: { name: 'Object 1' }
          }
        }
      });

      timeline.dispatch({
        type: 'ADD_OBJECT',
        payload: {
          trackId,
          object: {
            type: 'duration',
            startTime: 15,
            duration: 10,
            properties: { name: 'Object 2' }
          }
        }
      });

      const state = timeline.getState();
      const overlapResult = checkAllTrackOverlaps(state);

      expect(overlapResult.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Complete Workflow Integration', () => {
    it('should handle complete timeline creation workflow', () => {
      // 1. 创建空时间轴
      const timeline = new TimelineModel(createEmptyTimelineState());

      // 2. 添加多个轨道
      const trackNames = ['Video', 'Audio', 'Effects', 'Subtitles'];
      trackNames.forEach(name => {
        timeline.dispatch({
          type: 'ADD_TRACK',
          payload: { name }
        });
      });

      // 3. 向每个轨道添加不同类型的对象
      const state = timeline.getState();
      state.tracks.forEach((track, index) => {
        for (let i = 0; i < 3; i++) {
          const objectType = index % 2 === 0 ? 'duration' : 'instant';
          const startTime = i * 15;

          timeline.dispatch({
            type: 'ADD_OBJECT',
            payload: {
              trackId: track.id,
              object: {
                type: objectType,
                startTime,
                duration: objectType === 'duration' ? 10 : undefined,
                properties: {
                  name: `${track.name} Object ${i}`,
                  color: `hsl(${index * 60}, 70%, 50%)`
                }
              }
            }
          });
        }
      });

      // 4. 验证最终状态
      const finalState = timeline.getState();
      expect(getTrackCount(finalState)).toBe(4);
      expect(getObjectCount(finalState)).toBe(12);

      const validation = validateTimelineState(finalState);
      expect(validation.isValid).toBe(true);
    });

    it('should handle object selection and manipulation workflow', () => {
      const timeline = new TimelineModel(createSimpleTimelineState());

      // 获取第一个对象
      const firstObject = timeline.getState().tracks[0].objects[0];

      // 选择对象
      timeline.dispatch({
        type: 'SELECT_OBJECT',
        payload: { objectId: firstObject.id }
      });

      expect(timeline.getState().selectedObjectId).toBe(firstObject.id);

      // 更新选中的对象
      const track = timeline.findTrackByObjectId(firstObject.id);
      if (track) {
        timeline.dispatch({
          type: 'UPDATE_OBJECT',
          payload: {
            trackId: track.id,
            objectId: firstObject.id,
            updates: {
              properties: { name: 'Updated Name', color: '#ff0000' }
            }
          }
        });
      }

      const updatedObject = timeline.findObjectById(firstObject.id);
      expect(updatedObject?.properties.name).toBe('Updated Name');
      expect(updatedObject?.properties.color).toBe('#ff0000');
    });

    it('should handle zoom and scroll state management', () => {
      const timeline = new TimelineModel(createComplexTimelineState());

      // 设置缩放
      timeline.dispatch({
        type: 'SET_ZOOM',
        payload: { zoomLevel: 2.5 }
      });

      expect(timeline.getState().zoomLevel).toBe(2.5);

      // 设置滚动
      timeline.dispatch({
        type: 'SET_SCROLL',
        payload: { scrollPosition: 150 }
      });

      expect(timeline.getState().scrollPosition).toBe(150);

      // 验证时间范围计算
      const timeRange = getTimeRange(timeline.getState());
      expect(timeRange.start).toBeDefined();
      expect(timeRange.end).toBeDefined();
      expect(timeRange.start).toBeLessThanOrEqual(timeRange.end);
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should recover from invalid operations', () => {
      const timeline = new TimelineModel(createSimpleTimelineState());
      const originalState = timeline.getState();

      // 尝试无效操作
      timeline.dispatch({
        type: 'REMOVE_TRACK',
        payload: { trackId: 'non_existent' }
      });

      timeline.dispatch({
        type: 'UPDATE_OBJECT',
        payload: {
          trackId: 'invalid',
          objectId: 'invalid',
          updates: {}
        }
      });

      // 状态应该保持不变
      expect(timeline.getState()).toEqual(originalState);
    });

    it('should handle object movement between tracks', () => {
      const timeline = new TimelineModel();

      // 添加两个轨道
      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Source Track' }
      });

      timeline.dispatch({
        type: 'ADD_TRACK',
        payload: { name: 'Target Track' }
      });

      const [sourceTrack, targetTrack] = timeline.getState().tracks;

      // 在源轨道添加对象
      timeline.dispatch({
        type: 'ADD_OBJECT',
        payload: {
          trackId: sourceTrack.id,
          object: {
            type: 'duration',
            startTime: 10,
            duration: 5,
            properties: { name: 'Movable Object' }
          }
        }
      });

      const objectId = sourceTrack.objects[0].id;

      // 移动对象
      timeline.dispatch({
        type: 'MOVE_OBJECT',
        payload: {
          fromTrackId: sourceTrack.id,
          toTrackId: targetTrack.id,
          objectId,
          newStartTime: 20
        }
      });

      const finalState = timeline.getState();
      expect(finalState.tracks[0].objects).toHaveLength(0);
      expect(finalState.tracks[1].objects).toHaveLength(1);
      expect(finalState.tracks[1].objects[0].startTime).toBe(20);

      // 验证移动后的状态
      const validation = validateTimelineState(finalState);
      expect(validation.isValid).toBe(true);
    });

    it('should handle concurrent operations safely', () => {
      const timeline = new TimelineModel(createEmptyTimelineState());

      // 快速执行多个操作
      const operations = [];

      // 添加轨道
      for (let i = 0; i < 5; i++) {
        operations.push({
          type: 'ADD_TRACK',
          payload: { name: `Track ${i}` }
        });
      }

      // 执行所有操作
      operations.forEach(op => timeline.dispatch(op));

      const state = timeline.getState();
      expect(getTrackCount(state)).toBe(5);

      // 验证所有轨道都是有效的
      state.tracks.forEach((track, index) => {
        expect(track.name).toBe(`Track ${index}`);
        expect(track.id).toBeDefined();
      });
    });
  });

  describe('Performance Integration', () => {
    it('should handle large timeline efficiently', () => {
      const timeline = new TimelineModel(createEmptyTimelineState());

      const startTime = Date.now();

      // 添加大量轨道和对象
      for (let i = 0; i < 10; i++) {
        timeline.dispatch({
          type: 'ADD_TRACK',
          payload: { name: `Track ${i}` }
        });

        const trackId = timeline.getState().tracks[i].id;

        for (let j = 0; j < 20; j++) {
          timeline.dispatch({
            type: 'ADD_OBJECT',
            payload: {
              trackId,
              object: {
                type: j % 2 === 0 ? 'duration' : 'instant',
                startTime: j * 5,
                duration: j % 2 === 0 ? 3 : undefined,
                properties: { name: `Object ${j}` }
              }
            }
          });
        }
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      const finalState = timeline.getState();
      expect(getTrackCount(finalState)).toBe(10);
      expect(getObjectCount(finalState)).toBe(200);

      // 验证执行时间（应该在合理范围内）
      expect(executionTime).toBeLessThan(5000); // 5秒内完成

      // 验证状态有效性
      const validation = validateTimelineState(finalState);
      expect(validation.isValid).toBe(true);
    });

    it('should efficiently perform bulk operations', () => {
      const timeline = new TimelineModel(createEmptyTimelineState());

      // 批量添加轨道
      const trackPromises = [];
      for (let i = 0; i < 20; i++) {
        trackPromises.push({
          type: 'ADD_TRACK',
          payload: { name: `Bulk Track ${i}` }
        });
      }

      trackPromises.forEach(op => timeline.dispatch(op));

      const stateAfterTracks = timeline.getState();
      expect(getTrackCount(stateAfterTracks)).toBe(20);

      // 批量添加对象到每个轨道
      stateAfterTracks.tracks.forEach(track => {
        for (let i = 0; i < 10; i++) {
          timeline.dispatch({
            type: 'ADD_OBJECT',
            payload: {
              trackId: track.id,
              object: {
                type: 'duration',
                startTime: i * 10,
                duration: 5,
                properties: { name: `Bulk Object ${i}` }
              }
            }
          });
        }
      });

      const finalState = timeline.getState();
      expect(getObjectCount(finalState)).toBe(200);

      // 验证数据完整性
      const allObjects = getAllObjects(finalState);
      expect(allObjects).toHaveLength(200);

      const validation = validateTimelineState(finalState);
      expect(validation.isValid).toBe(true);
    });
  });
});