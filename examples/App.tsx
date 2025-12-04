import React, { useState, useEffect } from 'react';
import { Timeline, PropertyEditor, useTimeline } from '../src/react';
import { createSimpleTimelineState } from '../src/data/mockData';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 初始化时间轴数据
  const timeline = useTimeline({
    initialState: createSimpleTimelineState(),
    onStateChange: (state) => {
      console.log('Timeline state changed:', state);
    },
    onError: (error) => {
      console.error('Timeline error:', error);
    }
  });

  // 播放控制
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime > 100) { // 假设最大时间为100秒
            setIsPlaying(false);
            return 0;
          }
          return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleTimelineChange = (state: any) => {
    console.log('Timeline changed:', state);
  };

  const handleObjectSelect = (objectId: string | null) => {
    console.log('Object selected:', objectId);
  };

  const handlePropertyChange = (objectId: string, property: string, value: any) => {
    console.log('Property changed:', { objectId, property, value });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>时间轴工具演示</h1>
        <div className="playback-controls">
          <button
            className={`play-button ${isPlaying ? 'playing' : ''}`}
            onClick={handlePlay}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button className="stop-button" onClick={handleStop}>
            ⏹️
          </button>
          <div className="time-display">
            时间: {currentTime.toFixed(1)}s
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="timeline-section">
          <Timeline
            className="timeline-component"
            onTimelineChange={handleTimelineChange}
            onObjectSelect={handleObjectSelect}
          />
        </div>

        <div className="property-section">
          <PropertyEditor
            className="property-editor"
            onPropertyChange={handlePropertyChange}
          />
        </div>
      </main>

      <footer className="app-footer">
        <div className="info-panel">
          <h3>使用说明</h3>
          <ul>
            <li>点击时间轴上的对象进行选择</li>
            <li>双击对象可以编辑属性</li>
            <li>拖拽对象可以移动位置</li>
            <li>拖拽对象边缘可以调整持续时间</li>
            <li>使用控制栏按钮添加轨道和缩放</li>
          </ul>
        </div>

        <div className="stats-panel">
          <h3>统计信息</h3>
          <p>轨道数: {timeline.state.tracks.length}</p>
          <p>总对象数: {timeline.state.tracks.reduce((sum, track) => sum + track.objects.length, 0)}</p>
          <p>选中对象: {timeline.state.selectedObjectId || '无'}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;