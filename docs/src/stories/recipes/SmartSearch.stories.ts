import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import type { SearchResult, SearchShortcut, SearchSource, Source, Suggestion } from '@loquix/core';

const meta: Meta = {
  title: 'Recipes/Smart Search',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
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

const citedSources: Source[] = [
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
  {
    id: 'docs-exceptions',
    rank: 4,
    source: sources[0],
    title: 'Refund Exceptions',
    url: 'https://docs.example.com/policies/refunds-exceptions',
    displayUrl: 'docs.example.com/policies/refunds-exceptions',
    meta: 'updated 2 months ago',
    snippet:
      'Gift cards, activated downloadable software, and subscriptions past the first 14 days require billing approval.',
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

type SearchInputElement = HTMLElement & {
  value: string;
  state: 'idle' | 'searching';
};

type SearchSourcesElement = HTMLElement & {
  sources: SearchSource[];
  variant: 'progress' | 'filters';
  activeSource: string;
  runningTotal?: number;
};

type SearchAnswerElement = HTMLElement & {
  sources: Source[];
  state: 'complete' | 'generating';
};

type SearchResultsElement = HTMLElement & {
  results: SearchResult[];
};

type SearchFooterElement = HTMLElement & {
  shortcuts: SearchShortcut[];
};

type SearchDialogElement = HTMLElement & {
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

type SearchPanelElement = SearchDialogElement;

type SearchRecipeElement = HTMLElement & {
  __wired?: boolean;
  __timer?: number;
  __activeSource?: string;
};

function filterResults(sourceId = 'all'): SearchResult[] {
  if (sourceId === 'all') return results;
  return results.filter(result => result.source?.id === sourceId);
}

function wireSmartSearch(el: Element | undefined) {
  const root = el as SearchRecipeElement | undefined;
  if (!root || root.__wired) return;
  root.__wired = true;
  root.__activeSource = 'all';

  const input = root.querySelector('loquix-search-input') as SearchInputElement | null;
  const sourceStrip = root.querySelector('loquix-search-sources') as SearchSourcesElement | null;
  const answer = root.querySelector('loquix-search-answer') as SearchAnswerElement | null;
  const resultList = root.querySelector('loquix-search-results') as SearchResultsElement | null;
  const footer = root.querySelector('loquix-search-footer') as SearchFooterElement | null;
  const count = root.querySelector('[data-result-count]');

  if (!input || !sourceStrip || !answer || !resultList || !footer || !count) return;

  function renderDone(sourceId = root.__activeSource ?? 'all') {
    root.dataset.phase = 'done';
    input.state = 'idle';
    sourceStrip.variant = 'filters';
    sourceStrip.sources = sources;
    sourceStrip.activeSource = sourceId;
    sourceStrip.runningTotal = undefined;
    answer.sources = citedSources;
    answer.state = 'complete';
    resultList.results = filterResults(sourceId);
    footer.shortcuts = shortcuts;
    count.textContent = `${filterResults(sourceId).length} results`;
  }

  function renderSearching(query: string) {
    window.clearTimeout(root.__timer);
    root.dataset.phase = 'searching';
    root.__activeSource = 'all';
    input.value = query;
    input.state = 'searching';
    sourceStrip.variant = 'progress';
    sourceStrip.sources = searchingSources;
    sourceStrip.activeSource = 'all';
    sourceStrip.runningTotal = 7;
    answer.state = 'generating';
    resultList.results = [];
    count.textContent = 'Searching';

    root.__timer = window.setTimeout(() => renderDone('all'), 900);
  }

  root.addEventListener('loquix-search-ask', ((event: CustomEvent<{ query: string }>) => {
    renderSearching(event.detail.query);
  }) as EventListener);

  root.addEventListener('loquix-search-submit', ((event: CustomEvent<{ query: string }>) => {
    renderSearching(event.detail.query);
  }) as EventListener);

  root.addEventListener('loquix-search-source-select', ((
    event: CustomEvent<{ sourceId: string }>,
  ) => {
    root.__activeSource = event.detail.sourceId;
    renderDone(event.detail.sourceId);
  }) as EventListener);

  renderDone('all');
}

function wireModalSmartSearch(el: Element | undefined) {
  const dialog = el as (SearchDialogElement & { __wired?: boolean; __timer?: number }) | undefined;
  if (!dialog || dialog.__wired) return;
  dialog.__wired = true;

  function renderDone(sourceId = 'all') {
    dialog.state = 'idle';
    dialog.answerState = 'complete';
    dialog.sources = sources;
    dialog.answerSources = citedSources;
    dialog.answerContent =
      'Refunds are generally available within 30 days. Standard refunds return to the original payment method within 5-7 business days. Exceptions should be sent to billing operations.';
    dialog.results = filterResults(sourceId);
    dialog.activeSource = sourceId;
    dialog.runningTotal = undefined;
  }

  function renderSearching(query: string) {
    window.clearTimeout(dialog.__timer);
    dialog.value = query;
    dialog.state = 'searching';
    dialog.answerState = 'generating';
    dialog.sources = searchingSources;
    dialog.answerSources = [];
    dialog.answerContent = '';
    dialog.results = [];
    dialog.activeSource = 'all';
    dialog.runningTotal = 7;
    dialog.__timer = window.setTimeout(() => renderDone('all'), 900);
  }

  dialog.addEventListener('loquix-search-ask', ((event: CustomEvent<{ query: string }>) => {
    renderSearching(event.detail.query);
  }) as EventListener);

  dialog.addEventListener('loquix-search-submit', ((event: CustomEvent<{ query: string }>) => {
    renderSearching(event.detail.query);
  }) as EventListener);

  dialog.addEventListener('loquix-search-source-select', ((
    event: CustomEvent<{ sourceId: string }>,
  ) => {
    renderDone(event.detail.sourceId);
  }) as EventListener);

  dialog.shortcuts = shortcuts;
  renderDone('all');
}

function wireAnchoredSmartSearch(el: Element | undefined) {
  const panel = el as (SearchPanelElement & { __wired?: boolean; __timer?: number }) | undefined;
  if (!panel || panel.__wired) return;
  panel.__wired = true;

  function renderDone(sourceId = 'all') {
    panel.state = 'idle';
    panel.answerState = 'complete';
    panel.sources = sources;
    panel.answerSources = citedSources;
    panel.answerContent =
      'Refunds are generally available within 30 days. Standard refunds return to the original payment method within 5-7 business days. Exceptions should be sent to billing operations.';
    panel.results = filterResults(sourceId);
    panel.activeSource = sourceId;
    panel.runningTotal = undefined;
  }

  function renderSearching(query: string) {
    window.clearTimeout(panel.__timer);
    panel.value = query;
    panel.state = 'searching';
    panel.answerState = 'generating';
    panel.sources = searchingSources;
    panel.answerSources = [];
    panel.answerContent = '';
    panel.results = [];
    panel.activeSource = 'all';
    panel.runningTotal = 7;
    panel.__timer = window.setTimeout(() => renderDone('all'), 900);
  }

  panel.addEventListener('loquix-search-ask', ((event: CustomEvent<{ query: string }>) => {
    renderSearching(event.detail.query);
  }) as EventListener);

  panel.addEventListener('loquix-search-submit', ((event: CustomEvent<{ query: string }>) => {
    renderSearching(event.detail.query);
  }) as EventListener);

  panel.addEventListener('loquix-search-source-select', ((
    event: CustomEvent<{ sourceId: string }>,
  ) => {
    renderDone(event.detail.sourceId);
  }) as EventListener);

  panel.shortcuts = shortcuts;
  renderDone('all');
}

function wireAnchoredPreSearch(el: Element | undefined) {
  const panel = el as (SearchPanelElement & { __wired?: boolean }) | undefined;
  if (!panel || panel.__wired) return;
  panel.__wired = true;

  panel.shortcuts = shortcuts;

  panel.addEventListener('loquix-suggestion-select', ((
    event: CustomEvent<{ suggestion: Suggestion }>,
  ) => {
    panel.value = event.detail.suggestion.text;
  }) as EventListener);
}

export const KnowledgeSearch: Story = {
  render: () => html`
    <style>
      .smart-search-recipe {
        min-height: 100vh;
        background: var(--loquix-bg-color, #fff);
        color: var(--loquix-text-color, #111827);
        padding: 48px 20px;
        box-sizing: border-box;
      }

      .smart-search-shell {
        width: min(760px, 100%);
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .smart-search-heading {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 16px;
      }

      .smart-search-title {
        margin: 0;
        font: 700 24px/1.25 var(--loquix-font-family, system-ui, sans-serif);
        color: var(--loquix-text-color, #111827);
      }

      .smart-search-count {
        color: var(--loquix-text-secondary-color, #6b7280);
        font: 500 13px/1.4 var(--loquix-font-family, system-ui, sans-serif);
        white-space: nowrap;
      }

      .smart-search-panel {
        border: 1px solid var(--loquix-border-color, #e5e7eb);
        border-radius: 14px;
        background: var(--loquix-surface-bg, #fff);
        box-shadow: 0 18px 48px rgb(17 24 39 / 0.08);
        overflow: hidden;
      }

      .smart-search-query {
        padding: 14px;
      }

      .smart-search-sources {
        padding: 2px 14px 14px;
      }

      .smart-search-content {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 0 14px 14px;
      }

      .smart-search-recipe[data-phase='searching'] .smart-search-answer {
        opacity: 0.42;
      }

      .smart-search-recipe[data-phase='searching'] .smart-search-results {
        display: none;
      }

      .source-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 6px;
        background: var(--loquix-ai-color-subtle, #f3e8ff);
        color: var(--loquix-ai-color, #7c3aed);
        font: 700 11px/1 var(--loquix-font-family, system-ui, sans-serif);
      }

      @media (max-width: 640px) {
        .smart-search-recipe {
          padding: 24px 12px;
        }

        .smart-search-heading {
          align-items: start;
          flex-direction: column;
          gap: 6px;
        }
      }
    </style>

    <div class="smart-search-recipe" ${ref(wireSmartSearch)}>
      <div class="smart-search-shell">
        <div class="smart-search-heading">
          <h1 class="smart-search-title">Support knowledge search</h1>
          <span class="smart-search-count" data-result-count>24 results</span>
        </div>

        <div class="smart-search-panel">
          <div class="smart-search-query">
            <loquix-search-input
              mode="auto"
              value="What's our refund policy?"
              kbd="Cmd Enter"
              show-ask-affordance
            >
              <span slot="prefix" class="source-mark">S</span>
            </loquix-search-input>
          </div>

          <loquix-search-footer .shortcuts=${shortcuts}></loquix-search-footer>
        </div>

        <div class="smart-search-sources">
          <loquix-search-sources
            variant="filters"
            active-source="all"
            .sources=${sources}
          ></loquix-search-sources>
        </div>

        <div class="smart-search-content">
          <div class="smart-search-answer">
            <loquix-search-answer model="GPT-4 Turbo" generated-in="1.8s" .sources=${citedSources}>
              <p>
                Refunds are generally available within 30 days
                <loquix-citation-popover
                  .index=${1}
                  .source=${citedSources[0]}
                ></loquix-citation-popover
                >. Standard refunds are returned to the original payment method within 5-7 business
                days. Exceptions should be sent to billing operations
                <loquix-citation-popover
                  .index=${2}
                  .source=${citedSources[1]}
                ></loquix-citation-popover
                >.
              </p>
            </loquix-search-answer>
          </div>

          <div class="smart-search-results">
            <loquix-search-results layout="blended" .results=${results}></loquix-search-results>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const ModalSearch: Story = {
  render: () => html`
    <style>
      .modal-search-recipe {
        min-height: 100vh;
        background: var(--loquix-bg-color, #fff);
        color: var(--loquix-text-color, #111827);
        padding: 64px 20px;
        box-sizing: border-box;
      }

      .modal-search-shell {
        width: min(680px, 100%);
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .modal-search-heading {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .modal-search-title {
        margin: 0;
        color: var(--loquix-text-color, #111827);
        font: 700 24px/1.25 var(--loquix-font-family, system-ui, sans-serif);
      }

      .modal-search-subtitle {
        margin: 0;
        color: var(--loquix-text-secondary-color, #6b7280);
        font: 400 0.9375rem/1.5 var(--loquix-font-family, system-ui, sans-serif);
      }

      .source-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 6px;
        background: var(--loquix-ai-color-subtle, #f3e8ff);
        color: var(--loquix-ai-color, #7c3aed);
        font: 700 11px/1 var(--loquix-font-family, system-ui, sans-serif);
      }
    </style>

    <div class="modal-search-recipe">
      <div class="modal-search-shell">
        <div class="modal-search-heading">
          <h1 class="modal-search-title">Drop-in workspace search</h1>
          <p class="modal-search-subtitle">
            Focus the input to open a complete smart-search modal without restructuring the page.
          </p>
        </div>

        <loquix-search-dialog
          ${ref(wireModalSmartSearch)}
          value="What's our refund policy?"
          heading="Search knowledge"
          model="GPT-4 Turbo"
          generated-in="1.8s"
          kbd="Cmd K"
        >
          <span slot="trigger-prefix" class="source-mark">S</span>
          <span slot="dialog-prefix" class="source-mark">S</span>
        </loquix-search-dialog>
      </div>
    </div>
  `,
};

export const AnchoredSearch: Story = {
  render: () => html`
    <style>
      .anchored-search-recipe {
        min-height: 820px;
        background: var(--loquix-bg-color, #fff);
        color: var(--loquix-text-color, #111827);
        padding: 48px 20px 120px;
        box-sizing: border-box;
      }

      .anchored-search-shell {
        width: min(720px, 100%);
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .anchored-search-heading {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .anchored-search-title {
        margin: 0;
        color: var(--loquix-text-color, #111827);
        font: 700 24px/1.25 var(--loquix-font-family, system-ui, sans-serif);
      }

      .anchored-search-subtitle,
      .anchored-search-copy {
        margin: 0;
        color: var(--loquix-text-secondary-color, #6b7280);
        font: 400 0.9375rem/1.6 var(--loquix-font-family, system-ui, sans-serif);
      }

      .anchored-search-copy {
        max-width: 62ch;
      }

      .source-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 6px;
        background: var(--loquix-ai-color-subtle, #f3e8ff);
        color: var(--loquix-ai-color, #7c3aed);
        font: 700 11px/1 var(--loquix-font-family, system-ui, sans-serif);
      }
    </style>

    <div class="anchored-search-recipe">
      <div class="anchored-search-shell">
        <div class="anchored-search-heading">
          <h1 class="anchored-search-title">Anchored workspace search</h1>
          <p class="anchored-search-subtitle">
            Focus the input to open the full smart-search surface around it.
          </p>
        </div>

        <p class="anchored-search-copy">
          This variant keeps the search field in the document flow, while the expanded panel is
          layered around it without changing page height.
        </p>

        <loquix-search-panel
          ${ref(wireAnchoredSmartSearch)}
          variant="integrated"
          value="What's our refund policy?"
          heading="Search knowledge"
          model="GPT-4 Turbo"
          generated-in="1.8s"
          kbd="Cmd K"
        >
          <span slot="prefix" class="source-mark">S</span>
        </loquix-search-panel>

        <p class="anchored-search-copy">
          Content below the input keeps its position, which makes this useful for docs, dashboards,
          settings pages, and any surface where a modal would feel too heavy.
        </p>
      </div>
    </div>
  `,
};

export const AnchoredBeforeSearch: Story = {
  render: () => html`
    <style>
      .anchored-search-recipe {
        min-height: 640px;
        background: var(--loquix-bg-color, #fff);
        color: var(--loquix-text-color, #111827);
        padding: 56px 20px 120px;
        box-sizing: border-box;
      }

      .anchored-search-shell {
        width: min(720px, 100%);
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .anchored-search-title {
        margin: 0;
        color: var(--loquix-text-color, #111827);
        font: 700 24px/1.25 var(--loquix-font-family, system-ui, sans-serif);
      }

      .anchored-search-subtitle {
        margin: 0;
        color: var(--loquix-text-secondary-color, #6b7280);
        font: 400 0.9375rem/1.6 var(--loquix-font-family, system-ui, sans-serif);
      }
    </style>

    <div class="anchored-search-recipe">
      <div class="anchored-search-shell">
        <h1 class="anchored-search-title">Start with suggested searches</h1>
        <p class="anchored-search-subtitle">
          The panel can open before any query runs, with suggested prompts and keyboard hints.
        </p>

        <loquix-search-panel
          ${ref(wireAnchoredPreSearch)}
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
    </div>
  `,
};
