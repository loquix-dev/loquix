import { expect, fixture, html } from '@open-wc/testing';
import { setLocale, resetLocale } from '../../i18n/index.js';
import { getShadowPart, waitForEvent } from '../../test-utils.js';
import './define-reasoning-block.js';
import type { LoquixReasoningBlock } from './loquix-reasoning-block.js';
import type { LoquixReasoningToggleDetail } from '../../events/index.js';

describe('loquix-reasoning-block', () => {
  afterEach(() => resetLocale());

  it('renders with defaults', async () => {
    const el = await fixture<LoquixReasoningBlock>(
      html`<loquix-reasoning-block></loquix-reasoning-block>`,
    );
    expect(el.status).to.equal('done');
    expect(el.defaultOpen).to.be.false;
    const header = getShadowPart(el, 'header')! as HTMLButtonElement;
    expect(header.getAttribute('aria-expanded')).to.equal('false');
  });

  it('opens by default while thinking', async () => {
    const el = await fixture<LoquixReasoningBlock>(
      html`<loquix-reasoning-block
        status="thinking"
        content="streaming…"
      ></loquix-reasoning-block>`,
    );
    const header = getShadowPart(el, 'header')!;
    expect(header.getAttribute('aria-expanded')).to.equal('true');
  });

  it('shows the thinking label and spinner while streaming', async () => {
    const el = await fixture<LoquixReasoningBlock>(
      html`<loquix-reasoning-block status="thinking"></loquix-reasoning-block>`,
    );
    const label = getShadowPart(el, 'label')!;
    expect(label.textContent?.trim()).to.equal('Thinking…');
    const cursor = getShadowPart(el, 'cursor');
    expect(cursor).to.exist;
  });

  it('shows formatted duration when done', async () => {
    const el = await fixture<LoquixReasoningBlock>(
      html`<loquix-reasoning-block status="done" duration="6"></loquix-reasoning-block>`,
    );
    const label = getShadowPart(el, 'label')!;
    expect(label.textContent?.trim()).to.equal('Thought for 6s');
  });

  it('formats duration in minutes when >= 60s', async () => {
    const el = await fixture<LoquixReasoningBlock>(
      html`<loquix-reasoning-block status="done" duration="125"></loquix-reasoning-block>`,
    );
    const label = getShadowPart(el, 'label')!;
    expect(label.textContent?.trim()).to.equal('Thought for 2m 5s');
  });

  it('shows tokens count when done', async () => {
    const el = await fixture<LoquixReasoningBlock>(
      html`<loquix-reasoning-block
        status="done"
        duration="6"
        tokens="284"
      ></loquix-reasoning-block>`,
    );
    const meta = getShadowPart(el, 'meta')!;
    expect(meta.textContent?.trim()).to.contain('284');
  });

  it('hides tokens while streaming', async () => {
    const el = await fixture<LoquixReasoningBlock>(
      html`<loquix-reasoning-block status="thinking" tokens="100"></loquix-reasoning-block>`,
    );
    expect(getShadowPart(el, 'meta')).to.be.null;
  });

  it('shows preview when collapsed and done', async () => {
    const el = await fixture<LoquixReasoningBlock>(
      html`<loquix-reasoning-block status="done" preview="Brief teaser"></loquix-reasoning-block>`,
    );
    const preview = getShadowPart(el, 'preview')!;
    expect(preview.textContent?.trim()).to.equal('Brief teaser');
  });

  it('truncates content for preview when no preview prop given', async () => {
    const el = await fixture<LoquixReasoningBlock>(
      html`<loquix-reasoning-block
        status="done"
        content=${'x'.repeat(120)}
      ></loquix-reasoning-block>`,
    );
    const preview = getShadowPart(el, 'preview')!;
    expect(preview.textContent?.endsWith('…')).to.be.true;
    expect(preview.textContent!.length).to.be.lessThan(85);
  });

  it('toggle fires loquix-reasoning-toggle with correct detail', async () => {
    const el = await fixture<LoquixReasoningBlock>(
      html`<loquix-reasoning-block status="done"></loquix-reasoning-block>`,
    );
    const header = getShadowPart(el, 'header')! as HTMLButtonElement;
    const promise = waitForEvent<LoquixReasoningToggleDetail>(el, 'loquix-reasoning-toggle');
    header.click();
    const ev = await promise;
    expect(ev.detail.open).to.be.true;
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('true');
  });

  it('user-toggle wins: collapsing while thinking persists when status flips to done', async () => {
    const el = await fixture<LoquixReasoningBlock>(
      html`<loquix-reasoning-block status="thinking"></loquix-reasoning-block>`,
    );
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('true');

    // User collapses while still thinking.
    (getShadowPart(el, 'header')! as HTMLButtonElement).click();
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('false');

    // Status transitions to done — user's collapsed state must persist.
    el.status = 'done';
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('false');
  });

  it('explicit defaultOpen change overrides user-toggle', async () => {
    const el = await fixture<LoquixReasoningBlock>(
      html`<loquix-reasoning-block status="done" default-open></loquix-reasoning-block>`,
    );
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('true');

    // User collapses.
    (getShadowPart(el, 'header')! as HTMLButtonElement).click();
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('false');

    // Consumer flips defaultOpen — user toggle should be cleared, _open follows
    // the new defaultOpen value.
    el.defaultOpen = false;
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('false');

    el.defaultOpen = true;
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('true');
  });

  it('slot wins over content prop when slot has non-whitespace text', async () => {
    const el = await fixture<LoquixReasoningBlock>(html`
      <loquix-reasoning-block status="done" default-open content="from prop"
        >from slot</loquix-reasoning-block
      >
    `);
    await el.updateComplete;
    // Slotted Light DOM is visible via the host element's textContent. The
    // shadow-DOM-side `content` fallback is rendered only when _hasSlotContent
    // is false; assert it isn't present in the shadow text.
    expect(el.textContent).to.contain('from slot');
    const text = el.shadowRoot!.querySelector('.text');
    // Walk own (non-slotted) text — slot.assignedNodes are light DOM, not
    // direct shadow children, so this only sees what we render ourselves.
    const ownText = Array.from(text!.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => (n.textContent ?? '').trim())
      .join('');
    expect(ownText).to.not.contain('from prop');
  });

  it('slot with only whitespace falls back to content prop', async () => {
    const el = await fixture<LoquixReasoningBlock>(html`
      <loquix-reasoning-block status="done" default-open content="from prop">
        ${'  \n  '}
      </loquix-reasoning-block>
    `);
    await el.updateComplete;
    // The fallback `content` is rendered as a sibling of the slot, not inside
    // its <slot> default content (whitespace-only assigned nodes still count
    // as assigned, suppressing slot fallback). So check the shadow text node
    // directly.
    const text = el.shadowRoot!.querySelector('.text');
    const ownText = Array.from(text!.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => (n.textContent ?? '').trim())
      .join('');
    expect(ownText).to.contain('from prop');
  });

  it('reflects status attribute', async () => {
    const el = await fixture<LoquixReasoningBlock>(
      html`<loquix-reasoning-block status="thinking"></loquix-reasoning-block>`,
    );
    expect(el.getAttribute('status')).to.equal('thinking');
  });

  it('locale change updates the thinking label', async () => {
    const el = await fixture<LoquixReasoningBlock>(
      html`<loquix-reasoning-block status="thinking"></loquix-reasoning-block>`,
    );
    setLocale({ 'reasoningBlock.thinking': 'Réflexion…' });
    await new Promise(r => queueMicrotask(r));
    await el.updateComplete;
    const label = getShadowPart(el, 'label')!;
    expect(label.textContent?.trim()).to.equal('Réflexion…');
  });
});
