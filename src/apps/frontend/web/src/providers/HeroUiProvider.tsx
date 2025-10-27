/**
 * HeroUiProvider
 * モジュール定義
 */
'use client';

import { HeroUIProvider } from '@heroui/react';

/**
 * HeroUiProvider関数
 */
export function HeroUiProvider({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}
