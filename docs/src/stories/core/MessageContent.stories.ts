import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/MessageContent',
  component: 'loquix-message-content',
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'code', 'image', 'file', 'tool-result'] },
    streaming: { control: 'boolean' },
    streamingCursor: { control: 'select', options: ['none', 'caret', 'block'] },
  },
};
export default meta;

type Story = StoryObj;

export const TextContent: Story = {
  render: () => html` <loquix-message-content type="text">
    <p>
      Here is a response from the AI assistant. It can contain
      <strong>rich text</strong> formatting.
    </p>
  </loquix-message-content>`,
};

export const CodeContent: Story = {
  render: () => html` <loquix-message-content
    type="code"
    .code=${'function greet(name) {\n  return `Hello, ${name}!`;\n}'}
  >
  </loquix-message-content>`,
};

export const Streaming: Story = {
  render: () => html` <loquix-message-content type="text" streaming>
    <p>This content is currently being streamed — no cursor by default.</p>
  </loquix-message-content>`,
};

export const StreamingCaret: Story = {
  render: () => html` <loquix-message-content type="text" streaming streaming-cursor="caret">
    <p>Streaming with a thin blinking caret cursor...</p>
  </loquix-message-content>`,
};

export const StreamingBlock: Story = {
  render: () => html` <loquix-message-content type="text" streaming streaming-cursor="block">
    <p>Streaming with a pulsing block cursor (ChatGPT-style)...</p>
  </loquix-message-content>`,
};
