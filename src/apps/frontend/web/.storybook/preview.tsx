import '../src/styles/globals.css'; // Tailwind CSS
import type { Preview } from '@storybook/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { getSamplesMock } from '@/libs/api-client/endpoints/samples/samples.msw';

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass',
  serviceWorker: {
    url: '/mockServiceWorker.js',
  },
});

const queryClient = new QueryClient();

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    msw: {
      handlers: [
        http.get('*/api/samples', () => {
          return HttpResponse.json({
            data: [
              { id: '1', title: 'Sample 1' },
              { id: '2', title: 'Sample 2' },
              { id: '3', title: 'Sample 3' },
              { id: '4', title: 'Sample 4' },
              { id: '5', title: 'Sample 5' },
            ],
            total: 6,
            count: 5,
            offset: 0,
            limit: 5,
          });
        }),
      ],
      ...getSamplesMock(),
    },
  },
  loaders: [
    // Provide the MSW addon loader globally
    mswLoader,
  ],
};

export default preview;
