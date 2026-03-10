import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/MessageActions',
  component: 'loquix-message-actions',
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['horizontal', 'vertical'] },
    position: { control: 'select', options: ['hover', 'always', 'on-complete'] },
    messageRole: { control: 'select', options: ['user', 'assistant', 'system', 'tool'] },
  },
};
export default meta;

type Story = StoryObj;

export const AssistantActions: Story = {
  args: { messageRole: 'assistant', position: 'always' },
  render: args =>
    html`<loquix-message-actions
      message-role=${args.messageRole}
      position=${args.position}
    ></loquix-message-actions>`,
};

export const UserActions: Story = {
  args: { messageRole: 'user', position: 'always' },
  render: args =>
    html`<loquix-message-actions
      message-role=${args.messageRole}
      position=${args.position}
    ></loquix-message-actions>`,
};

export const Vertical: Story = {
  args: { messageRole: 'assistant', direction: 'vertical', position: 'always' },
  render: args =>
    html`<loquix-message-actions
      message-role=${args.messageRole}
      direction=${args.direction}
      position=${args.position}
    ></loquix-message-actions>`,
};

export const CustomSlotted: Story = {
  render: () =>
    html` <loquix-message-actions position="always">
      <loquix-action-copy></loquix-action-copy>
      <loquix-action-feedback sentiment="positive"></loquix-action-feedback>
      <loquix-action-feedback sentiment="negative"></loquix-action-feedback>
    </loquix-message-actions>`,
};
