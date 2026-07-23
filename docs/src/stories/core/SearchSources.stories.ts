import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { SearchSource } from '@loquix/core';

const meta: Meta = {
  title: 'Core/SearchSources',
  component: 'loquix-search-sources',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['progress', 'filters'] },
    activeSource: { control: 'text' },
    headline: { control: 'text' },
    runningTotal: { control: 'number' },
    showAll: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

const runningSources: SearchSource[] = [
  { id: 'docs', name: 'Docs', icon: 'D', status: 'done', count: 5 },
  { id: 'notion', name: 'Notion', icon: 'N', status: 'running', count: 2 },
  { id: 'slack', name: 'Slack', icon: '#', status: 'running' },
  { id: 'web', name: 'Web', icon: 'W', status: 'idle' },
];

const completedSources: SearchSource[] = [
  { id: 'docs', name: 'Docs', icon: 'D', status: 'done', count: 5, duration: '240ms' },
  { id: 'notion', name: 'Notion', icon: 'N', status: 'done', count: 4, duration: '510ms' },
  { id: 'slack', name: 'Slack', icon: '#', status: 'done', count: 8, duration: '380ms' },
  { id: 'web', name: 'Web', icon: 'W', status: 'done', count: 7, duration: '1.1s' },
];

const mixedSources: SearchSource[] = [
  { id: 'docs', name: 'Docs', icon: 'D', status: 'done', count: 5 },
  { id: 'notion', name: 'Notion', icon: 'N', status: 'running', count: 2 },
  { id: 'slack', name: 'Slack', icon: '#', status: 'error' },
  { id: 'web', name: 'Web', icon: 'W', status: 'done', count: 0 },
];

function makeSources(
  sources: SearchSource[],
  options: {
    variant?: 'progress' | 'filters';
    activeSource?: string;
    headline?: string;
    runningTotal?: number;
    showAll?: boolean;
  } = {},
) {
  const el = document.createElement('loquix-search-sources');
  (el as unknown as { sources: SearchSource[] }).sources = sources;
  if (options.variant) el.setAttribute('variant', options.variant);
  if (options.activeSource) el.setAttribute('active-source', options.activeSource);
  if (options.headline) el.setAttribute('headline', options.headline);
  if (options.runningTotal != null) el.setAttribute('running-total', String(options.runningTotal));
  if (options.showAll === false) (el as unknown as { showAll: boolean }).showAll = false;
  return el;
}

export const Progress: Story = {
  args: {
    variant: 'progress',
    headline: undefined,
    runningTotal: 7,
  },
  render: args => html`
    <div style="width:520px">
      ${makeSources(runningSources, {
        variant: args.variant,
        headline: args.headline,
        runningTotal: args.runningTotal,
      })}
    </div>
  `,
};

export const Filters: Story = {
  args: {
    variant: 'filters',
    activeSource: 'all',
    showAll: true,
  },
  render: args => html`
    <div style="width:520px">
      ${makeSources(completedSources, {
        variant: args.variant,
        activeSource: args.activeSource,
        showAll: args.showAll,
      })}
    </div>
  `,
};

export const MixedStatuses: Story = {
  render: () => html`<div style="width:520px">${makeSources(mixedSources, { runningTotal: 7 })}</div>`,
};

export const WithSearchInput: Story = {
  render: () => html`
    <div
      style="display:flex;flex-direction:column;gap:12px;width:560px;border:1px solid var(--loquix-border-color);border-radius:12px;padding:12px;background:var(--loquix-surface-bg)"
    >
      <loquix-search-input
        mode="smart"
        state="searching"
        value="What's our refund policy?"
      ></loquix-search-input>
      ${makeSources(runningSources, {
        headline: 'Searching connected sources',
        runningTotal: 7,
      })}
    </div>
  `,
};
