import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/ReasoningBlock',
  component: 'loquix-reasoning-block',
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'select', options: ['thinking', 'done'] },
    duration: { control: { type: 'number', min: 0 } },
    tokens: { control: { type: 'number', min: 0 } },
    preview: { control: 'text' },
    content: { control: 'text' },
    defaultOpen: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

const sampleContent = `Their corpus (5M documents) rules out naive in-memory approaches. With a 200ms latency budget, cross-encoder reranking on the full candidate set won't fit — cap rerank to top-20.

For retrieval, hybrid (BM25 + dense) is the safe default. Pure dense underperforms on rare entity queries; pure BM25 misses paraphrases.`;

export const Thinking: Story = {
  args: {
    status: 'thinking',
    defaultOpen: true,
    content: 'The user is asking about RAG architecture. I should consider…',
  },
  render: args => html`
    <div style="max-width:540px">
      <loquix-reasoning-block
        status=${args.status}
        ?default-open=${args.defaultOpen}
        content=${args.content}
      ></loquix-reasoning-block>
    </div>
  `,
};

export const Done: Story = {
  args: {
    status: 'done',
    duration: 6,
    tokens: 284,
    defaultOpen: true,
    content: sampleContent,
  },
  render: args => html`
    <div style="max-width:540px">
      <loquix-reasoning-block
        status=${args.status}
        duration=${args.duration}
        tokens=${args.tokens}
        ?default-open=${args.defaultOpen}
        content=${args.content}
      ></loquix-reasoning-block>
    </div>
  `,
};

export const CollapsedDefault: Story = {
  args: {
    status: 'done',
    duration: 47,
    tokens: 1820,
    preview: 'Reasoning collapsed by default — click to expand',
  },
  render: args => html`
    <div style="max-width:540px">
      <loquix-reasoning-block
        status=${args.status}
        duration=${args.duration}
        tokens=${args.tokens}
        preview=${args.preview}
      ></loquix-reasoning-block>
    </div>
  `,
};

export const WithSlot: Story = {
  render: () => html`
    <div style="max-width:540px">
      <loquix-reasoning-block status="done" duration="8" default-open>
        <strong>Slot content wins</strong> — you can pass a richer body via the default slot when
        plain text isn't enough.
      </loquix-reasoning-block>
    </div>
  `,
};
