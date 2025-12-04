import {
  TimelineState,
  Track,
  TimelineObject,
  TimelineObjectType,
  TimelineConfig
} from '../types/timeline';

/**
 * 创建示例持续时间对象
 */
export function createDurationObject(
  startTime: number,
  duration: number,
  properties: Record<string, any> = {}
): Omit<TimelineObject, 'id'> {
  return {
    type: 'duration' as TimelineObjectType,
    startTime,
    duration,
    properties: {
      name: `Duration Object ${startTime}`,
      color: '#3b82f6',
      opacity: 1,
      ...properties
    }
  };
}

/**
 * 创建示例瞬间对象
 */
export function createInstantObject(
  startTime: number,
  properties: Record<string, any> = {}
): Omit<TimelineObject, 'id'> {
  return {
    type: 'instant' as TimelineObjectType,
    startTime,
    properties: {
      name: `Instant Object ${startTime}`,
      color: '#ef4444',
      opacity: 1,
      ...properties
    }
  };
}

/**
 * 创建示例轨道
 */
export function createTrack(name: string, objects: Omit<TimelineObject, 'id'>[] = []): Track {
  return {
    id: `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    objects: objects.map(obj => ({ ...obj, id: `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }))
  };
}

/**
 * 示例配置1：基础时间轴
 */
export const basicTimelineConfig: Partial<TimelineConfig> = {
  minZoom: 0.5,
  maxZoom: 5,
  defaultZoom: 1,
  timeUnit: 'seconds'
};

/**
 * 示例配置2：动画时间轴（使用帧）
 */
export const animationTimelineConfig: Partial<TimelineConfig> = {
  minZoom: 0.1,
  maxZoom: 10,
  defaultZoom: 1,
  timeUnit: 'frames',
  fps: 30
};

/**
 * 示例状态1：简单时间轴
 */
export function createSimpleTimelineState(): TimelineState {
  return {
    tracks: [
      {
        id: 'track_1',
        name: '视频轨道',
        objects: [
          {
            id: 'obj_1',
            type: 'duration',
            startTime: 0,
            duration: 10,
            properties: {
              name: '片头视频',
              color: '#3b82f6',
              opacity: 1,
              filePath: '/assets/intro.mp4'
            }
          },
          {
            id: 'obj_2',
            type: 'duration',
            startTime: 15,
            duration: 20,
            properties: {
              name: '主要内容',
              color: '#10b981',
              opacity: 1,
              filePath: '/assets/main.mp4'
            }
          }
        ]
      },
      {
        id: 'track_2',
        name: '音频轨道',
        objects: [
          {
            id: 'obj_3',
            type: 'duration',
            startTime: 0,
            duration: 35,
            properties: {
              name: '背景音乐',
              color: '#8b5cf6',
              opacity: 0.8,
              filePath: '/assets/background.mp3',
              volume: 0.5
            }
          }
        ]
      }
    ],
    zoomLevel: 1,
    scrollPosition: 0,
    selectedObjectId: null
  };
}

/**
 * 示例状态2：复杂时间轴（动画项目）
 */
export function createComplexTimelineState(): TimelineState {
  return {
    tracks: [
      {
        id: 'track_camera',
        name: '摄像机轨道',
        objects: [
          {
            id: 'cam_1',
            type: 'duration',
            startTime: 0,
            duration: 120,
            properties: {
              name: '主摄像机',
              color: '#dc2626',
              opacity: 1,
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              fov: 60
            }
          }
        ]
      },
      {
        id: 'track_characters',
        name: '角色轨道',
        objects: [
          {
            id: 'char_1',
            type: 'duration',
            startTime: 0,
            duration: 60,
            properties: {
              name: '主角出场',
              color: '#2563eb',
              opacity: 1,
              characterId: 'main_character',
              animation: 'walk'
            }
          },
          {
            id: 'char_2',
            type: 'duration',
            startTime: 60,
            duration: 60,
            properties: {
              name: '主角对话',
              color: '#2563eb',
              opacity: 1,
              characterId: 'main_character',
              animation: 'talk'
            }
          }
        ]
      },
      {
        id: 'track_effects',
        name: '特效轨道',
        objects: [
          {
            id: 'effect_1',
            type: 'instant',
            startTime: 30,
            properties: {
              name: '爆炸特效',
              color: '#f59e0b',
              opacity: 1,
              effectType: 'explosion',
              intensity: 0.8
            }
          },
          {
            id: 'effect_2',
            type: 'instant',
            startTime: 90,
            properties: {
              name: '闪光特效',
              color: '#fbbf24',
              opacity: 1,
              effectType: 'flash',
              duration: 0.5
            }
          }
        ]
      },
      {
        id: 'track_lighting',
        name: '灯光轨道',
        objects: [
          {
            id: 'light_1',
            type: 'duration',
            startTime: 0,
            duration: 120,
            properties: {
              name: '主光源',
              color: '#ffffff',
              opacity: 1,
              lightType: 'directional',
              intensity: 1.0
            }
          }
        ]
      }
    ],
    zoomLevel: 1,
    scrollPosition: 0,
    selectedObjectId: null
  };
}

/**
 * 示例状态3：空时间轴
 */
export function createEmptyTimelineState(): TimelineState {
  return {
    tracks: [],
    zoomLevel: 1,
    scrollPosition: 0,
    selectedObjectId: null
  };
}

/**
 * 示例状态4：教学用时间轴（包含各种对象类型）
 */
export function createEducationalTimelineState(): TimelineState {
  return {
    tracks: [
      {
        id: 'track_demo',
        name: '演示轨道',
        objects: [
          // 持续时间对象 - 短
          {
            id: 'demo_1',
            type: 'duration',
            startTime: 0,
            duration: 5,
            properties: {
              name: '短持续时间对象',
              color: '#3b82f6',
              opacity: 1,
              description: '这是一个持续5个时间单位的持续时间对象'
            }
          },
          // 瞬间对象
          {
            id: 'demo_2',
            type: 'instant',
            startTime: 7,
            properties: {
              name: '瞬间对象',
              color: '#ef4444',
              opacity: 1,
              description: '这是一个瞬间触发的对象'
            }
          },
          // 持续时间对象 - 长
          {
            id: 'demo_3',
            type: 'duration',
            startTime: 10,
            duration: 15,
            properties: {
              name: '长持续时间对象',
              color: '#10b981',
              opacity: 0.8,
              description: '这是一个持续15个时间单位的长持续时间对象'
            }
          },
          // 重叠对象
          {
            id: 'demo_4',
            type: 'duration',
            startTime: 20,
            duration: 10,
            properties: {
              name: '重叠对象1',
              color: '#8b5cf6',
              opacity: 0.7,
              description: '这个对象会与其他对象重叠'
            }
          },
          {
            id: 'demo_5',
            type: 'duration',
            startTime: 25,
            duration: 10,
            properties: {
              name: '重叠对象2',
              color: '#f59e0b',
              opacity: 0.7,
              description: '这个对象与前面的对象重叠'
            }
          }
        ]
      }
    ],
    zoomLevel: 1,
    scrollPosition: 0,
    selectedObjectId: 'demo_1'
  };
}

/**
 * 获取所有示例数据
 */
export function getAllMockData() {
  return {
    simple: createSimpleTimelineState(),
    complex: createComplexTimelineState(),
    empty: createEmptyTimelineState(),
    educational: createEducationalTimelineState()
  };
}