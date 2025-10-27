/**
 * NestJS用のVitest設定ファイル
 * バックエンドのテスト実行環境を設定
 */
import swc from 'unplugin-swc';
import { defineConfig, mergeConfig } from 'vitest/config';
import { sharedVitestConfig } from '../vitest.config';

export default mergeConfig(
  sharedVitestConfig,
  defineConfig({
    test: {
      environment: 'node',
      exclude: ['src/apps/frontend/web/**'],
    },
    plugins: [
      swc.vite({
        module: { type: 'es6' },
      }),
    ],
  }),
);
