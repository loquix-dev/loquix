import { expect, fixture, html } from '@open-wc/testing';
import { getShadowPart, getShadowParts, waitForEvent } from '../../test-utils.js';
import './define-search-answer.js';
import type { LoquixSearchAnswer } from './loquix-search-answer.js';
import type { LoquixCopyDetail, LoquixRegenerateDetail } from '../../events/index.js';
import type { Source } from '../../types/index.js';

const sources: Source[] = [
  {
    id: 'docs-1',
    title: 'Refund Policy',
    url: 'https://docs.example.com/refunds',
    host: 'docs.example.com',
    snippet: 'Refunds are available within 30 days.',
  },
  {
    id: 'notion-1',
    title: 'Internal refund workflow',
    url: 'https://team.notion.so/refunds',
    host: 'team.notion.so',
  },
];

describe('loquix-search-answer', () => {
  it('renders title, content, and metadata', async () => {
    const el = await fixture<LoquixSearchAnswer>(
      html`<loquix-search-answer
        content="Refunds are available within 30 days."
        model="GPT-4 Turbo"
        generated-in="1.8s"
      ></loquix-search-answer>`,
    );

    expect(getShadowPart(el, 'title')!.textContent?.trim()).to.equal('AI Answer');
    expect(getShadowPart(el, 'body')!.textContent).to.contain('Refunds are available');
    expect(getShadowPart(el, 'meta')!.textContent).to.contain('GPT-4 Turbo');
    expect(getShadowPart(el, 'meta')!.textContent).to.contain('1.8s');
  });

  it('prefers default slot content over content property', async () => {
    const el = await fixture<LoquixSearchAnswer>(
      html`<loquix-search-answer content="Fallback answer">
        <p>Slotted answer</p>
      </loquix-search-answer>`,
    );
    await el.updateComplete;

    const slot = getShadowPart(el, 'body')!.querySelector('slot') as HTMLSlotElement;
    expect(slot.assignedElements()[0].textContent).to.contain('Slotted answer');
    expect(getShadowPart(el, 'body')!.textContent).not.to.contain('Fallback answer');
  });

  it('renders cited source chips', async () => {
    const el = await fixture<LoquixSearchAnswer>(
      html`<loquix-search-answer content="Answer"></loquix-search-answer>`,
    );
    el.sources = sources;
    await el.updateComplete;

    const sourceChips = getShadowParts(el, 'source');
    expect(sourceChips.length).to.equal(2);
    expect(sourceChips[0].textContent).to.contain('docs.example.com');
    expect(sourceChips[0].querySelector('loquix-citation-popover')).to.exist;
  });

  it('renders the generating indicator while an answer is in progress', async () => {
    const el = await fixture<LoquixSearchAnswer>(
      html`<loquix-search-answer state="generating"></loquix-search-answer>`,
    );

    const indicator = getShadowPart(el, 'generating')!.querySelector('loquix-typing-indicator');
    expect(indicator).to.exist;
    expect(indicator!.getAttribute('variant')).to.equal('dots');
    expect(indicator!.hasAttribute('message')).to.be.false;
    expect(getShadowParts(el, 'action').length).to.equal(0);
  });

  it('dispatches copy events with answer content', async () => {
    const el = await fixture<LoquixSearchAnswer>(
      html`<loquix-search-answer content="Copy this answer"></loquix-search-answer>`,
    );
    const eventPromise = waitForEvent<LoquixCopyDetail>(el, 'loquix-copy');
    (getShadowParts(el, 'action')[0] as HTMLButtonElement).click();
    const event = await eventPromise;
    expect(event.detail.content).to.equal('Copy this answer');
  });

  it('dispatches copy events with normalized slotted text', async () => {
    const el = await fixture<LoquixSearchAnswer>(html`
      <loquix-search-answer>
        Refunds
        <strong>take 5 days</strong>
      </loquix-search-answer>
    `);
    await el.updateComplete;

    const eventPromise = waitForEvent<LoquixCopyDetail>(el, 'loquix-copy');
    (getShadowParts(el, 'action')[0] as HTMLButtonElement).click();
    const event = await eventPromise;
    expect(event.detail.content).to.equal('Refunds take 5 days');
  });

  it('dispatches regenerate events', async () => {
    const el = await fixture<LoquixSearchAnswer>(
      html`<loquix-search-answer content="Answer"></loquix-search-answer>`,
    );
    const eventPromise = waitForEvent<LoquixRegenerateDetail>(el, 'loquix-regenerate');
    (getShadowParts(el, 'action')[1] as HTMLButtonElement).click();
    const event = await eventPromise;
    expect(event.detail).to.deep.equal({});
  });

  it('can hide built-in actions', async () => {
    const el = await fixture<LoquixSearchAnswer>(
      html`<loquix-search-answer
        content="Answer"
        .showCopy=${false}
        .showRegenerate=${false}
      ></loquix-search-answer>`,
    );
    await el.updateComplete;
    expect(getShadowParts(el, 'action').length).to.equal(0);
  });
});
