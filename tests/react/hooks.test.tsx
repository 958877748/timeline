import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useTimeline, useTrack, useTimelineObject } from '../../src/hooks';
import { TimelineModel } from '../../src/models/TimelineModel';

// Mock the TimelineModel
jest.mock('../../src/models/TimelineModel');

describe('React Hooks', () => {
  let mockModel: jest.Mocked<TimelineModel>;

  beforeEach(() => {
    mockModel = {
      getState: jest.fn(),
      getConfig: jest.fn(),
      dispatch: jest.fn(),
      getSelectedObject: jest.fn(),
      getTrackById: jest.fn(),
      getObjectById: jest.fn(),
      getObjectsInTimeRange: jest.fn(),
      validate: jest.fn()
    } as any;

    mockModel.getState.mockReturnValue({
      tracks: [
        {
          id: 'track-1',
          name: 'Test Track',
          objects: [
            {
              id: 'obj-1',
              type: 'duration',
              startTime: 0,
              duration: 5,
              properties: { name: 'Test Object' }
            }
          ]
        }
      ],
      zoomLevel: 1,
      scrollPosition: 0,
      selectedObjectId: 'obj-1'
    });

    mockModel.getConfig.mockReturnValue({
      minZoom: 0.1,
      maxZoom: 10,
      timeUnit: 'seconds',
      snapToGrid: false,
      gridSize: 1
    });

    mockModel.getSelectedObject.mockReturnValue({
      id: 'obj-1',
      type: 'duration',
      startTime: 0,
      duration: 5,
      properties: { name: 'Test Object' }
    });

    // Mock TimelineModel constructor
    (TimelineModel as jest.MockedClass<typeof TimelineModel>).mockImplementation(() => mockModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useTimeline', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useTimeline());

      expect(result.current.state).toBeDefined();
      expect(result.current.config).toBeDefined();
      expect(result.current.addTrack).toBeInstanceOf(Function);
      expect(result.current.zoomIn).toBeInstanceOf(Function);
    });

    it('handles addTrack operation', () => {
      const { result } = renderHook(() => useTimeline());

      act(() => {
        result.current.addTrack('New Track');
      });

      expect(mockModel.dispatch).toHaveBeenCalledWith({
        type: 'ADD_TRACK',
        payload: { name: 'New Track' }
      });
    });

    it('handles removeTrack operation', () => {
      const { result } = renderHook(() => useTimeline());

      act(() => {
        result.current.removeTrack('track-1');
      });

      expect(mockModel.dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_TRACK',
        payload: { trackId: 'track-1' }
      });
    });

    it('handles zoom operations', () => {
      const { result } = renderHook(() => useTimeline());

      act(() => {
        result.current.zoomIn();
      });

      // Should call setZoomLevel with increased zoom
      expect(mockModel.dispatch).toHaveBeenCalled();
    });

    it('handles object operations', () => {
      const { result } = renderHook(() => useTimeline());

      const newObject = {
        type: 'duration' as const,
        startTime: 10,
        duration: 3,
        properties: { name: 'New Object' }
      };

      act(() => {
        result.current.addObject('track-1', newObject);
      });

      expect(mockModel.dispatch).toHaveBeenCalledWith({
        type: 'ADD_OBJECT',
        payload: { trackId: 'track-1', object: newObject }
      });
    });

    it('handles selection operations', () => {
      const { result } = renderHook(() => useTimeline());

      act(() => {
        result.current.selectObject('obj-1');
      });

      expect(mockModel.dispatch).toHaveBeenCalledWith({
        type: 'SELECT_OBJECT',
        payload: { objectId: 'obj-1' }
      });
    });

    it('calls callbacks on state change', () => {
      const onStateChange = jest.fn();
      const onError = jest.fn();

      renderHook(() => useTimeline({
        onStateChange,
        onError
      }));

      // Simulate state change by calling dispatch
      act(() => {
        mockModel.dispatch({ type: 'ADD_TRACK', payload: { name: 'Test' } });
      });

      expect(onStateChange).toHaveBeenCalledWith(mockModel.getState());
    });

    it('handles errors gracefully', () => {
      const onError = jest.fn();
      const error = new Error('Test error');

      mockModel.dispatch.mockImplementation(() => {
        throw error;
      });

      const { result } = renderHook(() => useTimeline({ onError }));

      act(() => {
        result.current.addTrack('Test');
      });

      expect(onError).toHaveBeenCalledWith('Test error');
    });

    it('provides utility methods', () => {
      const { result } = renderHook(() => useTimeline());

      const selectedObject = result.current.getSelectedObject();
      expect(selectedObject).toBeDefined();
      expect(selectedObject?.id).toBe('obj-1');

      const track = result.current.getTrackById('track-1');
      expect(track).toBeDefined();
      expect(track?.name).toBe('Test Track');

      const object = result.current.getObjectById('obj-1');
      expect(object).toBeDefined();
      expect(object?.properties.name).toBe('Test Object');
    });
  });

  describe('useTrack', () => {
    it('returns track information and operations', () => {
      const { result } = renderHook(() => useTrack({ trackId: 'track-1' }));

      expect(result.current.track).toBeDefined();
      expect(result.current.track?.name).toBe('Test Track');
      expect(result.current.updateName).toBeInstanceOf(Function);
      expect(result.current.addObject).toBeInstanceOf(Function);
    });

    it('handles track name update', () => {
      const { result } = renderHook(() => useTrack({ trackId: 'track-1' }));

      act(() => {
        result.current.updateName('Updated Track');
      });

      expect(mockModel.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_TRACK_NAME',
        payload: { trackId: 'track-1', name: 'Updated Track' }
      });
    });

    it('handles object operations within track', () => {
      const { result } = renderHook(() => useTrack({ trackId: 'track-1' }));

      act(() => {
        result.current.removeObject('obj-1');
      });

      expect(mockModel.dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_OBJECT',
        payload: { objectId: 'obj-1' }
      });
    });

    it('returns null when track not found', () => {
      mockModel.getTrackById.mockReturnValue(null);

      const { result } = renderHook(() => useTrack({ trackId: 'non-existent' }));

      expect(result.current.track).toBeNull();
    });
  });

  describe('useTimelineObject', () => {
    it('returns object information and operations', () => {
      const { result } = renderHook(() => useTimelineObject({ objectId: 'obj-1' }));

      expect(result.current.object).toBeDefined();
      expect(result.current.object?.id).toBe('obj-1');
      expect(result.current.update).toBeInstanceOf(Function);
      expect(result.current.remove).toBeInstanceOf(Function);
      expect(result.current.isSelected).toBe(true);
    });

    it('handles object property updates', () => {
      const { result } = renderHook(() => useTimelineObject({ objectId: 'obj-1' }));

      act(() => {
        result.current.updateProperty('name', 'Updated Object');
      });

      expect(mockModel.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_OBJECT',
        payload: {
          objectId: 'obj-1',
          updates: {
            properties: { name: 'Test Object', name: 'Updated Object' }
          }
        }
      });
    });

    it('handles object selection', () => {
      const { result } = renderHook(() => useTimelineObject({ objectId: 'obj-1' }));

      act(() => {
        result.current.select();
      });

      expect(mockModel.dispatch).toHaveBeenCalledWith({
        type: 'SELECT_OBJECT',
        payload: { objectId: 'obj-1' }
      });
    });

    it('returns null when object not found', () => {
      mockModel.getObjectById.mockReturnValue(null);

      const { result } = renderHook(() => useTimelineObject({ objectId: 'non-existent' }));

      expect(result.current.object).toBeNull();
    });

    it('returns correct selection state', () => {
      const { result } = renderHook(() => useTimelineObject({ objectId: 'obj-1' }));

      expect(result.current.isSelected).toBe(true);

      // Test when not selected
      mockModel.getState.mockReturnValue({
        ...mockModel.getState(),
        selectedObjectId: 'other-obj'
      });

      const { result: result2 } = renderHook(() => useTimelineObject({ objectId: 'obj-1' }));
      expect(result2.current.isSelected).toBe(false);
    });
  });
});