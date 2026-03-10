import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { Attachment } from '@loquix/core';

const meta: Meta = {
  title: 'Core/MessageItem',
  component: 'loquix-message-item',
  tags: ['autodocs'],
  argTypes: {
    sender: { control: 'select', options: ['user', 'assistant', 'system', 'tool'] },
    status: { control: 'select', options: ['streaming', 'complete', 'error', 'pending'] },
    model: { control: 'text' },
    timestamp: { control: 'text' },
    privateMode: { control: 'boolean' },
    showAvatar: { control: 'boolean' },
    avatarSize: { control: 'select', options: ['sm', 'md', 'lg'] },
    actionsPosition: {
      control: 'select',
      options: ['bottom-start', 'bottom-end', 'inline-start', 'inline-end'],
    },
  },
};
export default meta;

type Story = StoryObj;

export const AssistantMessage: Story = {
  args: { sender: 'assistant', status: 'complete', model: 'Claude 3.5', timestamp: '2:34 PM' },
  render: args =>
    html` <div style="width:600px">
      <loquix-message-item
        sender=${args.sender}
        status=${args.status}
        model=${args.model}
        timestamp=${args.timestamp}
      >
        <p>
          Here is a helpful response from the AI assistant. It can include multiple paragraphs and
          formatting.
        </p>
      </loquix-message-item>
    </div>`,
};

export const UserMessage: Story = {
  args: { sender: 'user', status: 'complete' },
  render: args =>
    html` <div style="width:600px">
      <loquix-message-item sender=${args.sender} status=${args.status}>
        <p>Can you help me with a coding question?</p>
      </loquix-message-item>
    </div>`,
};

export const StreamingMessage: Story = {
  args: { sender: 'assistant', status: 'streaming', model: 'Claude 3.5' },
  render: args =>
    html` <div style="width:600px">
      <loquix-message-item sender=${args.sender} status=${args.status} model=${args.model}>
        <p>This response is currently being generated...</p>
      </loquix-message-item>
    </div>`,
};

export const ErrorMessage: Story = {
  args: { sender: 'assistant', status: 'error', model: 'Claude 3.5' },
  render: args =>
    html` <div style="width:600px">
      <loquix-message-item sender=${args.sender} status=${args.status} model=${args.model}>
        <p>Something went wrong while generating this response.</p>
      </loquix-message-item>
    </div>`,
};

export const PendingMessage: Story = {
  args: { sender: 'assistant', status: 'pending' },
  render: args =>
    html` <div style="width:600px">
      <loquix-message-item sender=${args.sender} status=${args.status}></loquix-message-item>
    </div>`,
};

export const PrivateMode: Story = {
  args: { sender: 'assistant', status: 'complete', model: 'Claude 3.5', privateMode: true },
  render: args =>
    html` <div style="width:600px">
      <loquix-message-item
        sender=${args.sender}
        status=${args.status}
        model=${args.model}
        ?private-mode=${args.privateMode}
      >
        <p>Model info is hidden in private mode.</p>
      </loquix-message-item>
    </div>`,
};

export const WithAvatar: Story = {
  render: () =>
    html` <div style="width:600px;display:flex;flex-direction:column;gap:8px">
      <loquix-message-item sender="assistant" status="complete" show-avatar>
        <p>Message with default avatar (sm).</p>
      </loquix-message-item>
      <loquix-message-item sender="user" status="complete" show-avatar>
        <p>User message with avatar.</p>
      </loquix-message-item>
      <loquix-message-item sender="assistant" status="complete" show-avatar avatar-size="md">
        <p>Message with medium avatar.</p>
      </loquix-message-item>
      <loquix-message-item sender="assistant" status="complete" show-avatar avatar-size="lg">
        <p>Message with large avatar.</p>
      </loquix-message-item>
    </div>`,
};

export const WithCustomAvatar: Story = {
  render: () =>
    html` <div style="width:600px">
      <loquix-message-item
        sender="assistant"
        status="complete"
        show-avatar
        model="Claude 3.5"
        timestamp="3:15 PM"
      >
        <loquix-message-avatar
          slot="avatar"
          variant="initials"
          name="AI"
          size="md"
        ></loquix-message-avatar>
        <p>A message with a custom avatar in the slot.</p>
      </loquix-message-item>
    </div>`,
};

const sampleAttachments: Attachment[] = [
  {
    id: '1',
    filename: 'quarterly-report.pdf',
    filetype: 'application/pdf',
    size: 3200000,
    status: 'complete',
    url: 'https://example.com/report.pdf',
  },
  {
    id: '2',
    filename: 'screenshot.png',
    filetype: 'image/png',
    size: 1500000,
    status: 'complete',
    url: 'https://picsum.photos/seed/screen/400/300',
  },
  { id: '3', filename: 'data.csv', filetype: 'csv', size: 50000, status: 'complete' },
];

export const WithAttachments: Story = {
  render: () =>
    html` <div style="width:600px;display:flex;flex-direction:column;gap:8px">
      <loquix-message-item
        sender="assistant"
        status="complete"
        model="Claude 3.5"
        timestamp="3:42 PM"
      >
        <p>Here are the files you requested.</p>
        <loquix-message-attachments
          size="md"
          .attachments=${sampleAttachments}
        ></loquix-message-attachments>
      </loquix-message-item>
      <loquix-message-item sender="user" status="complete">
        <p>Take a look at these screenshots.</p>
        <loquix-message-attachments
          size="lg"
          .attachments=${[sampleAttachments[1]]}
        ></loquix-message-attachments>
      </loquix-message-item>
    </div>`,
};

const imageAttachments: Attachment[] = [
  {
    id: 'img-1',
    filename: 'hero-banner.jpg',
    filetype: 'image/jpeg',
    size: 2400000,
    status: 'complete',
    url: 'https://picsum.photos/seed/hero/400/300',
  },
  {
    id: 'img-2',
    filename: 'product-shot.png',
    filetype: 'image/png',
    size: 1800000,
    status: 'complete',
    url: 'https://picsum.photos/seed/product/400/300',
  },
];

export const AttachmentPositions: Story = {
  render: () =>
    html` <div style="width:600px;display:flex;flex-direction:column;gap:16px">
      <loquix-message-item sender="assistant" status="complete" model="Claude 3.5">
        <p>Attachments inside bubble (default slot).</p>
        <loquix-message-attachments
          size="md"
          .attachments=${sampleAttachments}
        ></loquix-message-attachments>
      </loquix-message-item>

      <loquix-message-item sender="assistant" status="complete" model="Claude 3.5">
        <p>Text inside bubble, attachments below it.</p>
        <loquix-message-attachments
          slot="below-bubble"
          size="md"
          .attachments=${sampleAttachments}
        ></loquix-message-attachments>
      </loquix-message-item>

      <loquix-message-item sender="user" status="complete">
        <loquix-message-attachments
          slot="above-bubble"
          size="lg"
          .attachments=${imageAttachments}
        ></loquix-message-attachments>
        <p>Images shown above my message.</p>
      </loquix-message-item>
    </div>`,
};
