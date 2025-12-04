import {
  TimelineState,
  Track,
  TimelineObject
} from '../types/timeline';

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 创建验证结果
 */
function createValidationResult(
  isValid: boolean,
  errors: string[] = [],
  warnings: string[] = []
): ValidationResult {
  return { isValid, errors, warnings };
}

/**
 * 验证时间轴对象
 */
export function validateTimelineObject(obj: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 基本结构验证
  if (!obj || typeof obj !== 'object') {
    errors.push('时间轴对象必须是对象类型');
    return createValidationResult(false, errors);
  }

  // ID验证
  if (!obj.id || typeof obj.id !== 'string') {
    errors.push('时间轴对象必须有字符串类型的ID');
  }

  // 类型验证
  if (!obj.type || !['duration', 'instant'].includes(obj.type)) {
    errors.push('时间轴对象类型必须是 "duration" 或 "instant"');
  }

  // 开始时间验证
  if (typeof obj.startTime !== 'number' || obj.startTime < 0) {
    errors.push('开始时间必须是非负数');
  }

  // 持续时间验证
  if (obj.type === 'duration') {
    if (typeof obj.duration !== 'number' || obj.duration <= 0) {
      errors.push('持续时间对象必须有正数的持续时间');
    }
  } else {
    if (obj.duration !== undefined) {
      warnings.push('瞬间对象不应该有duration属性');
    }
  }

  // 属性验证
  if (!obj.properties || typeof obj.properties !== 'object') {
    errors.push('时间轴对象必须有properties对象');
  }

  // 名称验证（如果存在）
  if (obj.properties?.name && typeof obj.properties.name !== 'string') {
    warnings.push('对象名称应该是字符串类型');
  }

  // 颜色验证（如果存在）
  if (obj.properties?.color && !isValidColor(obj.properties.color)) {
    warnings.push('颜色值格式不正确，应该是有效的CSS颜色值');
  }

  // 透明度验证（如果存在）
  if (obj.properties?.opacity !== undefined) {
    if (typeof obj.properties.opacity !== 'number' ||
        obj.properties.opacity < 0 ||
        obj.properties.opacity > 1) {
      warnings.push('透明度值应该在0到1之间');
    }
  }

  return createValidationResult(errors.length === 0, errors, warnings);
}

/**
 * 验证轨道
 */
export function validateTrack(track: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 基本结构验证
  if (!track || typeof track !== 'object') {
    errors.push('轨道必须是对象类型');
    return createValidationResult(false, errors);
  }

  // ID验证
  if (!track.id || typeof track.id !== 'string') {
    errors.push('轨道必须有字符串类型的ID');
  }

  // 名称验证
  if (!track.name || typeof track.name !== 'string') {
    errors.push('轨道必须有字符串类型的名称');
  }

  // 对象数组验证
  if (!Array.isArray(track.objects)) {
    errors.push('轨道必须有objects数组');
  } else {
    // 验证每个对象
    track.objects.forEach((obj: any, index: number) => {
      const objValidation = validateTimelineObject(obj);
      if (!objValidation.isValid) {
        errors.push(`轨道中对象[${index}]验证失败: ${objValidation.errors.join(', ')}`);
      }
      if (objValidation.warnings.length > 0) {
        warnings.push(`轨道中对象[${index}]警告: ${objValidation.warnings.join(', ')}`);
      }
    });

    // 检查对象ID重复
    const objectIds = track.objects.map((obj: any) => obj.id);
    const duplicateIds = objectIds.filter((id: string, index: number) => objectIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`轨道中存在重复的对象ID: ${duplicateIds.join(', ')}`);
    }
  }

  return createValidationResult(errors.length === 0, errors, warnings);
}

/**
 * 验证时间轴状态
 */
export function validateTimelineState(state: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 基本结构验证
  if (!state || typeof state !== 'object') {
    errors.push('时间轴状态必须是对象类型');
    return createValidationResult(false, errors);
  }

  // 轨道数组验证
  if (!Array.isArray(state.tracks)) {
    errors.push('时间轴状态必须有tracks数组');
  } else {
    // 验证每个轨道
    state.tracks.forEach((track: any, index: number) => {
      const trackValidation = validateTrack(track);
      if (!trackValidation.isValid) {
        errors.push(`轨道[${index}]验证失败: ${trackValidation.errors.join(', ')}`);
      }
      if (trackValidation.warnings.length > 0) {
        warnings.push(`轨道[${index}]警告: ${trackValidation.warnings.join(', ')}`);
      }
    });

    // 检查轨道ID重复
    const trackIds = state.tracks.map((track: any) => track.id);
    const duplicateIds = trackIds.filter((id: string, index: number) => trackIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`存在重复的轨道ID: ${duplicateIds.join(', ')}`);
    }
  }

  // 缩放级别验证
  if (typeof state.zoomLevel !== 'number' || state.zoomLevel <= 0) {
    errors.push('缩放级别必须是正数');
  }

  // 滚动位置验证
  if (typeof state.scrollPosition !== 'number' || state.scrollPosition < 0) {
    errors.push('滚动位置必须是非负数');
  }

  // 选中对象验证
  if (state.selectedObjectId !== null && state.selectedObjectId !== undefined) {
    if (typeof state.selectedObjectId !== 'string') {
      errors.push('选中的对象ID必须是字符串或null');
    } else {
      // 检查选中的对象是否存在
      const objectExists = state.tracks.some((track: any) =>
        track.objects.some((obj: any) => obj.id === state.selectedObjectId)
      );
      if (!objectExists) {
        warnings.push('选中的对象ID在轨道中不存在');
      }
    }
  }

  return createValidationResult(errors.length === 0, errors, warnings);
}

/**
 * 验证时间轴配置
 */
export function validateTimelineConfig(config: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 基本结构验证
  if (!config || typeof config !== 'object') {
    errors.push('配置必须是对象类型');
    return createValidationResult(false, errors);
  }

  // 最小缩放验证
  if (typeof config.minZoom !== 'number' || config.minZoom <= 0) {
    errors.push('最小缩放必须是正数');
  }

  // 最大缩放验证
  if (typeof config.maxZoom !== 'number' || config.maxZoom <= 0) {
    errors.push('最大缩放必须是正数');
  }

  // 缩放范围验证
  if (config.minZoom && config.maxZoom && config.minZoom >= config.maxZoom) {
    errors.push('最小缩放必须小于最大缩放');
  }

  // 默认缩放验证
  if (typeof config.defaultZoom !== 'number') {
    errors.push('默认缩放必须是数字');
  } else if (config.minZoom && config.maxZoom) {
    if (config.defaultZoom < config.minZoom || config.defaultZoom > config.maxZoom) {
      warnings.push('默认缩放超出配置范围');
    }
  }

  // 时间单位验证
  if (config.timeUnit && !['seconds', 'frames'].includes(config.timeUnit)) {
    errors.push('时间单位必须是 "seconds" 或 "frames"');
  }

  // 帧率验证
  if (config.fps !== undefined) {
    if (typeof config.fps !== 'number' || config.fps <= 0) {
      errors.push('帧率必须是正数');
    }
    if (config.timeUnit !== 'frames') {
      warnings.push('只有在帧时间单位下才需要设置帧率');
    }
  }

  return createValidationResult(errors.length === 0, errors, warnings);
}

/**
 * 验证属性模板
 */
export function validatePropertyTemplate(template: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 基本结构验证
  if (!template || typeof template !== 'object') {
    errors.push('属性模板必须是对象类型');
    return createValidationResult(false, errors);
  }

  // 名称验证
  if (!template.name || typeof template.name !== 'string') {
    errors.push('属性模板必须有字符串类型的名称');
  }

  // 标签验证
  if (!template.label || typeof template.label !== 'string') {
    errors.push('属性模板必须有字符串类型的标签');
  }

  // 类型验证
  const validTypes = ['string', 'number', 'boolean', 'color', 'select', 'multiselect'];
  if (!template.type || !validTypes.includes(template.type)) {
    errors.push(`属性模板类型必须是以下之一: ${validTypes.join(', ')}`);
  }

  // 根据类型验证特定属性
  switch (template.type) {
    case 'number':
      if (template.min !== undefined && typeof template.min !== 'number') {
        errors.push('数字类型的最小值必须是数字');
      }
      if (template.max !== undefined && typeof template.max !== 'number') {
        errors.push('数字类型的最大值必须是数字');
      }
      if (template.step !== undefined && typeof template.step !== 'number') {
        errors.push('数字类型的步长必须是数字');
      }
      if (template.min !== undefined && template.max !== undefined && template.min >= template.max) {
        errors.push('最小值必须小于最大值');
      }
      break;

    case 'select':
    case 'multiselect':
      if (!Array.isArray(template.options)) {
        errors.push('选择类型必须有options数组');
      } else if (template.options.length === 0) {
        warnings.push('选择类型的options数组为空');
      }
      break;
  }

  return createValidationResult(errors.length === 0, errors, warnings);
}

/**
 * 验证颜色值
 */
function isValidColor(color: string): boolean {
  if (typeof color !== 'string') return false;

  // 十六进制颜色
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) return true;
  if (/^#[0-9A-Fa-f]{3}$/.test(color)) return true;

  // RGB颜色
  if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color)) return true;

  // RGBA颜色
  if (/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(color)) return true;

  // HSL颜色
  if (/^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/.test(color)) return true;

  // 预定义颜色名称
  const predefinedColors = [
    'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'brown',
    'black', 'white', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy',
    'maroon', 'olive', 'teal', 'silver', 'aqua', 'fuchsia'
  ];
  if (predefinedColors.includes(color.toLowerCase())) return true;

  return false;
}

/**
 * 深度验证整个时间轴项目
 */
export function validateTimelineProject(
  state: TimelineState,
  config?: any
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 验证状态
  const stateValidation = validateTimelineState(state);
  if (!stateValidation.isValid) {
    errors.push(...stateValidation.errors);
  }
  warnings.push(...stateValidation.warnings);

  // 验证配置（如果提供）
  if (config) {
    const configValidation = validateTimelineConfig(config);
    if (!configValidation.isValid) {
      errors.push(...configValidation.errors);
    }
    warnings.push(...configValidation.warnings);
  }

  return createValidationResult(errors.length === 0, errors, warnings);
}

/**
 * 检查对象是否重叠
 */
export function checkObjectOverlap(object1: TimelineObject, object2: TimelineObject): boolean {
  if (object1.id === object2.id) return false;

  const end1 = object1.type === 'duration' && object1.duration
    ? object1.startTime + object1.duration
    : object1.startTime;

  const end2 = object2.type === 'duration' && object2.duration
    ? object2.startTime + object2.duration
    : object2.startTime;

  return object1.startTime <= end2 && end1 >= object2.startTime;
}

/**
 * 检查轨道内是否有重叠对象
 */
export function checkTrackOverlap(track: Track): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const objects = track.objects;
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      if (checkObjectOverlap(objects[i], objects[j])) {
        warnings.push(
          `轨道 "${track.name}" 中的对象 "${objects[i].properties.name || objects[i].id}" ` +
          `与对象 "${objects[j].properties.name || objects[j].id}" 存在时间重叠`
        );
      }
    }
  }

  return createValidationResult(true, errors, warnings);
}

/**
 * 检查时间轴中所有轨道的重叠情况
 */
export function checkAllTrackOverlaps(state: TimelineState): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  state.tracks.forEach(track => {
    const overlapResult = checkTrackOverlap(track);
    warnings.push(...overlapResult.warnings);
  });

  return createValidationResult(true, errors, warnings);
}