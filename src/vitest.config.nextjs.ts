import react from '@vitejs/plugin-react';
import { defineConfig, mergeConfig } from 'vitest/config';
import { sharedVitestConfig } from '../vitest.config';

export default mergeConfig(
  sharedVitestConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['@testing-library/jest-dom/vitest'],
      include: ['**/*.test.tsx', '**/*.spec.tsx'],
      exclude: ['src/apps/web-api/**'],
    },
    plugins: [react()],
  }),
);
