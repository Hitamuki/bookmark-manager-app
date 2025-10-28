import type { Meta, StoryObj } from '@storybook/nextjs';
import { expect, waitFor, within } from 'storybook/test';
import { SampleList } from './SampleList';

const meta = {
  title: 'Samples/SampleList',
  component: SampleList,
  parameters: {
    // TODO: Docsが表示されない
    docs: {
      description: {
        component: 'サンプルデータをページング対応で表示するリストコンポーネント',
      },
    },
  },
  argTypes: {
    samples: {
      control: 'object',
      description: '表示するサンプルデータの配列',
    },
    // TODO: Actions確認
    onEdit: { action: 'onEdit' },
    onDelete: { action: 'onDelete' },
  },
  decorators: [],
} satisfies Meta<typeof SampleList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByText('Sample 1')).toBeInTheDocument();
    });
  },
};
