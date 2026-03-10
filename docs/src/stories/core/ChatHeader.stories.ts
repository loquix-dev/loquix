import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/ChatHeader',
  component: 'loquix-chat-header',
  tags: ['autodocs'],
  argTypes: {
    agentName: { control: 'text' },
    showModelBadge: { control: 'boolean' },
    privateMode: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: { agentName: 'AI Assistant' },
  render: args =>
    html` <div style="width:500px">
      <loquix-chat-header
        agent-name=${args.agentName}
        ?show-model-badge=${args.showModelBadge}
        ?private-mode=${args.privateMode}
      ></loquix-chat-header>
    </div>`,
};

export const WithModelBadge: Story = {
  args: { agentName: 'Claude', showModelBadge: true },
  render: args =>
    html` <div style="width:500px">
      <loquix-chat-header agent-name=${args.agentName} ?show-model-badge=${args.showModelBadge}>
        <loquix-message-avatar
          slot="avatar"
          variant="initials"
          name="AI"
          size="sm"
        ></loquix-message-avatar>
      </loquix-chat-header>
    </div>`,
};

export const PrivateMode: Story = {
  args: { agentName: 'Claude', privateMode: true },
  render: args =>
    html` <div style="width:500px">
      <loquix-chat-header
        agent-name=${args.agentName}
        ?private-mode=${args.privateMode}
      ></loquix-chat-header>
    </div>`,
};
