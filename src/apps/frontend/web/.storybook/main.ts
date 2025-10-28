import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  // TODO: Vite、Vitest対応
  addons: ['msw-storybook-addon', '@storybook/addon-a11y', '@chromatic-com/storybook'],
  staticDirs: [
    '../public', // ← mockServiceWorker.js
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
};

export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/recipes/storybook/custom-builder-configs
