/**
 * utils
 * モジュール定義
 */
// テスト用のヘルパー関数
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { HeroUiProvider } from '../../src/providers/HeroUiProvider';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

export const renderWithProviders = (ui: ReactElement) => {
  const testQueryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={testQueryClient}>
      <HeroUiProvider>{ui}</HeroUiProvider>
    </QueryClientProvider>,
  );
};
