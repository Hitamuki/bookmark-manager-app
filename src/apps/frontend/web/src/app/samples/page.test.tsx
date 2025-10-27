/**
 * page.testテストファイル
 * テストケースを定義
 */
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { server } from '@/msw/setup/server';
import { renderWithProviders } from '@/test/integration/utils';
import SamplesPage from './page';
import '@testing-library/jest-dom';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock('next/link', () => {
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
  };
});

const mockSamples = {
  data: [
    { id: '1', title: 'Sample 1' },
    { id: '2', title: 'Sample 2' },
  ],
  total: 2,
  count: 2,
  offset: 0,
  limit: 10,
};

// SamplesPageコンポーネントのテストスイート
describe('SamplesPage', () => {
  // 「作成ボタンとサンプルリストを含むページをレンダリングする」テストケース
  it('renders page with create button and sample list', async () => {
    // Arrange
    // MSW (Mock Service Worker) を使用して、/api/samplesへのGETリクエストがmockSamplesを返すように設定
    // これにより、コンポーネントがAPIからデータを取得する際の挙動をシミュレート
    server.use(http.get('/api/samples', () => HttpResponse.json(mockSamples)));

    // Act
    // SamplesPageコンポーネントをプロバイダー（React Queryなど）でラップしてレンダリング
    // これにより、コンポーネントが実際にブラウザで表示される状態を再現
    renderWithProviders(<SamplesPage />);

    // Assert
    // ページ内に「作成」リンクが存在し、正しいhref属性（/samples/create）を持っていることを検証
    const createLink = screen.getByRole('link', { name: '' });
    expect(createLink).toHaveAttribute('href', '/samples/create');

    // 非同期処理（データフェッチ）が完了し、サンプルリストが画面に表示されるまで待機
    // 「Sample 1」と「Sample 2」というテキストがドキュメント内に存在することを確認
    await waitFor(() => {
      expect(screen.getByText('Sample 1')).toBeInTheDocument();
      expect(screen.getByText('Sample 2')).toBeInTheDocument();
    });
  });
});
