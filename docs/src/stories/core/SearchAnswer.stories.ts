import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { SearchAnswerState, Source, SearchResult, SearchSource } from '@loquix/core';

const meta: Meta = {
  title: 'Core/SearchAnswer',
  component: 'loquix-search-answer',
  tags: ['autodocs'],
  argTypes: {
    heading: { control: 'text' },
    content: { control: 'text' },
    model: { control: 'text' },
    generatedIn: { control: 'text' },
    state: { control: 'select', options: ['complete', 'generating'] },
    showCopy: { control: 'boolean' },
    showRegenerate: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

const citedSources: Source[] = [
  {
    id: 'docs-refund',
    title: 'Refund Policy',
    url: 'https://docs.example.com/policies/refunds',
    host: 'docs.example.com',
    snippet: 'Customers can request a refund within 30 days unless the plan has custom terms.',
  },
  {
    id: 'notion-refund',
    title: 'Refund process - internal guide',
    url: 'https://team.notion.so/refund-process',
    host: 'team.notion.so',
    snippet: 'Support should confirm eligibility and route exceptions to billing operations.',
  },
];

const sourceFilters: SearchSource[] = [
  { id: 'docs', name: 'Docs', icon: 'D', status: 'done', count: 5 },
  { id: 'notion', name: 'Notion', icon: 'N', status: 'done', count: 4 },
  { id: 'slack', name: 'Slack', icon: '#', status: 'done', count: 8 },
  { id: 'web', name: 'Web', icon: 'W', status: 'done', count: 7 },
];

const results: SearchResult[] = [
  {
    id: 'docs-1',
    rank: 1,
    source: sourceFilters[0],
    title: 'Refund Policy',
    url: 'https://docs.example.com/policies/refunds',
    displayUrl: 'docs.example.com/policies/refunds',
    snippet: 'Customers can request refunds within 30 days of purchase.',
    citationRef: 1,
  },
  {
    id: 'notion-1',
    rank: 2,
    source: sourceFilters[1],
    title: 'Refund process - internal guide',
    url: 'https://team.notion.so/refund-process',
    displayUrl: 'team.notion.so/refund-process',
    snippet: 'Escalate refund exceptions to billing operations.',
    citationRef: 2,
  },
];

function makeAnswer(
  options: {
    content?: string;
    model?: string;
    generatedIn?: string;
    state?: SearchAnswerState;
    sources?: Source[];
    showCopy?: boolean;
    showRegenerate?: boolean;
  } = {},
) {
  const el = document.createElement('loquix-search-answer');
  el.setAttribute(
    'content',
    options.content ??
      'Refunds are generally available within 30 days. Exceptions should be routed to billing operations.',
  );
  if (options.model) el.setAttribute('model', options.model);
  if (options.generatedIn) el.setAttribute('generated-in', options.generatedIn);
  if (options.state) el.setAttribute('state', options.state);
  if (options.showCopy === false) (el as unknown as { showCopy: boolean }).showCopy = false;
  if (options.showRegenerate === false) {
    (el as unknown as { showRegenerate: boolean }).showRegenerate = false;
  }
  (el as unknown as { sources: Source[] }).sources = options.sources ?? citedSources;
  return el;
}

function makeSources(sources: SearchSource[]) {
  const el = document.createElement('loquix-search-sources');
  (el as unknown as { sources: SearchSource[] }).sources = sources;
  el.setAttribute('variant', 'filters');
  return el;
}

function makeResults(items: SearchResult[]) {
  const el = document.createElement('loquix-search-results');
  (el as unknown as { results: SearchResult[] }).results = items;
  return el;
}

export const Default: Story = {
  args: {
    content:
      'Refunds are generally available within 30 days. Exceptions should be routed to billing operations.',
    model: 'GPT-4 Turbo',
    generatedIn: '1.8s',
    showCopy: true,
    showRegenerate: true,
  },
  render: args => html`
    <div style="width:620px">
      ${makeAnswer({
        content: args.content,
        model: args.model,
        generatedIn: args.generatedIn,
        showCopy: args.showCopy,
        showRegenerate: args.showRegenerate,
      })}
    </div>
  `,
};

export const InlineCitations: Story = {
  render: () => html`
    <div style="width:620px">
      <loquix-search-answer model="GPT-4 Turbo" generated-in="1.8s" .sources=${citedSources}>
        <p>
          Refunds are generally available within 30 days
          <loquix-citation-popover .index=${1} .source=${citedSources[0]}></loquix-citation-popover
          >. Exceptions should be routed to billing operations
          <loquix-citation-popover .index=${2} .source=${citedSources[1]}></loquix-citation-popover
          >.
        </p>
      </loquix-search-answer>
    </div>
  `,
};

export const Generating: Story = {
  render: () => html`
    <div style="width:620px">
      <loquix-search-answer state="generating" model="GPT-4 Turbo"></loquix-search-answer>
    </div>
  `,
};

export const SmartSearchStack: Story = {
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:12px;width:660px">
      <loquix-search-input mode="smart" value="What's our refund policy?"></loquix-search-input>
      ${makeSources(sourceFilters)} ${makeAnswer({ model: 'GPT-4 Turbo', generatedIn: '1.8s' })}
      ${makeResults(results)}
    </div>
  `,
};
