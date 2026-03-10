import { expect, fixture, html } from '@open-wc/testing';
import { getShadowPart, getShadowParts } from '../../test-utils.js';
import { setLocale, resetLocale } from '../../i18n/index.js';
import './define-typing-indicator.js';
import type { LoquixTypingIndicator } from './loquix-typing-indicator.js';

describe('loquix-typing-indicator', () => {
  it('renders dots by default', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator></loquix-typing-indicator>`,
    );
    expect(el.variant).to.equal('dots');
    const container = getShadowPart(el, 'container');
    expect(container).to.exist;
    expect(container!.getAttribute('role')).to.equal('status');
    const dots = getShadowParts(el, 'dot');
    expect(dots).to.have.lengthOf(3);
  });

  it('renders text variant with default message', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator variant="text"></loquix-typing-indicator>`,
    );
    expect(el.variant).to.equal('text');
    const container = getShadowPart(el, 'container')!;
    // No dots in text variant
    const dots = getShadowParts(el, 'dot');
    expect(dots).to.have.lengthOf(0);
    // Should show default text "Thinking…"
    expect(container.textContent).to.contain('Thinking');
  });

  it('renders steps variant with default message', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator variant="steps"></loquix-typing-indicator>`,
    );
    const container = getShadowPart(el, 'container')!;
    expect(container.textContent).to.contain('Working');
  });

  it('uses custom message when provided', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator
        variant="text"
        message="Searching the web..."
      ></loquix-typing-indicator>`,
    );
    const container = getShadowPart(el, 'container')!;
    expect(container.textContent).to.contain('Searching the web...');
  });

  it('variant="dots" renders exactly 3 dot elements', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator variant="dots"></loquix-typing-indicator>`,
    );
    const dots = getShadowParts(el, 'dot');
    expect(dots).to.have.lengthOf(3);
    for (const dot of dots) {
      expect(dot.classList.contains('dot')).to.be.true;
    }
  });

  it('variant="text" renders message text and no dots', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator variant="text"></loquix-typing-indicator>`,
    );
    const dots = getShadowParts(el, 'dot');
    expect(dots).to.have.lengthOf(0);
    const container = getShadowPart(el, 'container')!;
    expect(container.querySelector('.text')).to.exist;
  });

  it('variant="steps" renders message text with default "Working" message', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator variant="steps"></loquix-typing-indicator>`,
    );
    const container = getShadowPart(el, 'container')!;
    expect(container.textContent).to.contain('Working');
    const dots = getShadowParts(el, 'dot');
    expect(dots).to.have.lengthOf(0);
  });

  it('custom message overrides localized text for text variant', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator
        variant="text"
        message="Analyzing data..."
      ></loquix-typing-indicator>`,
    );
    const container = getShadowPart(el, 'container')!;
    expect(container.textContent).to.contain('Analyzing data...');
    expect(container.textContent).to.not.contain('Thinking');
  });

  it('custom message overrides localized text for steps variant', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator
        variant="steps"
        message="Step 2 of 5"
      ></loquix-typing-indicator>`,
    );
    const container = getShadowPart(el, 'container')!;
    expect(container.textContent).to.contain('Step 2 of 5');
    expect(container.textContent).to.not.contain('Working');
  });

  it('role="status" on container for accessibility', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator></loquix-typing-indicator>`,
    );
    const container = getShadowPart(el, 'container')!;
    expect(container.getAttribute('role')).to.equal('status');
  });

  it('aria-label localized to "AI is typing" for dots variant', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator variant="dots"></loquix-typing-indicator>`,
    );
    const container = getShadowPart(el, 'container')!;
    expect(container.getAttribute('aria-label')).to.equal('AI is typing');
  });

  it('CSS part "container" is queryable', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator></loquix-typing-indicator>`,
    );
    const container = getShadowPart(el, 'container');
    expect(container).to.exist;
    expect(container!.tagName.toLowerCase()).to.equal('div');
  });

  it('variant reflects to attribute on host', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator variant="text"></loquix-typing-indicator>`,
    );
    expect(el.getAttribute('variant')).to.equal('text');
    el.variant = 'steps';
    await el.updateComplete;
    expect(el.getAttribute('variant')).to.equal('steps');
  });

  it('responds to locale changes for aria-label', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator variant="dots"></loquix-typing-indicator>`,
    );
    setLocale({ 'typingIndicator.ariaLabel': 'IA est en train de taper' });
    // Flush the microtask that schedules requestUpdate, then wait for re-render
    await new Promise(r => queueMicrotask(r));
    await el.updateComplete;
    const container = getShadowPart(el, 'container')!;
    expect(container.getAttribute('aria-label')).to.equal('IA est en train de taper');
    resetLocale();
  });

  it('dots are aria-hidden', async () => {
    const el = await fixture<LoquixTypingIndicator>(
      html`<loquix-typing-indicator variant="dots"></loquix-typing-indicator>`,
    );
    const dotsContainer = el.shadowRoot!.querySelector('.dots');
    expect(dotsContainer).to.exist;
    expect(dotsContainer!.getAttribute('aria-hidden')).to.equal('true');
  });
});
