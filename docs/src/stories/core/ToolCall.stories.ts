import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/ToolCall',
  component: 'loquix-tool-call',
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    status: { control: 'select', options: ['pending', 'running', 'success', 'error'] },
    duration: { control: { type: 'number', min: 0 } },
    defaultOpen: { control: 'boolean' },
    compact: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

const sampleArgs = { query: 'hybrid retrieval BM25 dense embeddings', max_results: 5 };
const sampleResult = `Found 5 results:
1. arxiv.org/abs/2104.05740 — Hybrid retrieval combining BM25 and dense vectors
2. pinecone.io/learn/hybrid-search — BM25 + Vector Embeddings
3. cohere.com/blog/rerank — Why your RAG system needs a reranker`;

export const Running: Story = {
  args: { name: 'web_search', status: 'running', defaultOpen: true },
  render: args => {
    const el = document.createElement('loquix-tool-call');
    el.setAttribute('name', args.name);
    el.setAttribute('status', args.status);
    if (args.defaultOpen) el.setAttribute('default-open', '');
    (el as unknown as { args?: Record<string, unknown> }).args = sampleArgs;
    return html`<div style="max-width:560px">${el}</div>`;
  },
};

export const Success: Story = {
  args: { name: 'web_search', status: 'success', duration: 1240, defaultOpen: true },
  render: args => {
    const el = document.createElement('loquix-tool-call');
    el.setAttribute('name', args.name);
    el.setAttribute('status', args.status);
    el.setAttribute('duration', String(args.duration));
    if (args.defaultOpen) el.setAttribute('default-open', '');
    (el as unknown as { args?: Record<string, unknown> }).args = sampleArgs;
    (el as unknown as { result?: string }).result = sampleResult;
    return html`<div style="max-width:560px">${el}</div>`;
  },
};

export const ErrorState: Story = {
  args: { name: 'execute_sql', status: 'error', defaultOpen: true },
  render: args => {
    const el = document.createElement('loquix-tool-call');
    el.setAttribute('name', args.name);
    el.setAttribute('status', args.status);
    if (args.defaultOpen) el.setAttribute('default-open', '');
    (el as unknown as { args?: Record<string, unknown> }).args = {
      query: 'SELECT * FROM users WHERE created_at > NOW() - INTERVAL 7 DAY',
    };
    (el as unknown as { error?: string }).error =
      `ERROR:  syntax error at or near "DAY"\nHINT:  Did you mean "INTERVAL '7 days'"?`;
    return html`<div style="max-width:560px">${el}</div>`;
  },
};

export const Pending: Story = {
  args: { name: 'read_file', status: 'pending' },
  render: args => {
    const el = document.createElement('loquix-tool-call');
    el.setAttribute('name', args.name);
    el.setAttribute('status', args.status);
    (el as unknown as { args?: Record<string, unknown> }).args = {
      path: 'src/retrieval/hybrid.py',
    };
    return html`<div style="max-width:560px">${el}</div>`;
  },
};

export const Compact: Story = {
  args: { name: 'fetch_url', status: 'success', duration: 620, compact: true, defaultOpen: false },
  render: args => {
    const el = document.createElement('loquix-tool-call');
    el.setAttribute('name', args.name);
    el.setAttribute('status', args.status);
    el.setAttribute('duration', String(args.duration));
    if (args.compact) el.setAttribute('compact', '');
    (el as unknown as { args?: Record<string, unknown> }).args = {
      url: 'https://arxiv.org/abs/2104.05740',
    };
    (el as unknown as { result?: string }).result = 'Retrieved 8.4kb of HTML';
    return html`<div style="max-width:560px">${el}</div>`;
  },
};
