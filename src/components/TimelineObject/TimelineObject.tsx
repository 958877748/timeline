import React, { useRef, useState } from 'react';
import { useTimelineObject } from '../../hooks';
import styles from './TimelineObject.module.css';

export interface TimelineObjectProps {
  objectId: string;
  zoomLevel: number;
  isSelected: boolean;
  onSelect?: (objectId: string | null) => void;
}

export const TimelineObject: React.FC<TimelineObjectProps> = ({
  objectId,
  zoomLevel,
  isSelected,
  onSelect
}) => {
  const obj = useTimelineObject({ objectId });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef({ x: 0, startTime: 0, duration: 0 });

  if (!obj.object) {
    return null;
  }

  const { object } = obj;
  const isDurationType = object.type === 'duration';
  const width = isDurationType ? (object.duration || 0) * zoomLevel : 4;
  const left = object.startTime * zoomLevel;

  // 处理对象点击选择
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    obj.select();
    onSelect?.(objectId);
  };

  // 处理双击编辑
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 这里可以触发属性编辑器
    console.log('Double click on object:', objectId);
  };

  // 处理拖拽开始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只处理左键

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      startTime: object.startTime,
      duration: object.duration || 0
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  // 处理拖拽移动
  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaTime = deltaX / zoomLevel;
    const newStartTime = Math.max(0, dragStartRef.current.startTime + deltaTime);

    obj.move(newStartTime);
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  // 处理调整大小开始
  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isDurationType) return;
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    dragStartRef.current = {
      x: e.clientX,
      startTime: object.startTime,
      duration: object.duration || 0
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // 处理调整大小移动
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaTime = deltaX / zoomLevel;
    const newDuration = Math.max(0.1, dragStartRef.current.duration + deltaTime);

    obj.update({ duration: newDuration });
  };

  // 处理调整大小结束
  const handleResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // 处理删除
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个对象吗？')) {
      obj.remove();
    }
  };

  // 处理拖拽到其他轨道
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', objectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 获取对象类型对应的样式
  const getObjectStyle = () => {
    const baseStyle = styles.timelineObject;
    const typeStyle = isDurationType ? styles.durationObject : styles.instantObject;
    const selectedStyle = isSelected ? styles.selected : '';
    const draggingStyle = isDragging ? styles.dragging : '';

    return `${baseStyle} ${typeStyle} ${selectedStyle} ${draggingStyle}`.trim();
  };

  // 获取对象颜色
  const getObjectColor = () => {
    // 可以从对象属性中获取颜色，或使用默认颜色
    const color = object.properties.color || (isDurationType ? '#4CAF50' : '#2196F3');
    return color;
  };

  // 获取对象标签
  const getObjectLabel = () => {
    return object.properties.name || object.properties.label || `对象 ${objectId.slice(0, 8)}`;
  };

  return (
    <div
      className={getObjectStyle()}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        backgroundColor: getObjectColor(),
        cursor: isDragging ? 'grabbing' : isResizing ? 'col-resize' : 'pointer'
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onDragStart={handleDragStart}
      draggable={!isDragging && !isResizing}
      title={`${getObjectLabel()} - 开始时间: ${object.startTime}s${isDurationType ? `, 持续时间: ${object.duration}s` : ''}`}
    >
      {/* 对象内容 */}
      <div className={styles.objectContent}>
        <span className={styles.objectLabel}>
          {getObjectLabel()}
        </span>
        {isDurationType && (
          <span className={styles.objectDuration}>
            {object.duration}s
          </span>
        )}
      </div>

      {/* 调整大小手柄 */}
      {isDurationType && (
        <div
          className={styles.resizeHandle}
          onMouseDown={handleResizeStart}
          title="调整持续时间"
        />
      )}

      {/* 删除按钮 */}
      {isSelected && (
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          title="删除对象"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        </button>
      )}

      {/* 选中指示器 */}
      {isSelected && (
        <div className={styles.selectionIndicator} />
      )}
    </div>
  );
};

export default TimelineObject;