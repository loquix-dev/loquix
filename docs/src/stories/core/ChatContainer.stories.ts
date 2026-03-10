import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/ChatContainer',
  component: 'loquix-chat-container',
  tags: ['autodocs'],
  argTypes: {
    layout: { control: 'select', options: ['full', 'panel', 'floating', 'inline'] },
    mode: { control: 'select', options: ['chat', 'research', 'build', 'create'] },
    privateMode: { control: 'boolean' },
    streaming: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Full: Story = {
  args: { layout: 'full', mode: 'chat' },
  render: args =>
    html` <div style="width:700px;height:500px">
      <loquix-chat-container
        layout=${args.layout}
        mode=${args.mode}
        ?private-mode=${args.privateMode}
        ?streaming=${args.streaming}
      >
        <loquix-chat-header slot="header" agent-name="Claude"></loquix-chat-header>
        <loquix-message-list slot="messages">
          <loquix-message-item sender="assistant" status="complete" model="Claude 3.5">
            <p>Hello! How can I help you today?</p>
          </loquix-message-item>
        </loquix-message-list>
        <loquix-chat-composer
          slot="composer"
          variant="contained"
          placeholder="Ask me anything..."
        ></loquix-chat-composer>
      </loquix-chat-container>
    </div>`,
};

export const Panel: Story = {
  args: { layout: 'panel', mode: 'chat' },
  render: args =>
    html` <div style="width:380px;height:600px">
      <loquix-chat-container layout=${args.layout} mode=${args.mode}>
        <loquix-chat-header slot="header" agent-name="Assistant"></loquix-chat-header>
        <loquix-message-list slot="messages">
          <loquix-message-item sender="user" status="complete"><p>Hi!</p></loquix-message-item>
          <loquix-message-item sender="assistant" status="complete"
            ><p>Hello! I'm a panel chat.</p></loquix-message-item
          >
        </loquix-message-list>
        <loquix-chat-composer slot="composer" variant="contained"></loquix-chat-composer>
      </loquix-chat-container>
    </div>`,
};

export const Floating: Story = {
  args: { layout: 'floating', mode: 'chat' },
  render: args =>
    html` <div style="width:360px;height:480px">
      <loquix-chat-container layout=${args.layout} mode=${args.mode}>
        <loquix-chat-header slot="header" agent-name="Help"></loquix-chat-header>
        <loquix-message-list slot="messages">
          <loquix-message-item sender="assistant" status="complete"
            ><p>Need help?</p></loquix-message-item
          >
        </loquix-message-list>
        <loquix-chat-composer slot="composer" variant="contained"></loquix-chat-composer>
      </loquix-chat-container>
    </div>`,
};

export const StreamingState: Story = {
  args: { layout: 'full', mode: 'chat', streaming: true },
  render: args =>
    html` <div style="width:700px;height:500px">
      <loquix-chat-container layout=${args.layout} mode=${args.mode} ?streaming=${args.streaming}>
        <loquix-chat-header slot="header" agent-name="Claude"></loquix-chat-header>
        <loquix-message-list slot="messages">
          <loquix-message-item sender="user" status="complete"
            ><p>Tell me about web components</p></loquix-message-item
          >
          <loquix-message-item sender="assistant" status="streaming" model="Claude 3.5">
            <p>Web components are a set of web platform APIs...</p>
          </loquix-message-item>
        </loquix-message-list>
        <loquix-chat-composer slot="composer" variant="contained" streaming></loquix-chat-composer>
      </loquix-chat-container>
    </div>`,
};
