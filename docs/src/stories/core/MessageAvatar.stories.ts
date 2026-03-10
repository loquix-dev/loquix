import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/MessageAvatar',
  component: 'loquix-message-avatar',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['icon', 'image', 'initials', 'animated'] },
    state: { control: 'select', options: ['idle', 'thinking', 'streaming', 'error'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    name: { control: 'text' },
    src: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: { variant: 'icon', state: 'idle', size: 'md' },
  render: args =>
    html`<loquix-message-avatar
      variant=${args.variant}
      state=${args.state}
      size=${args.size}
    ></loquix-message-avatar>`,
};

export const WithInitials: Story = {
  args: { variant: 'initials', name: 'John Doe', size: 'md' },
  render: args =>
    html`<loquix-message-avatar
      variant=${args.variant}
      name=${args.name}
      size=${args.size}
    ></loquix-message-avatar>`,
};

export const Thinking: Story = {
  args: { variant: 'icon', state: 'thinking', size: 'md' },
  render: args =>
    html`<loquix-message-avatar
      variant=${args.variant}
      state=${args.state}
      size=${args.size}
    ></loquix-message-avatar>`,
};

export const Streaming: Story = {
  args: { variant: 'icon', state: 'streaming', size: 'lg' },
  render: args =>
    html`<loquix-message-avatar
      variant=${args.variant}
      state=${args.state}
      size=${args.size}
    ></loquix-message-avatar>`,
};

export const AllSizes: Story = {
  render: () => html` <div style="display:flex;gap:12px;align-items:center">
    <loquix-message-avatar size="sm"></loquix-message-avatar>
    <loquix-message-avatar size="md"></loquix-message-avatar>
    <loquix-message-avatar size="lg"></loquix-message-avatar>
  </div>`,
};
