import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/ToolCallList',
  component: 'loquix-tool-call-list',
  tags: ['autodocs'],
  argTypes: {
    summary: { control: 'text' },
    defaultCollapsed: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

function makeToolCall(
  name: string,
  status: string,
  args: Record<string, unknown>,
  result: string,
  durationMs?: number,
) {
  const el = document.createElement('loquix-tool-call');
  el.setAttribute('name', name);
  el.setAttribute('status', status);
  if (durationMs != null) el.setAttribute('duration', String(durationMs));
  (el as unknown as { args?: Record<string, unknown> }).args = args;
  (el as unknown as { result?: string }).result = result;
  return el;
}

export const Default: Story = {
  render: () => {
    const list = document.createElement('loquix-tool-call-list');
    list.append(
      makeToolCall(
        'web_search',
        'success',
        { query: 'RAG production architectures' },
        '5 results returned',
        1240,
      ),
      makeToolCall(
        'web_search',
        'success',
        { query: 'vector database benchmarks 2025' },
        '7 results returned',
        980,
      ),
      makeToolCall(
        'fetch_url',
        'success',
        { url: 'https://arxiv.org/abs/2104.05740' },
        'Retrieved 8.4kb of HTML',
        620,
      ),
      makeToolCall(
        'summarize',
        'success',
        { documents: 3, target_tokens: 500 },
        'Summary generated (487 tokens)',
        2100,
      ),
    );
    return html`<div style="max-width:680px">${list}</div>`;
  },
};

export const CollapsedDefault: Story = {
  render: () => {
    const list = document.createElement('loquix-tool-call-list');
    list.setAttribute('default-collapsed', '');
    list.append(
      makeToolCall('web_search', 'success', { query: 'q' }, 'ok', 100),
      makeToolCall('web_search', 'success', { query: 'q' }, 'ok', 100),
    );
    return html`<div style="max-width:680px">${list}</div>`;
  },
};

export const WithSummary: Story = {
  render: () => {
    const list = document.createElement('loquix-tool-call-list');
    list.setAttribute('summary', 'Used 4 tools · 2.3s');
    list.append(
      makeToolCall('web_search', 'success', { query: 'q' }, 'ok', 1240),
      makeToolCall('web_search', 'success', { query: 'q' }, 'ok', 980),
    );
    return html`<div style="max-width:680px">${list}</div>`;
  },
};
