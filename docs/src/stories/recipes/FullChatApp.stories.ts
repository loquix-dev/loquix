import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Recipes/Full Chat App',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

export const DefaultChat: Story = {
  render: () => html` <div style="width:100%;height:100vh">
    <loquix-chat-container layout="full" mode="chat">
      <loquix-chat-header slot="header" agent-name="Claude" show-model-badge>
        <loquix-message-avatar
          slot="avatar"
          variant="initials"
          name="AI"
          size="sm"
        ></loquix-message-avatar>
      </loquix-chat-header>
      <loquix-message-list slot="messages" auto-scroll>
        <loquix-message-item
          sender="assistant"
          status="complete"
          model="Claude 3.5 Sonnet"
          timestamp="2:30 PM"
        >
          <p>Hello! I'm Claude. How can I help you today?</p>
        </loquix-message-item>
        <loquix-message-item sender="user" status="complete" timestamp="2:31 PM">
          <p>Can you explain how web components work?</p>
        </loquix-message-item>
        <loquix-message-item
          sender="assistant"
          status="complete"
          model="Claude 3.5 Sonnet"
          timestamp="2:31 PM"
        >
          <p>
            Web components are a set of web platform APIs that allow you to create reusable,
            encapsulated HTML elements. They consist of three main technologies:
          </p>
          <ul>
            <li><strong>Custom Elements</strong> — Define new HTML tags with custom behavior</li>
            <li><strong>Shadow DOM</strong> — Encapsulate styles and markup</li>
            <li><strong>HTML Templates</strong> — Declare reusable markup fragments</li>
          </ul>
          <p>They work natively in all modern browsers without any framework dependency.</p>
        </loquix-message-item>
        <loquix-message-item sender="user" status="complete" timestamp="2:32 PM">
          <p>That's helpful! Can you show me a simple example?</p>
        </loquix-message-item>
        <loquix-message-item
          sender="assistant"
          status="complete"
          model="Claude 3.5 Sonnet"
          timestamp="2:32 PM"
        >
          <p>Here's a minimal custom element that greets the user:</p>
          <loquix-message-content
            type="code"
            .code=${'class HelloWorld extends HTMLElement {\n  connectedCallback() {\n    this.innerHTML = `<p>Hello, ${this.getAttribute("name")}!</p>`;\n  }\n}\ncustomElements.define("hello-world", HelloWorld);'}
          ></loquix-message-content>
          <loquix-follow-up-suggestions
            .suggestions=${[
              { id: '1', text: 'How do I add Shadow DOM?' },
              { id: '2', text: 'Show me Lit framework' },
              { id: '3', text: 'What about styling?' },
            ]}
          ></loquix-follow-up-suggestions>
        </loquix-message-item>
      </loquix-message-list>
      <loquix-caveat-notice slot="footer" variant="footer"></loquix-caveat-notice>
      <loquix-chat-composer
        slot="composer"
        variant="contained"
        placeholder="Ask Claude anything..."
      ></loquix-chat-composer>
    </loquix-chat-container>
  </div>`,
};

export const PanelChat: Story = {
  render: () => html` <div
    style="width:400px;height:600px;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden"
  >
    <loquix-chat-container layout="panel" mode="chat">
      <loquix-chat-header slot="header" agent-name="Help Assistant"></loquix-chat-header>
      <loquix-message-list slot="messages">
        <loquix-message-item sender="assistant" status="complete">
          <p>Hi there! Need help with something?</p>
        </loquix-message-item>
      </loquix-message-list>
      <loquix-chat-composer
        slot="composer"
        variant="contained"
        placeholder="Ask a question..."
      ></loquix-chat-composer>
    </loquix-chat-container>
  </div>`,
};

export const StreamingConversation: Story = {
  render: () => html` <div style="width:100%;height:100vh">
    <loquix-chat-container layout="full" mode="chat" streaming>
      <loquix-chat-header slot="header" agent-name="Claude" show-model-badge></loquix-chat-header>
      <loquix-message-list slot="messages">
        <loquix-message-item sender="user" status="complete">
          <p>Write me a short poem about coding</p>
        </loquix-message-item>
        <loquix-message-item sender="assistant" status="streaming" model="Claude 3.5 Sonnet">
          <p>
            In silicon dreams where logic flows,<br />Through loops and branches, beauty grows...
          </p>
        </loquix-message-item>
      </loquix-message-list>
      <loquix-chat-composer slot="composer" variant="contained" streaming></loquix-chat-composer>
    </loquix-chat-container>
  </div>`,
};
