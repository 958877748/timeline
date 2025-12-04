import React, { useRef, useState } from 'react';
import { useTrack } from '../../hooks';
import { TimelineObject } from '../TimelineObject';
import styles from './Track.module.css';

export interface TrackProps {
  trackId: string;
  index: number;
  totalTracks: number;
  onObjectSelect?: (objectId: string | null) => void;
  selectedObjectId: string | null;
  zoomLevel: number;
  scrollPosition: number;
  timelineWidth: number;
}

export const Track: React.FC<TrackProps> = ({
  trackId,
  onObjectSelect,
  selectedObjectId,
  zoomLevel,
  scrollPosition,
  timelineWidth
}) => {
  const track = useTrack({ trackId });
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(track.track?.name || '');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!track.track) {
    return null;
  }

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleStartRenaming = () => {
    if (!track.track) return;
    setIsRenaming(true);
    setNewName(track.track.name);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleFinishRenaming = () => {
    if (!track.track) return;
    if (newName.trim() && newName !== track.track.name) {
      track.updateName(newName.trim());
    }
    setIsRenaming(false);
  };

  const handleCancelRenaming = () => {
    if (!track.track) return;
    setNewName(track.track.name);
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishRenaming();
    } else if (e.key === 'Escape') {
      handleCancelRenaming();
    }
  };

  const handleTrackClick = () => {
    // 清除对象选择
    onObjectSelect?.(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const objectId = e.dataTransfer.getData('text/plain');
    if (objectId) {
      // 计算放置位置的时间
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollPosition;
      const timePosition = x / zoomLevel;

      track.moveObject(objectId, timePosition);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className={styles.trackContainer}>
      {/* 轨道头部 */}
      <div className={styles.trackHeader}>
        <div className={styles.trackControls}>
          <button
            className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
            onClick={handleToggleExpanded}
            title={isExpanded ? '折叠轨道' : '展开轨道'}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M4 3L8 6L4 9" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </button>

          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleFinishRenaming}
              onKeyDown={handleKeyDown}
              className={styles.renameInput}
            />
          ) : (
            <span
              className={styles.trackName}
              onDoubleClick={handleStartRenaming}
              title="双击重命名"
            >
              {track.track.name}
            </span>
          )}
        </div>

        <div className={styles.trackActions}>
          <span className={styles.objectCount}>
            {track.track.objects.length}
          </span>
          <button
            className={styles.deleteButton}
            onClick={() => track.remove()}
            title="删除轨道"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M4 4L10 10M10 4L4 10" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 轨道内容 */}
      {isExpanded && (
        <div
          className={styles.trackContent}
          onClick={handleTrackClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            width: timelineWidth,
            transform: `translateX(${-scrollPosition}px)`
          }}
        >
          {/* 网格背景 */}
          <div
            className={styles.gridBackground}
            style={{
              backgroundImage: `repeating-linear-gradient(
                to right,
                transparent 0px,
                transparent ${99 * zoomLevel}px,
                rgba(255, 255, 255, 0.1) ${99 * zoomLevel}px,
                rgba(255, 255, 255, 0.1) ${100 * zoomLevel}px
              )`
            }}
          />

          {/* 对象列表 */}
          <div className={styles.objectsContainer}>
            {track.track.objects.map((object) => (
              <TimelineObject
                key={object.id}
                objectId={object.id}
                zoomLevel={zoomLevel}
                isSelected={selectedObjectId === object.id}
                onSelect={onObjectSelect || (() => {})}
              />
            ))}
          </div>

          {/* 空状态 */}
          {track.track.objects.length === 0 && (
            <div className={styles.emptyTrack}>
              <p>拖放对象到此处</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Track;