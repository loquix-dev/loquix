import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/TypingIndicator',
  component: 'loquix-typing-indicator',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['dots', 'text', 'steps'] },
    message: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj;

export const Dots: Story = {
  args: { variant: 'dots' },
  render: args => html`<loquix-typing-indicator variant=${args.variant}></loquix-typing-indicator>`,
};

export const Text: Story = {
  args: { variant: 'text', message: 'AI is typing...' },
  render: args =>
    html`<loquix-typing-indicator
      variant=${args.variant}
      message=${args.message}
    ></loquix-typing-indicator>`,
};

export const Steps: Story = {
  args: { variant: 'steps', message: 'Searching documents...' },
  render: args =>
    html`<loquix-typing-indicator
      variant=${args.variant}
      message=${args.message}
    ></loquix-typing-indicator>`,
};
