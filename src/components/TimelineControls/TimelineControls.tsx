import React from 'react';
import styles from './TimelineControls.module.css';

export interface TimelineControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAddTrack?: () => void;
  className?: string;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onAddTrack,
  className
}) => {
  const handleZoomIn = () => {
    onZoomIn();
  };

  const handleZoomOut = () => {
    onZoomOut();
  };

  const handleAddTrack = () => {
    onAddTrack?.();
  };

  const formatZoomLevel = (level: number): string => {
    return `${Math.round(level * 100)}%`;
  };

  return (
    <div className={`${styles.controlsContainer} ${className || ''}`}>
      <div className={styles.leftSection}>
        <h3 className={styles.title}>时间轴</h3>
      </div>

      <div className={styles.centerSection}>
        <div className={styles.zoomControls}>
          <button
            className={styles.controlButton}
            onClick={handleZoomOut}
            title="缩小"
            aria-label="缩小时间轴"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3.5a.5.5 0 0 0-1 0V7H3.5a.5.5 0 0 0 0 1H7v3.5a.5.5 0 0 0 1 0V8h3.5a.5.5 0 0 0 0-1H8V3.5z"/>
            </svg>
          </button>

          <span className={styles.zoomLevel} title={`当前缩放: ${formatZoomLevel(zoomLevel)}`}>
            {formatZoomLevel(zoomLevel)}
          </span>

          <button
            className={styles.controlButton}
            onClick={handleZoomIn}
            title="放大"
            aria-label="放大时间轴"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.rightSection}>
        {onAddTrack && (
          <button
            className={styles.addTrackButton}
            onClick={handleAddTrack}
            title="添加轨道"
            aria-label="添加新轨道"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={styles.addIcon}>
              <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
            </svg>
            添加轨道
          </button>
        )}
      </div>
    </div>
  );
};

export default TimelineControls;