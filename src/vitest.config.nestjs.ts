import swc from 'unplugin-swc';
import { defineConfig, mergeConfig } from 'vitest/config';
import { sharedVitestConfig } from '../vitest.config';

export default mergeConfig(
  sharedVitestConfig,
  defineConfig({
    test: {
      environment: 'node',
    },
    plugins: [
      swc.vite({
        module: { type: 'es6' },
      }),
    ],
  }),
);
