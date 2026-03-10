import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/ActionFeedback',
  component: 'loquix-action-feedback',
  tags: ['autodocs'],
  argTypes: {
    sentiment: { control: 'select', options: ['positive', 'negative'] },
    active: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const ThumbsUp: Story = {
  args: { sentiment: 'positive', active: false },
  render: args =>
    html`<loquix-action-feedback
      sentiment=${args.sentiment}
      ?active=${args.active}
    ></loquix-action-feedback>`,
};

export const ThumbsDown: Story = {
  args: { sentiment: 'negative', active: false },
  render: args =>
    html`<loquix-action-feedback
      sentiment=${args.sentiment}
      ?active=${args.active}
    ></loquix-action-feedback>`,
};

export const ActivePositive: Story = {
  args: { sentiment: 'positive', active: true },
  render: args =>
    html`<loquix-action-feedback
      sentiment=${args.sentiment}
      ?active=${args.active}
    ></loquix-action-feedback>`,
};

export const Pair: Story = {
  render: () =>
    html` <div style="display:flex;gap:4px">
      <loquix-action-feedback sentiment="positive"></loquix-action-feedback>
      <loquix-action-feedback sentiment="negative"></loquix-action-feedback>
    </div>`,
};
