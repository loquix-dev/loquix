import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/ActionCopy',
  component: 'loquix-action-copy',
  tags: ['autodocs'],
  argTypes: {
    copied: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => html`<loquix-action-copy></loquix-action-copy>`,
};

export const Copied: Story = {
  render: () => html`<loquix-action-copy copied></loquix-action-copy>`,
};
