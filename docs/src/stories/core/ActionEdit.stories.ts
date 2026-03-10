import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/ActionEdit',
  component: 'loquix-action-edit',
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['inline', 'composer'] },
    editing: { control: 'boolean' },
    disabled: { control: 'boolean' },
    messageId: { control: 'text' },
    content: { control: 'text' },
    submitLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj;

export const InlineMode: Story = {
  args: { mode: 'inline', messageId: 'msg-1', content: 'Hello, how can you help me today?' },
  render: args =>
    html`<loquix-action-edit
      mode=${args.mode}
      message-id=${args.messageId}
      .content=${args.content}
    ></loquix-action-edit>`,
};

export const ComposerMode: Story = {
  args: { mode: 'composer', messageId: 'msg-2', content: 'Some user message' },
  render: args =>
    html`<loquix-action-edit
      mode=${args.mode}
      message-id=${args.messageId}
      .content=${args.content}
    ></loquix-action-edit>`,
};

export const Editing: Story = {
  args: { mode: 'inline', messageId: 'msg-3', content: 'Edit me', editing: true },
  render: args =>
    html`<loquix-action-edit
      mode=${args.mode}
      message-id=${args.messageId}
      .content=${args.content}
      ?editing=${args.editing}
    ></loquix-action-edit>`,
};

export const Disabled: Story = {
  args: { mode: 'inline', disabled: true },
  render: args =>
    html`<loquix-action-edit mode=${args.mode} ?disabled=${args.disabled}></loquix-action-edit>`,
};
