import React, { useRef, useState } from 'react';
import { useTimeline } from '../../hooks';
import { Track } from '../Track';
import { TimelineControls } from '../TimelineControls';
import styles from './Timeline.module.css';

export interface TimelineProps {
  className?: string;
  style?: React.CSSProperties;
  onObjectSelect?: (objectId: string | null) => void;
  onTimelineChange?: (state: any) => void;
  onError?: (error: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  className,
  style,
  onObjectSelect,
  onTimelineChange,
  onError
}) => {
  const timeline = useTimeline({
    onStateChange: onTimelineChange || undefined,
    onError: onError || undefined
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });

  // 处理鼠标拖拽滚动
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只处理左键

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      scrollLeft: timeline.state.scrollPosition
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const newScrollPosition = dragStart.scrollLeft - deltaX;

    timeline.setScrollPosition(newScrollPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 处理对象选择
  const handleObjectSelect = (objectId: string | null) => {
    timeline.selectObject(objectId);
    onObjectSelect?.(objectId);
  };

  // 处理时间标尺点击
  const handleRulerClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timePosition = x / timeline.state.zoomLevel;

    // 这里可以添加播放头定位逻辑
    console.log('Ruler clicked at time:', timePosition);
  };

  // 计算时间轴总宽度
  const getTimelineWidth = () => {
    const timelineRange = timeline.getObjectsInTimeRange(0, Infinity);
    if (timelineRange.length === 0) return 1000; // 默认宽度

    const maxEndTime = Math.max(...timelineRange.map(obj => {
      return obj.type === 'duration' ? obj.startTime + (obj.duration || 0) : obj.startTime;
    }));

    return Math.max(1000, (maxEndTime + 10) * timeline.state.zoomLevel);
  };

  const timelineWidth = getTimelineWidth();

  return (
    <div className={`${styles.timelineContainer} ${className || ''}`} style={style}>
      {/* 时间轴控制栏 */}
      <TimelineControls
        zoomLevel={timeline.state.zoomLevel}
        onZoomIn={timeline.zoomIn}
        onZoomOut={timeline.zoomOut}
        onAddTrack={timeline.addTrack}
        className={styles.controls}
      />

      {/* 时间轴主体 */}
      <div
        ref={containerRef}
        className={styles.timelineBody}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {/* 时间标尺 */}
        <div className={styles.ruler} onClick={handleRulerClick}>
          <div
            className={styles.rulerContent}
            style={{
              width: timelineWidth,
              transform: `translateX(${-timeline.state.scrollPosition}px)`
            }}
          >
            {Array.from({ length: Math.ceil(timelineWidth / 100) }, (_, i) => (
              <div
                key={i}
                className={styles.rulerMark}
                style={{ left: i * 100 }}
              >
                <span className={styles.rulerLabel}>{i * 10}s</span>
              </div>
            ))}
          </div>
        </div>

        {/* 轨道列表 */}
        <div className={styles.tracksContainer}>
          {timeline.state.tracks.map((track, index) => (
            <Track
              key={track.id}
              trackId={track.id}
              index={index}
              totalTracks={timeline.state.tracks.length}
              onObjectSelect={handleObjectSelect}
              selectedObjectId={timeline.state.selectedObjectId}
              zoomLevel={timeline.state.zoomLevel}
              scrollPosition={timeline.state.scrollPosition}
              timelineWidth={timelineWidth}
            />
          ))}

          {/* 空状态 */}
          {timeline.state.tracks.length === 0 && (
            <div className={styles.emptyState}>
              <p>暂无轨道</p>
              <button onClick={() => timeline.addTrack()} className={styles.addTrackButton}>
                添加轨道
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 水平滚动条 */}
      <div className={styles.horizontalScrollbar}>
        <div
          className={styles.scrollThumb}
          style={{
            width: `${Math.min(100, (800 / timelineWidth) * 100)}%`,
            left: `${Math.min(100, (timeline.state.scrollPosition / timelineWidth) * 100)}%`
          }}
        />
      </div>
    </div>
  );
};

export default Timeline;