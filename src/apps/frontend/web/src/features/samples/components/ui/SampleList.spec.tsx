/**
 * SampleList.specテストファイル
 * テストケースを定義
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PAGINATION } from '@/constants/pagination';
import {
  useSampleControllerDeleteSampleById,
  useSampleControllerSearchSamples,
} from '@/libs/api-client/endpoints/samples/samples';
import { SampleList } from './SampleList';

// useSampleControllerSearchSamplesとuseSampleControllerDeleteSampleByIdのモック
vi.mock('@/libs/api-client/endpoints/samples/samples', () => ({
  useSampleControllerSearchSamples: vi.fn(),
  useSampleControllerDeleteSampleById: vi.fn(),
}));

// ErrorDisplayとLoadingSpinnerのモック
vi.mock('@/components/ui/ErrorDisplay', () => ({
  ErrorDisplay: vi.fn(({ message, statusCode }) => (
    <div data-testid="error-display">
      Error: {message} Status: {statusCode}
    </div>
  )),
}));

vi.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: vi.fn(() => <div data-testid="loading-spinner">Loading...</div>),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

/**
 * renderWithClient関数
 */
const renderWithClient = (ui: React.ReactElement) => {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('SampleList', () => {
  // 各テストの前にクエリキャッシュをクリア
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks(); // 各テスト前にモックをクリア
  });

  // ローディング状態のテスト
  it('should display loading spinner when samples are loading', async () => {
    // Arrange
    (useSampleControllerSearchSamples as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    // Act
    renderWithClient(<SampleList />);

    // Assert
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(LoadingSpinner).toHaveBeenCalledTimes(1);
  });

  // エラー状態のテスト
  it('should display error message when there is an error fetching samples', async () => {
    // Arrange
    const errorMessage = 'Failed to fetch samples';
    (useSampleControllerSearchSamples as Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { message: errorMessage, response: { status: 500 } },
    });

    // Act
    renderWithClient(<SampleList />);

    // Assert
    expect(screen.getByTestId('error-display')).toBeInTheDocument();
    expect(screen.getByText(`Error: ${errorMessage} Status: 500`)).toBeInTheDocument();
    expect(ErrorDisplay).toHaveBeenCalledWith(
      expect.objectContaining({
        message: errorMessage,
        statusCode: 500,
      }),
      undefined,
    );
  });

  // データ表示のテスト
  it('should display samples when data is fetched successfully', async () => {
    // Arrange
    const mockSamples = {
      data: {
        data: [
          { id: '1', title: 'Sample 1' },
          { id: '2', title: 'Sample 2' },
        ],
        total: 2,
      },
    };
    (useSampleControllerSearchSamples as Mock).mockReturnValue({
      data: mockSamples,
      isLoading: false,
      isError: false,
      error: null,
    });

    // Act
    renderWithClient(<SampleList />);

    // Assert
    expect(screen.getByText('Sample 1')).toBeInTheDocument();
    expect(screen.getByText('Sample 2')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Edit sample').length).toBe(2);
    expect(screen.getAllByLabelText('Delete sample').length).toBe(2);
  });

  // ページネーションのテスト
  it('should handle pagination correctly', async () => {
    // Arrange
    const mockSamplesPage1 = {
      data: {
        data: [{ id: '1', title: 'Sample 1' }],
        total: PAGINATION.ITEMS_PER_PAGE * 2, // 2ページ分のデータがあることを想定
      },
    };
    const mockSamplesPage2 = {
      data: {
        data: [{ id: '2', title: 'Sample 2' }],
        total: PAGINATION.ITEMS_PER_PAGE * 2,
      },
    };

    (useSampleControllerSearchSamples as Mock)
      .mockReturnValueOnce({
        data: mockSamplesPage1,
        isLoading: false,
        isError: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockSamplesPage2,
        isLoading: false,
        isError: false,
        error: null,
      });

    // Act
    renderWithClient(<SampleList />);

    // Assert
    expect(screen.getByText('Sample 1')).toBeInTheDocument();
    expect(screen.queryByText('Sample 2')).not.toBeInTheDocument();

    // Act
    const user = userEvent.setup();
    //2ページ目に移動
    await user.click(screen.getByRole('button', { name: 'pagination item 2' }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByText('Sample 1')).not.toBeInTheDocument();
      expect(screen.getByText('Sample 2')).toBeInTheDocument();
    });
  });

  // 削除機能のテスト
  it('should call delete mutation when delete button is clicked', async () => {
    // Arrange
    const mockSamples = {
      data: {
        data: [
          { id: '1', title: 'Sample 1' },
          { id: '2', title: 'Sample 2' },
        ],
        total: 2,
      },
    };
    (useSampleControllerSearchSamples as Mock).mockReturnValueOnce({
      data: mockSamples,
      isLoading: false,
      isError: false,
      error: null,
    });

    const mutateAsync = vi.fn(() => Promise.resolve());
    (useSampleControllerDeleteSampleById as Mock).mockReturnValue({ mutateAsync });

    renderWithClient(<SampleList />);

    // Act: 最初のサンプルの削除ボタンをクリック
    const user = userEvent.setup();
    const deleteButtons = screen.getAllByLabelText('Delete sample');
    await user.click(deleteButtons[0]);

    // Assert
    expect(mutateAsync).toHaveBeenCalledWith({ id: '1' });
  });
});
