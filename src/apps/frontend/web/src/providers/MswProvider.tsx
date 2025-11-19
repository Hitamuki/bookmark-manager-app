/**
 * MswProvider
 * モジュール定義
 */
'use client';

// MSWはローカル開発環境でのみ有効化
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
  require('../msw/setup');
}

export default function MswProvider({ children }: { children: React.ReactNode }) {
  return children;
}
