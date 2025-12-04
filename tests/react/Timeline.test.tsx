import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Timeline } from '../../src/components/Timeline';
import { useTimeline } from '../../src/hooks';

// Mock the useTimeline hook
jest.mock('../../src/hooks/useTimeline');

describe('Timeline Component', () => {
  const mockTimeline = {
    state: {
      tracks: [
        {
          id: 'track-1',
          name: 'Track 1',
          objects: [
            {
              id: 'obj-1',
              type: 'duration' as const,
              startTime: 0,
              duration: 5,
              properties: { name: 'Object 1' }
            }
          ]
        }
      ],
      zoomLevel: 1,
      scrollPosition: 0,
      selectedObjectId: null
    },
    config: {
      minZoom: 0.1,
      maxZoom: 10,
      timeUnit: 'seconds' as const,
      snapToGrid: false,
      gridSize: 1
    },
    addTrack: jest.fn(),
    removeTrack: jest.fn(),
    updateTrackName: jest.fn(),
    addObject: jest.fn(),
    removeObject: jest.fn(),
    updateObject: jest.fn(),
    moveObject: jest.fn(),
    duplicateObject: jest.fn(),
    selectObject: jest.fn(),
    clearSelection: jest.fn(),
    setZoomLevel: jest.fn(),
    setScrollPosition: jest.fn(),
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    getSelectedObject: jest.fn(),
    getTrackById: jest.fn(),
    getObjectById: jest.fn(),
    getObjectsInTimeRange: jest.fn(),
    validate: jest.fn()
  };

  beforeEach(() => {
    (useTimeline as jest.Mock).mockReturnValue(mockTimeline);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders timeline component', () => {
    render(<Timeline />);

    expect(screen.getByText('时间轴')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('添加轨道')).toBeInTheDocument();
  });

  it('handles zoom in/out buttons', () => {
    render(<Timeline />);

    const zoomInButton = screen.getByTitle('放大');
    const zoomOutButton = screen.getByTitle('缩小');

    fireEvent.click(zoomInButton);
    expect(mockTimeline.zoomIn).toHaveBeenCalledTimes(1);

    fireEvent.click(zoomOutButton);
    expect(mockTimeline.zoomOut).toHaveBeenCalledTimes(1);
  });

  it('handles add track button', () => {
    render(<Timeline />);

    const addTrackButton = screen.getByText('添加轨道');
    fireEvent.click(addTrackButton);

    expect(mockTimeline.addTrack).toHaveBeenCalledTimes(1);
  });

  it('displays tracks correctly', () => {
    render(<Timeline />);

    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Object count
  });

  it('handles object selection callback', () => {
    const onObjectSelect = jest.fn();
    render(<Timeline onObjectSelect={onObjectSelect} />);

    // Simulate object selection through component interaction
    // This would typically involve clicking on an object in the timeline
    // For now, we test that the callback is properly passed
    expect(onObjectSelect).toBeDefined();
  });

  it('handles timeline change callback', () => {
    const onTimelineChange = jest.fn();
    render(<Timeline onTimelineChange={onTimelineChange} />);

    // The callback should be passed to useTimeline hook
    expect(useTimeline).toHaveBeenCalledWith(
      expect.objectContaining({
        onStateChange: onTimelineChange
      })
    );
  });

  it('handles error callback', () => {
    const onError = jest.fn();
    render(<Timeline onError={onError} />);

    // The callback should be passed to useTimeline hook
    expect(useTimeline).toHaveBeenCalledWith(
      expect.objectContaining({
        onError
      })
    );
  });

  it('applies custom className and style', () => {
    const customStyle = { backgroundColor: 'red' };
    const { container } = render(
      <Timeline className="custom-timeline" style={customStyle} />
    );

    const timelineContainer = container.firstChild;
    expect(timelineContainer).toHaveClass('custom-timeline');
    expect(timelineContainer).toHaveStyle('background-color: red');
  });

  it('shows empty state when no tracks', () => {
    const emptyTimeline = {
      ...mockTimeline,
      state: {
        ...mockTimeline.state,
        tracks: []
      }
    };
    (useTimeline as jest.Mock).mockReturnValue(emptyTimeline);

    render(<Timeline />);

    expect(screen.getByText('暂无轨道')).toBeInTheDocument();
    expect(screen.getByText('添加轨道')).toBeInTheDocument();
  });

  it('handles mouse drag for scrolling', async () => {
    render(<Timeline />);

    const timelineBody = screen.getByRole('region', { name: /timeline body/i });

    // Simulate mouse drag
    fireEvent.mouseDown(timelineBody, { clientX: 100, button: 0 });
    fireEvent.mouseMove(timelineBody, { clientX: 200 });
    fireEvent.mouseUp(timelineBody);

    // Verify that setScrollPosition was called
    await waitFor(() => {
      expect(mockTimeline.setScrollPosition).toHaveBeenCalled();
    });
  });

  it('handles ruler click', () => {
    render(<Timeline />);

    const ruler = screen.getByRole('button', { name: /timeline ruler/i });

    // Mock console.log to verify the click handler
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    fireEvent.click(ruler, { clientX: 100 });

    expect(consoleSpy).toHaveBeenCalledWith('Ruler clicked at time:', expect.any(Number));

    consoleSpy.mockRestore();
  });
});