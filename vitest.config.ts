import { resolve } from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export const sharedVitestConfig = defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    include: ['**/*.spec.ts', '**/*.test.ts'],
    exclude: ['node_modules', 'docs', 'poc', 'sandbox', '.nx', '**/.next', '*.js', '*.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['docs', 'poc', 'sandbox', '.nx', '**/.next', '*.js', '*.ts'],
    },
  },
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      src: resolve(__dirname, './src'),
    },
  },
});
