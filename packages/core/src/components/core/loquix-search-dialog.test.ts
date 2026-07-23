import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent } from '../../test-utils.js';
import './define-search-dialog.js';
import type { LoquixSearchDialog } from './loquix-search-dialog.js';
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
  { key: 'Cmd Enter', label: 'Ask AI' },
];

describe('loquix-search-dialog', () => {
  it('renders trigger input and dialog', async () => {
    const el = await fixture<LoquixSearchDialog>(
      html`<loquix-search-dialog></loquix-search-dialog>`,
    );

    expect(el.shadowRoot!.querySelector('loquix-search-input[part="trigger"]')).to.exist;
    expect(el.shadowRoot!.querySelector('dialog')).to.exist;
  });

  it('opens on show() and dispatches open event', async () => {
    const el = await fixture<LoquixSearchDialog>(
      html`<loquix-search-dialog value="refunds"></loquix-search-dialog>`,
    );

    const eventPromise = waitForEvent(el, 'loquix-search-dialog-open');
    el.show();
    const event = await eventPromise;
    await el.updateComplete;

    expect(el.open).to.be.true;
    expect((event as CustomEvent).detail.value).to.equal('refunds');
  });

  it('opens when the trigger receives focus', async () => {
    const el = await fixture<LoquixSearchDialog>(
      html`<loquix-search-dialog></loquix-search-dialog>`,
    );
    const trigger = el.shadowRoot!.querySelector('loquix-search-input[part="trigger"]')!;

    trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
    await el.updateComplete;

    expect(el.open).to.be.true;
  });

  it('closes on hide() and dispatches close event', async () => {
    const el = await fixture<LoquixSearchDialog>(
      html`<loquix-search-dialog value="refunds"></loquix-search-dialog>`,
    );
    el.show();
    await el.updateComplete;

    const eventPromise = waitForEvent(el, 'loquix-search-dialog-close');
    el.hide();
    const event = await eventPromise;
    await el.updateComplete;

    expect(el.open).to.be.false;
    expect((event as CustomEvent).detail.value).to.equal('refunds');
  });

  it('starts close animation when open is set to false externally', async () => {
    const el = await fixture<LoquixSearchDialog>(
      html`<loquix-search-dialog open></loquix-search-dialog>`,
    );
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog')!;
    expect(dialog.open).to.be.true;

    el.open = false;
    await el.updateComplete;
    await el.updateComplete;

    expect(dialog.classList.contains('is-closing')).to.be.true;
  });

  it('closes immediately when reduced motion is preferred', async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) =>
      ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() {
          return false;
        },
      }) as MediaQueryList) as typeof window.matchMedia;

    try {
      const el = await fixture<LoquixSearchDialog>(
        html`<loquix-search-dialog open></loquix-search-dialog>`,
      );
      await el.updateComplete;
      const dialog = el.shadowRoot!.querySelector('dialog')!;

      el.hide();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(dialog.open).to.be.false;
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('closes when the dialog backdrop is clicked', async () => {
    const el = await fixture<LoquixSearchDialog>(
      html`<loquix-search-dialog open></loquix-search-dialog>`,
    );
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog')!;
    dialog.getBoundingClientRect = () =>
      ({
        x: 10,
        y: 10,
        top: 10,
        right: 110,
        bottom: 110,
        left: 10,
        width: 100,
        height: 100,
        toJSON() {
          return {};
        },
      }) as DOMRect;

    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 0, clientY: 0 }));
    await el.updateComplete;

    expect(el.open).to.be.false;
  });

  it('keeps open when clicking inside the dialog body', async () => {
    const el = await fixture<LoquixSearchDialog>(
      html`<loquix-search-dialog open></loquix-search-dialog>`,
    );
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog')!;
    dialog.getBoundingClientRect = () =>
      ({
        x: 10,
        y: 10,
        top: 10,
        right: 110,
        bottom: 110,
        left: 10,
        width: 100,
        height: 100,
        toJSON() {
          return {};
        },
      }) as DOMRect;

    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 50, clientY: 50 }));
    await el.updateComplete;

    expect(el.open).to.be.true;
  });

  it('ignores backdrop clicks when outside close is disabled', async () => {
    const el = await fixture<LoquixSearchDialog>(
      html`<loquix-search-dialog open .closeOnOutsideClick=${false}></loquix-search-dialog>`,
    );
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog')!;
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 0, clientY: 0 }));
    await el.updateComplete;

    expect(el.open).to.be.true;
  });

  it('closes when native dialog close fires while open', async () => {
    const el = await fixture<LoquixSearchDialog>(
      html`<loquix-search-dialog open></loquix-search-dialog>`,
    );
    await el.updateComplete;

    el.shadowRoot!.querySelector('dialog')!.dispatchEvent(new Event('close'));
    await el.updateComplete;

    expect(el.open).to.be.false;
  });

  it('prevents native cancel and closes', async () => {
    const el = await fixture<LoquixSearchDialog>(
      html`<loquix-search-dialog open></loquix-search-dialog>`,
    );
    await el.updateComplete;

    const cancel = new Event('cancel', { cancelable: true });
    el.shadowRoot!.querySelector('dialog')!.dispatchEvent(cancel);
    await el.updateComplete;

    expect(cancel.defaultPrevented).to.be.true;
    expect(el.open).to.be.false;
  });

  it('does not reopen from focus returning to trigger after close', async () => {
    const el = await fixture<LoquixSearchDialog>(
      html`<loquix-search-dialog></loquix-search-dialog>`,
    );
    const trigger = el.shadowRoot!.querySelector('loquix-search-input[part="trigger"]')!;

    el.show();
    await el.updateComplete;
    el.hide();
    trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
    await el.updateComplete;

    expect(el.open).to.be.false;
  });

  it('does not reopen from focus returning after the close animation', async () => {
    const el = await fixture<LoquixSearchDialog>(
      html`<loquix-search-dialog></loquix-search-dialog>`,
    );
    const trigger = el.shadowRoot!.querySelector('loquix-search-input[part="trigger"]')!;

    el.show();
    await el.updateComplete;
    el.hide();
    await new Promise(resolve => setTimeout(resolve, 170));
    trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
    await el.updateComplete;

    expect(el.open).to.be.false;
  });

  it('renders provided sources, answer, results, and shortcuts', async () => {
    const el = await fixture<LoquixSearchDialog>(html`
      <loquix-search-dialog
        answer-content="Refunds are available within 30 days."
        model="GPT-4 Turbo"
        .sources=${sources}
        .answerSources=${answerSources}
        .results=${results}
        .shortcuts=${shortcuts}
      ></loquix-search-dialog>
    `);

    el.show();
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('loquix-search-sources')).to.exist;
    expect(el.shadowRoot!.querySelector('loquix-search-answer')).to.exist;
    expect(el.shadowRoot!.querySelector('loquix-search-results')).to.exist;
    expect(el.shadowRoot!.querySelector('loquix-search-footer')).to.exist;
  });

  it('uses progress sources while searching', async () => {
    const el = await fixture<LoquixSearchDialog>(html`
      <loquix-search-dialog
        state="searching"
        running-total="7"
        .sources=${sources}
      ></loquix-search-dialog>
    `);

    el.show();
    await el.updateComplete;

    const sourceStrip = el.shadowRoot!.querySelector('loquix-search-sources') as HTMLElement;
    expect(sourceStrip.getAttribute('variant')).to.equal('progress');
    expect(sourceStrip.getAttribute('running-total')).to.equal('7');
  });

  it('renders a built-in answer for the generating answer state', async () => {
    const el = await fixture<LoquixSearchDialog>(
      html`<loquix-search-dialog answer-state="generating"></loquix-search-dialog>`,
    );

    el.show();
    await el.updateComplete;

    const answer = el.shadowRoot!.querySelector('loquix-search-answer') as HTMLElement;
    expect(answer).to.exist;
    expect(answer.getAttribute('state')).to.equal('generating');
  });

  it('syncs value from the dialog input change event', async () => {
    const el = await fixture<LoquixSearchDialog>(
      html`<loquix-search-dialog value="refund"></loquix-search-dialog>`,
    );
    el.show();
    await el.updateComplete;

    const dialogInput = el.shadowRoot!.querySelector('.dialog-input')!;
    dialogInput.dispatchEvent(
      new CustomEvent('loquix-change', {
        bubbles: true,
        composed: true,
        detail: { value: 'refund policy' },
      }),
    );
    await el.updateComplete;

    expect(el.value).to.equal('refund policy');
  });

  it('can hide built-in answer, results, and footer regions', async () => {
    const el = await fixture<LoquixSearchDialog>(html`
      <loquix-search-dialog hide-answer hide-results hide-footer></loquix-search-dialog>
    `);

    el.show();
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('loquix-search-answer')).to.not.exist;
    expect(el.shadowRoot!.querySelector('loquix-search-results')).to.not.exist;
    expect(el.shadowRoot!.querySelector('loquix-search-footer')).to.not.exist;
  });

  it('shows custom slotted answer without built-in answer props', async () => {
    const el = await fixture<LoquixSearchDialog>(html`
      <loquix-search-dialog>
        <div slot="answer">Custom answer</div>
      </loquix-search-dialog>
    `);

    el.show();
    await el.updateComplete;
    await el.updateComplete;

    const answer = el.shadowRoot!.querySelector('.answer') as HTMLElement;
    expect(answer.hidden).to.be.false;
  });
});
