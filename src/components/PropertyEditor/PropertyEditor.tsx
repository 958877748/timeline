import React, { useState, useEffect } from 'react';
import { useTimeline } from '../../hooks';
import { TimelineObject } from '../../types/timeline';
import styles from './PropertyEditor.module.css';

export interface PropertyEditorProps {
  className?: string;
  style?: React.CSSProperties;
  onPropertyChange?: (objectId: string, property: string, value: any) => void;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  className,
  style,
  onPropertyChange
}) => {
  const timeline = useTimeline();
  const [selectedObject, setSelectedObject] = useState<TimelineObject | null>(null);
  const [editProperties, setEditProperties] = useState<Record<string, any>>({});

  // 获取当前选中的对象
  useEffect(() => {
    const object = timeline.getSelectedObject();
    setSelectedObject(object);
    if (object) {
      setEditProperties(object.properties || {});
    }
  }, [timeline.state.selectedObjectId]);

  // 处理属性变更
  const handlePropertyChange = (key: string, value: any) => {
    if (!selectedObject) return;

    const newProperties = { ...editProperties, [key]: value };
    setEditProperties(newProperties);

    timeline.updateObject(selectedObject.id, {
      properties: newProperties
    });

    onPropertyChange?.(selectedObject.id, key, value);
  };

  // 处理时间属性变更
  const handleTimeChange = (field: 'startTime' | 'duration', value: number) => {
    if (!selectedObject) return;

    const updates: Partial<TimelineObject> = { [field]: value };
    timeline.updateObject(selectedObject.id, updates);
    onPropertyChange?.(selectedObject.id, field, value);
  };

  // 处理对象操作
  const handleDuplicate = () => {
    if (!selectedObject) return;
    timeline.duplicateObject(selectedObject.id);
  };

  const handleRemove = () => {
    if (!selectedObject) return;
    if (confirm('确定要删除这个对象吗？')) {
      timeline.removeObject(selectedObject.id);
    }
  };

  if (!selectedObject) {
    return (
      <div className={`${styles.propertyEditor} ${className || ''}`} style={style}>
        <div className={styles.emptyState}>
          <h3>属性编辑器</h3>
          <p>请选择一个对象来编辑其属性</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.propertyEditor} ${className || ''}`} style={style}>
      <div className={styles.editorContent}>
        <div className={styles.section}>
          <h4>基本信息</h4>
          <div className={styles.field}>
            <label>ID</label>
            <input type="text" value={selectedObject.id} readOnly className={styles.readOnly} />
          </div>
          <div className={styles.field}>
            <label>类型</label>
            <input type="text" value={selectedObject.type === 'duration' ? '持续时间' : '瞬间'} readOnly className={styles.readOnly} />
          </div>
        </div>

        <div className={styles.section}>
          <h4>时间属性</h4>
          <div className={styles.field}>
            <label>开始时间 (秒)</label>
            <input
              type="number"
              value={selectedObject.startTime}
              onChange={(e) => handleTimeChange('startTime', parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0"
            />
          </div>
          {selectedObject.type === 'duration' && (
            <div className={styles.field}>
              <label>持续时间 (秒)</label>
              <input
                type="number"
                value={selectedObject.duration || 0}
                onChange={(e) => handleTimeChange('duration', parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0.1"
              />
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h4>自定义属性</h4>
          {Object.entries(editProperties).map(([key, value]) => (
            <div key={key} className={styles.field}>
              <label>{key}</label>
              {typeof value === 'boolean' ? (
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handlePropertyChange(key, e.target.checked)}
                />
              ) : typeof value === 'number' ? (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handlePropertyChange(key, parseFloat(e.target.value) || 0)}
                />
              ) : (
                <input
                  type="text"
                  value={String(value)}
                  onChange={(e) => handlePropertyChange(key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <h4>操作</h4>
          <div className={styles.actions}>
            <button onClick={handleDuplicate} className={styles.button}>
              复制对象
            </button>
            <button onClick={handleRemove} className={styles.buttonDanger}>
              删除对象
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};