import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import type {
  SearchAnswerState,
  SearchResult,
  SearchShortcut,
  SearchSource,
  Source,
} from '@loquix/core';

const meta: Meta = {
  title: 'Core/SearchDialog',
  component: 'loquix-search-dialog',
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    mode: { control: 'select', options: ['plain', 'smart', 'auto'] },
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

type SearchDialogDemo = HTMLElement & {
  value: string;
  state: 'idle' | 'searching';
  answerState: SearchAnswerState;
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

function wireDialog(el: Element | undefined) {
  const dialog = el as SearchDialogDemo | undefined;
  if (!dialog || (dialog as SearchDialogDemo & { __wired?: boolean }).__wired) return;
  (dialog as SearchDialogDemo & { __wired?: boolean }).__wired = true;

  function showDone(sourceId = 'all') {
    dialog.state = 'idle';
    dialog.answerState = 'complete';
    dialog.sources = sources;
    dialog.answerSources = answerSources;
    dialog.answerContent = answerContent;
    dialog.results = filterResults(sourceId);
    dialog.activeSource = sourceId;
    dialog.runningTotal = undefined;
  }

  function showSearching(query: string) {
    dialog.value = query;
    dialog.state = 'searching';
    dialog.answerState = 'generating';
    dialog.sources = searchingSources;
    dialog.answerContent = '';
    dialog.answerSources = [];
    dialog.results = [];
    dialog.activeSource = 'all';
    dialog.runningTotal = 7;
    window.setTimeout(() => showDone('all'), 900);
  }

  dialog.addEventListener('loquix-search-ask', ((event: CustomEvent<{ query: string }>) => {
    showSearching(event.detail.query);
  }) as EventListener);

  dialog.addEventListener('loquix-search-submit', ((event: CustomEvent<{ query: string }>) => {
    showSearching(event.detail.query);
  }) as EventListener);

  dialog.addEventListener('loquix-search-source-select', ((
    event: CustomEvent<{ sourceId: string }>,
  ) => {
    showDone(event.detail.sourceId);
  }) as EventListener);

  dialog.shortcuts = shortcuts;
  showDone('all');
}

export const Default: Story = {
  args: {
    value: "What's our refund policy?",
    mode: 'auto',
    heading: 'Search knowledge',
    model: 'GPT-4 Turbo',
    generatedIn: '1.8s',
  },
  render: args => html`
    <div style="width:560px">
      <loquix-search-dialog
        ${ref(wireDialog)}
        value=${args.value}
        mode=${args.mode}
        heading=${args.heading}
        model=${args.model}
        generated-in=${args.generatedIn}
        kbd="Cmd K"
      ></loquix-search-dialog>
    </div>
  `,
};

export const EmptyTrigger: Story = {
  render: () => html`
    <div style="width:560px">
      <loquix-search-dialog
        ${ref(wireDialog)}
        heading="Search workspace"
        placeholder="Search or ask anything..."
        model="GPT-4 Turbo"
        generated-in="1.8s"
        kbd="Cmd K"
      ></loquix-search-dialog>
    </div>
  `,
};

export const Open: Story = {
  render: () => {
    function openAfterRender(el: Element | undefined) {
      wireDialog(el);
      (el as (SearchDialogDemo & { show(): void }) | undefined)?.show();
    }

    return html`
      <div style="width:560px">
        <loquix-search-dialog
          ${ref(openAfterRender)}
          value="What's our refund policy?"
          heading="Search knowledge"
          model="GPT-4 Turbo"
          generated-in="1.8s"
          kbd="Cmd K"
        ></loquix-search-dialog>
      </div>
    `;
  },
};
