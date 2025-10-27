/**
 * useSampleForm.specテストファイル
 * テストケースを定義
 */
import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent } from 'react';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSampleControllerGetSampleById } from '@/libs/api-client/endpoints/samples/samples';
import { useSampleStore } from '../stores/sampleStore';
import { useSampleForm } from './useSampleForm';

// 型定義
const mockUseSampleStore = useSampleStore as unknown as Mock;

// useSampleControllerGetSampleById をモック化
vi.mock('@/libs/api-client/endpoints/samples/samples', () => ({
  useSampleControllerGetSampleById: vi.fn(),
}));

// useSampleStore をモック化
vi.mock('../stores/sampleStore', () => ({
  useSampleStore: vi.fn(),
}));

describe('useSampleForm', () => {
  const mockSetEditedSample = vi.fn();

  beforeEach(() => {
    // 各テストの前にモックをリセット
    vi.clearAllMocks();
    // useSampleStore をモック化
    mockUseSampleStore.mockReturnValue({
      editedSample: null,
      setEditedSample: mockSetEditedSample,
    });
    // useSampleControllerGetSampleById のモック設定
    (useSampleControllerGetSampleById as Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('should initialize with an empty title when not in edit mode', () => {
    // Arrange
    const mockEditedSample = { title: '' };
    mockUseSampleStore.mockReturnValue({
      editedSample: mockEditedSample,
      setEditedSample: mockSetEditedSample,
    });

    // Act
    const { result } = renderHook(() => useSampleForm(false));

    // Assert
    expect(result.current.editedSample).toEqual({ title: '' });
    expect(mockSetEditedSample).toHaveBeenCalledWith({ title: '' });
  });

  it('should set editedSample with sampleData when in edit mode and data is available', () => {
    // Arrange
    const sampleData = { data: { title: 'Existing Title' } };
    const mockEditedSample = { title: 'Existing Title' };
    (useSampleControllerGetSampleById as Mock).mockReturnValue({
      data: sampleData,
      isLoading: false,
      isError: false,
      error: null,
    });
    mockUseSampleStore.mockReturnValue({
      editedSample: mockEditedSample,
      setEditedSample: mockSetEditedSample,
    });

    // Act
    const { result } = renderHook(() => useSampleForm(true, 'sample-id'));

    // Assert
    expect(result.current.editedSample).toEqual({ title: 'Existing Title' });
    expect(mockSetEditedSample).toHaveBeenCalledWith({ title: 'Existing Title' });
  });

  it('should handle handleChange for input elements', () => {
    // Arrange
    const initialSample = { title: 'Initial Title' };
    mockUseSampleStore.mockReturnValue({
      editedSample: initialSample,
      setEditedSample: mockSetEditedSample,
    });
    const { result } = renderHook(() => useSampleForm(false));

    const event = {
      target: { name: 'title', value: 'New Title' },
    } as ChangeEvent<HTMLInputElement>;

    // Act
    act(() => {
      result.current.handleChange(event);
    });

    // Assert
    expect(mockSetEditedSample).toHaveBeenCalledWith({ ...initialSample, title: 'New Title' });
  });

  it('should return isLoading, isError, and error from useSampleControllerGetSampleById', () => {
    // Arrange
    const mockError = new Error('Failed to fetch');
    (useSampleControllerGetSampleById as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: true,
      error: mockError,
    });

    // Act
    const { result } = renderHook(() => useSampleForm(true, 'sample-id'));

    // Assert
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(mockError);
  });

  it('should not call setEditedSample if sampleData is null in edit mode', () => {
    // Arrange
    (useSampleControllerGetSampleById as Mock).mockReturnValue({
      data: { data: null }, // sampleData.data が null のケース
      isLoading: false,
      isError: false,
      error: null,
    });

    // Act
    renderHook(() => useSampleForm(true, 'sample-id'));

    // Assert
    expect(mockSetEditedSample).toHaveBeenCalledWith({ title: '' });
  });

  it('should not call useSampleControllerGetSampleById if not in edit mode', () => {
    // Act
    renderHook(() => useSampleForm(false));

    // Assert
    expect(useSampleControllerGetSampleById).toHaveBeenCalledWith('', { query: { enabled: false } });
  });

  it('should call useSampleControllerGetSampleById with correct id and enabled true when in edit mode', () => {
    // Arrange
    const sampleId = 'test-id-123';

    // Act
    renderHook(() => useSampleForm(true, sampleId));

    // Assert
    expect(useSampleControllerGetSampleById).toHaveBeenCalledWith(sampleId, { query: { enabled: true } });
  });
});
