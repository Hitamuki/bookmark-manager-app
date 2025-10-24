import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { useSampleStore } from './sampleStore';

describe('useSampleStore', () => {
  // Arrange
  const initialState = useSampleStore.getState();

  it('should initialize with editedSample as null', () => {
    // Assert
    expect(initialState.editedSample).toBeNull();
  });

  it('should set editedSample correctly', () => {
    // Arrange
    const sample = { id: '1', title: 'Test Sample' };

    // Act
    act(() => {
      useSampleStore.getState().setEditedSample(sample);
    });

    // Assert
    expect(useSampleStore.getState().editedSample).toEqual(sample);
  });

  it('should set editedSample to null', () => {
    // Arrange
    const sample = { id: '1', title: 'Test Sample' };
    act(() => {
      useSampleStore.getState().setEditedSample(sample);
    });

    // Act
    act(() => {
      useSampleStore.getState().setEditedSample(null);
    });

    // Assert
    expect(useSampleStore.getState().editedSample).toBeNull();
  });
});
