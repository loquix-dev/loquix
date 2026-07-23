import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import type { SearchResult, SearchShortcut, SearchSource, Source, Suggestion } from '@loquix/core';

const meta: Meta = {
  title: 'Core/SearchPanel',
  component: 'loquix-search-panel',
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    value: { control: 'text' },
    mode: { control: 'select', options: ['plain', 'smart', 'auto'] },
    variant: { control: 'select', options: ['detached', 'integrated'] },
    state: { control: 'select', options: ['idle', 'searching'] },
    placeholder: { control: 'text' },
    heading: { control: 'text' },
    answerContent: { control: 'text' },
    model: { control: 'text' },
    generatedIn: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj;

const sources: SearchSource[] = [
  { id: 'docs', name: 'Docs', icon: 'D', status: 'done', count: 5, duration: '240ms' },
  { id: 'notion', name: 'Notion', icon: 'N', status: 'done', count: 4, duration: '510ms' },
  { id: 'slack', name: 'Slack', icon: '#', status: 'done', count: 8, duration: '380ms' },
  { id: 'web', name: 'Web', icon: 'W', status: 'done', count: 7, duration: '1.1s' },
];

const searchingSources: SearchSource[] = [
  { id: 'docs', name: 'Docs', icon: 'D', status: 'done', count: 5 },
  { id: 'notion', name: 'Notion', icon: 'N', status: 'running', count: 2 },
  { id: 'slack', name: 'Slack', icon: '#', status: 'running' },
  { id: 'web', name: 'Web', icon: 'W', status: 'idle' },
];

const answerSources: Source[] = [
  {
    id: 'docs-refunds',
    title: 'Refund Policy',
    url: 'https://docs.example.com/policies/refunds',
    host: 'docs.example.com',
    snippet: 'Customers can request a refund within 30 days of purchase.',
  },
  {
    id: 'notion-refunds',
    title: 'Refund process - internal guide',
    url: 'https://team.notion.so/refund-process',
    host: 'team.notion.so',
    snippet: 'Support confirms eligibility and routes exceptions to billing operations.',
  },
];

const results: SearchResult[] = [
  {
    id: 'docs-refunds',
    rank: 1,
    source: sources[0],
    title: 'Refund Policy',
    url: 'https://docs.example.com/policies/refunds',
    displayUrl: 'docs.example.com/policies/refunds',
    meta: 'updated 3 weeks ago',
    snippet:
      'Customers can request a refund within 30 days of purchase. Refunds are processed back to the original payment method within 5-7 business days.',
    citationRef: 1,
  },
  {
    id: 'notion-refunds',
    rank: 2,
    source: sources[1],
    title: 'Refund process - internal guide',
    url: 'https://team.notion.so/refund-process',
    displayUrl: 'team.notion.so/refund-process',
    meta: 'edited yesterday by Anna',
    snippet:
      'Support agents should confirm order eligibility, note the reason in the CRM, and route refund exceptions to billing operations.',
    citationRef: 2,
  },
  {
    id: 'slack-refunds',
    rank: 3,
    source: sources[2],
    title: '#help-customers - How long do refunds take?',
    url: 'https://slack.com/help-customers/p173',
    displayUrl: 'slack.com/help-customers/p173',
    meta: 'thread - 3 days ago',
    snippet:
      'Customer asking why a refund is not showing yet. The standard support response says 5-7 business days is normal.',
  },
];

const shortcuts: SearchShortcut[] = [
  { key: 'Enter', label: 'Search' },
  { key: 'Cmd Enter', label: 'Ask AI' },
  { key: 'Esc', label: 'Close' },
];

const querySuggestions: Suggestion[] = [
  { id: 'refunds', text: "What's our refund policy?" },
  { id: 'exceptions', text: 'Show refund exceptions' },
  { id: 'billing', text: 'Who approves billing exceptions?' },
  { id: 'timeline', text: 'How long do refunds take?' },
];

type SearchPanelDemo = HTMLElement & {
  value: string;
  state: 'idle' | 'searching';
  answerState: 'complete' | 'generating';
  sources: SearchSource[];
  answerSources: Source[];
  answerContent: string;
  results: SearchResult[];
  shortcuts: SearchShortcut[];
  activeSource: string;
  runningTotal?: number;
};

const answerContent =
  'Refunds are generally available within 30 days. Standard refunds return to the original payment method within 5-7 business days. Exceptions should be routed to billing operations.';

function filterResults(sourceId = 'all') {
  if (sourceId === 'all') return results;
  return results.filter(result => result.source?.id === sourceId);
}

function wirePanel(el: Element | undefined) {
  const panel = el as SearchPanelDemo | undefined;
  if (!panel || (panel as SearchPanelDemo & { __wired?: boolean }).__wired) return;
  (panel as SearchPanelDemo & { __wired?: boolean }).__wired = true;

  function showDone(sourceId = 'all') {
    panel.state = 'idle';
    panel.answerState = 'complete';
    panel.sources = sources;
    panel.answerSources = answerSources;
    panel.answerContent = answerContent;
    panel.results = filterResults(sourceId);
    panel.activeSource = sourceId;
    panel.runningTotal = undefined;
  }

  function showSearching(query: string) {
    panel.value = query;
    panel.state = 'searching';
    panel.answerState = 'generating';
    panel.sources = searchingSources;
    panel.answerContent = '';
    panel.answerSources = [];
    panel.results = [];
    panel.activeSource = 'all';
    panel.runningTotal = 7;
    window.setTimeout(() => showDone('all'), 900);
  }

  panel.addEventListener('loquix-search-ask', ((event: CustomEvent<{ query: string }>) => {
    showSearching(event.detail.query);
  }) as EventListener);

  panel.addEventListener('loquix-search-submit', ((event: CustomEvent<{ query: string }>) => {
    showSearching(event.detail.query);
  }) as EventListener);

  panel.addEventListener('loquix-search-source-select', ((
    event: CustomEvent<{ sourceId: string }>,
  ) => {
    showDone(event.detail.sourceId);
  }) as EventListener);

  panel.shortcuts = shortcuts;
  showDone('all');
}

function wirePreSearchPanel(el: Element | undefined) {
  const panel = el as SearchPanelDemo | undefined;
  if (!panel || (panel as SearchPanelDemo & { __wired?: boolean }).__wired) return;
  (panel as SearchPanelDemo & { __wired?: boolean }).__wired = true;

  panel.shortcuts = [
    { key: 'Enter', label: 'Search' },
    { key: 'Cmd Enter', label: 'Ask AI' },
    { key: 'Esc', label: 'Close' },
  ];

  panel.addEventListener('loquix-suggestion-select', ((
    event: CustomEvent<{ suggestion: Suggestion }>,
  ) => {
    panel.value = event.detail.suggestion.text;
  }) as EventListener);
}

export const Default: Story = {
  args: {
    open: true,
    value: "What's our refund policy?",
    mode: 'auto',
    variant: 'detached',
    heading: 'Search knowledge',
    model: 'GPT-4 Turbo',
    generatedIn: '1.8s',
  },
  render: args => html`
    <div style="width:620px;min-height:720px;padding-top:24px">
      <loquix-search-panel
        ${ref(wirePanel)}
        ?open=${args.open}
        value=${args.value}
        mode=${args.mode}
        variant=${args.variant}
        heading=${args.heading}
        model=${args.model}
        generated-in=${args.generatedIn}
        kbd="Cmd K"
      ></loquix-search-panel>
    </div>
  `,
};

export const Closed: Story = {
  render: () => html`
    <div style="width:620px;min-height:260px;padding-top:24px">
      <loquix-search-panel
        ${ref(wirePanel)}
        value="What's our refund policy?"
        heading="Search knowledge"
        model="GPT-4 Turbo"
        generated-in="1.8s"
        kbd="Cmd K"
      ></loquix-search-panel>
    </div>
  `,
};

export const BeforeSearch: Story = {
  render: () => html`
    <div style="width:620px;min-height:520px;padding-top:32px">
      <loquix-search-panel
        ${ref(wirePreSearchPanel)}
        open
        variant="integrated"
        placeholder="Search or ask anything..."
        heading="Search knowledge"
        kbd="Cmd K"
      >
        <loquix-suggestion-chips
          slot="suggestions"
          variant="pill"
          .suggestions=${querySuggestions}
        ></loquix-suggestion-chips>
      </loquix-search-panel>
    </div>
  `,
};

export const Integrated: Story = {
  render: () => html`
    <div style="width:620px;min-height:720px;padding-top:32px">
      <loquix-search-panel
        ${ref(wirePanel)}
        open
        variant="integrated"
        value="What's our refund policy?"
        heading="Search knowledge"
        model="GPT-4 Turbo"
        generated-in="1.8s"
        kbd="Cmd K"
      ></loquix-search-panel>
    </div>
  `,
};

export const Searching: Story = {
  render: () => {
    function setup(el: Element | undefined) {
      wirePanel(el);
      const panel = el as SearchPanelDemo | undefined;
      if (!panel) return;
      panel.state = 'searching';
      panel.answerState = 'generating';
      panel.sources = searchingSources;
      panel.answerContent = '';
      panel.answerSources = [];
      panel.results = [];
      panel.runningTotal = 7;
    }

    return html`
      <div style="width:620px;min-height:720px;padding-top:24px">
        <loquix-search-panel
          ${ref(setup)}
          open
          value="refund workflow"
          heading="Search knowledge"
          model="GPT-4 Turbo"
          kbd="Cmd K"
        ></loquix-search-panel>
      </div>
    `;
  },
};
