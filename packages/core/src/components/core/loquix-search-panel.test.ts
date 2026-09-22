import { expect, fixture, html } from '@open-wc/testing';
import type { LitElement } from 'lit';
import { waitForEvent } from '../../test-utils.js';
import './define-search-panel.js';
import type { LoquixSearchPanel } from './loquix-search-panel.js';
import type { SearchResult, SearchShortcut, SearchSource, Source } from '../../types/index.js';

const sources: SearchSource[] = [
  { id: 'docs', name: 'Docs', icon: 'D', status: 'done', count: 5 },
  { id: 'slack', name: 'Slack', icon: '#', status: 'done', count: 2 },
];

const answerSources: Source[] = [
  {
    id: 'docs-refund',
    title: 'Refund Policy',
    url: 'https://docs.example.com/refunds',
    host: 'docs.example.com',
  },
];

const results: SearchResult[] = [
  {
    id: 'refund-policy',
    source: sources[0],
    title: 'Refund Policy',
    snippet: 'Customers can request refunds within 30 days.',
    citationRef: 1,
  },
];

const shortcuts: SearchShortcut[] = [
  { key: 'Enter', label: 'Search' },
  { key: 'Esc', label: 'Close' },
];

describe('loquix-search-panel', () => {
  it('renders an inline search input and collapsed panel', async () => {
    const el = await fixture<LoquixSearchPanel>(html`<loquix-search-panel></loquix-search-panel>`);

    expect(el.shadowRoot!.querySelector('loquix-search-input[part="input"]')).to.exist;
    expect(el.shadowRoot!.querySelector('[part="panel"]')).to.exist;
    expect(el.open).to.be.false;
  });

  it('opens on show() and dispatches open event', async () => {
    const el = await fixture<LoquixSearchPanel>(
      html`<loquix-search-panel value="refunds"></loquix-search-panel>`,
    );

    const eventPromise = waitForEvent(el, 'loquix-search-panel-open');
    el.show();
    const event = await eventPromise;
    await el.updateComplete;

    expect(el.open).to.be.true;
    expect((event as CustomEvent).detail.value).to.equal('refunds');
  });

  it('opens when the input receives focus', async () => {
    const el = await fixture<LoquixSearchPanel>(html`<loquix-search-panel></loquix-search-panel>`);
    const input = el.shadowRoot!.querySelector('loquix-search-input[part="input"]')!;

    input.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
    await el.updateComplete;

    expect(el.open).to.be.true;
  });

  it('does not increase layout height when opened', async () => {
    const el = await fixture<LoquixSearchPanel>(html`
      <loquix-search-panel
        style="display:block;width:620px"
        answer-content="Refunds are available within 30 days."
        model="GPT-4 Turbo"
        .sources=${sources}
        .answerSources=${answerSources}
        .results=${results}
        .shortcuts=${shortcuts}
      ></loquix-search-panel>
    `);
    const closedHeight = el.getBoundingClientRect().height;

    el.show();
    await el.updateComplete;
    const openHeight = el.getBoundingClientRect().height;

    expect(openHeight).to.equal(closedHeight);
  });

  it('supports integrated variant without increasing layout height', async () => {
    const el = await fixture<LoquixSearchPanel>(html`
      <loquix-search-panel
        variant="integrated"
        style="display:block;width:620px"
        answer-content="Refunds are available within 30 days."
        model="GPT-4 Turbo"
        .sources=${sources}
        .answerSources=${answerSources}
        .results=${results}
        .shortcuts=${shortcuts}
      ></loquix-search-panel>
    `);
    const closedHeight = el.getBoundingClientRect().height;

    el.show();
    await el.updateComplete;
    const openHeight = el.getBoundingClientRect().height;

    expect(el.getAttribute('variant')).to.equal('integrated');
    expect(openHeight).to.equal(closedHeight);
  });

  it('closes on hide() and dispatches close event', async () => {
    const el = await fixture<LoquixSearchPanel>(
      html`<loquix-search-panel value="refunds"></loquix-search-panel>`,
    );
    el.show();
    await el.updateComplete;

    const eventPromise = waitForEvent(el, 'loquix-search-panel-close');
    el.hide();
    const event = await eventPromise;
    await el.updateComplete;

    expect(el.open).to.be.false;
    expect((event as CustomEvent).detail.value).to.equal('refunds');
  });

  it('closes on Escape', async () => {
    const el = await fixture<LoquixSearchPanel>(
      html`<loquix-search-panel open></loquix-search-panel>`,
    );

    el.shadowRoot!.querySelector('.container')!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }),
    );
    await el.updateComplete;

    expect(el.open).to.be.false;
  });

  it('closes on outside pointer down but not inside pointer down', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <loquix-search-panel open></loquix-search-panel>
        <button>Outside</button>
      </div>
    `);
    const el = wrapper.querySelector('loquix-search-panel') as LoquixSearchPanel;
    await el.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 10));
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.open).to.be.true;

    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it('stays closed when the input clear button is clicked', async () => {
    const el = await fixture<LoquixSearchPanel>(
      html`<loquix-search-panel value="refund policy"></loquix-search-panel>`,
    );
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector('loquix-search-input[part="input"]') as LitElement;
    await input.updateComplete;
    const clear = input.shadowRoot!.querySelector('[part~="clear-button"]') as HTMLButtonElement;

    clear.click();
    await el.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 0));
    await el.updateComplete;

    expect(el.value, 'clear button should still clear the query').to.equal('');
    expect(el.open, 'clearing the input must not open the panel').to.be.false;
  });

  it('forwards empty-text to the built-in results list', async () => {
    const el = await fixture<LoquixSearchPanel>(
      html`<loquix-search-panel open empty-text="Service is too busy."></loquix-search-panel>`,
    );
    await el.updateComplete;

    const list = el.shadowRoot!.querySelector('loquix-search-results') as HTMLElement;
    expect(list).to.exist;
    expect(list.getAttribute('empty-text')).to.equal('Service is too busy.');
  });

  it('shows the results region for an empty message without results', async () => {
    const el = await fixture<LoquixSearchPanel>(
      html`<loquix-search-panel open empty-text="Service is too busy."></loquix-search-panel>`,
    );
    await el.updateComplete;

    const region = el.shadowRoot!.querySelector('.results') as HTMLElement;
    expect(region.hidden, 'results region must be visible to show the empty state').to.be.false;
  });

  it('hides the results region when there are no results and no empty message', async () => {
    const el = await fixture<LoquixSearchPanel>(
      html`<loquix-search-panel open></loquix-search-panel>`,
    );
    await el.updateComplete;

    const region = el.shadowRoot!.querySelector('.results') as HTMLElement;
    expect(region.hidden).to.be.true;
  });

  it('renders provided sources, answer, results, and shortcuts', async () => {
    const el = await fixture<LoquixSearchPanel>(html`
      <loquix-search-panel
        open
        answer-content="Refunds are available within 30 days."
        model="GPT-4 Turbo"
        .sources=${sources}
        .answerSources=${answerSources}
        .results=${results}
        .shortcuts=${shortcuts}
      ></loquix-search-panel>
    `);

    expect(el.shadowRoot!.querySelector('loquix-search-sources')).to.exist;
    expect(el.shadowRoot!.querySelector('loquix-search-answer')).to.exist;
    expect(el.shadowRoot!.querySelector('loquix-search-results')).to.exist;
    expect(el.shadowRoot!.querySelector('loquix-search-footer')).to.exist;
  });

  it('renders slotted pre-search suggestions', async () => {
    const el = await fixture<LoquixSearchPanel>(html`
      <loquix-search-panel open>
        <button slot="suggestions">Ask about refunds</button>
      </loquix-search-panel>
    `);

    await el.updateComplete;
    await el.updateComplete;

    const suggestions = el.shadowRoot!.querySelector('.suggestions') as HTMLElement;
    expect(suggestions.hidden).to.be.false;
  });

  it('uses progress sources while searching', async () => {
    const el = await fixture<LoquixSearchPanel>(html`
      <loquix-search-panel
        open
        state="searching"
        running-total="7"
        .sources=${sources}
      ></loquix-search-panel>
    `);

    const sourceStrip = el.shadowRoot!.querySelector('loquix-search-sources') as HTMLElement;
    expect(sourceStrip.getAttribute('variant')).to.equal('progress');
    expect(sourceStrip.getAttribute('running-total')).to.equal('7');
  });

  it('renders a built-in answer for the generating answer state', async () => {
    const el = await fixture<LoquixSearchPanel>(html`
      <loquix-search-panel open answer-state="generating"></loquix-search-panel>
    `);

    const answer = el.shadowRoot!.querySelector('loquix-search-answer') as HTMLElement;
    expect(answer).to.exist;
    expect(answer.getAttribute('state')).to.equal('generating');
  });

  it('shows the Ask AI affordance on the inline input by default', async () => {
    const el = await fixture<LoquixSearchPanel>(html`<loquix-search-panel></loquix-search-panel>`);
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector('loquix-search-input[part="input"]') as LitElement;
    await input.updateComplete;

    expect(input.shadowRoot!.querySelector('[part~="ask-button"]')).to.exist;
  });

  it('does not show the Ask AI affordance on the inline input in plain mode', async () => {
    const el = await fixture<LoquixSearchPanel>(
      html`<loquix-search-panel mode="plain"></loquix-search-panel>`,
    );
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector('loquix-search-input[part="input"]') as LitElement;
    await input.updateComplete;

    const ask = input.shadowRoot!.querySelector('[part~="ask-button"]');
    expect(ask === null, 'ask button must not render in plain mode').to.be.true;
  });

  it('syncs value from the input change event', async () => {
    const el = await fixture<LoquixSearchPanel>(
      html`<loquix-search-panel value="refund"></loquix-search-panel>`,
    );

    const input = el.shadowRoot!.querySelector('loquix-search-input')!;
    input.dispatchEvent(
      new CustomEvent('loquix-change', {
        bubbles: true,
        composed: true,
        detail: { value: 'refund policy' },
      }),
    );
    await el.updateComplete;

    expect(el.value).to.equal('refund policy');
  });

  it('shows custom slotted answer without built-in answer props', async () => {
    const el = await fixture<LoquixSearchPanel>(html`
      <loquix-search-panel open>
        <div slot="answer">Custom answer</div>
      </loquix-search-panel>
    `);

    await el.updateComplete;
    await el.updateComplete;

    const answer = el.shadowRoot!.querySelector('.answer') as HTMLElement;
    expect(answer.hidden).to.be.false;
  });
});
