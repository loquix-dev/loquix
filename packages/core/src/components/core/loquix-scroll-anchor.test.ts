import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart } from '../../test-utils.js';
import { setLocale, resetLocale } from '../../i18n/index.js';
import './define-scroll-anchor.js';
import type { LoquixScrollAnchor } from './loquix-scroll-anchor.js';

describe('loquix-scroll-anchor', () => {
  it('renders with default properties', async () => {
    const el = await fixture<LoquixScrollAnchor>(
      html`<loquix-scroll-anchor></loquix-scroll-anchor>`,
    );
    expect(el).to.exist;
    expect(el.visible).to.be.false;
    const btn = getShadowPart(el, 'button');
    expect(btn!.getAttribute('aria-label')).to.equal('Scroll to bottom');
  });

  it('reflects visible attribute', async () => {
    const el = await fixture<LoquixScrollAnchor>(
      html`<loquix-scroll-anchor visible></loquix-scroll-anchor>`,
    );
    expect(el.visible).to.be.true;
    expect(el.hasAttribute('visible')).to.be.true;
  });

  it('dispatches loquix-scroll-anchor-click on click', async () => {
    const el = await fixture<LoquixScrollAnchor>(
      html`<loquix-scroll-anchor visible></loquix-scroll-anchor>`,
    );
    const btn = getShadowPart(el, 'button')!;
    const eventPromise = waitForEvent(el, 'loquix-scroll-anchor-click');
    btn.click();
    const event = await eventPromise;
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
  });

  it('applies custom label to aria-label', async () => {
    const el = await fixture<LoquixScrollAnchor>(
      html`<loquix-scroll-anchor label="Go down"></loquix-scroll-anchor>`,
    );
    const btn = getShadowPart(el, 'button')!;
    expect(btn.getAttribute('aria-label')).to.equal('Go down');
  });

  it('has button part', async () => {
    const el = await fixture<LoquixScrollAnchor>(
      html`<loquix-scroll-anchor></loquix-scroll-anchor>`,
    );
    expect(getShadowPart(el, 'button')).to.exist;
  });

  it('renders icon via CSS ::before pseudo-element', async () => {
    const el = await fixture<LoquixScrollAnchor>(
      html`<loquix-scroll-anchor></loquix-scroll-anchor>`,
    );
    const btn = getShadowPart(el, 'button')!;
    const style = getComputedStyle(btn, '::before');
    // ::before should have mask-image set (default chevron SVG)
    expect(style.maskImage || style.webkitMaskImage).to.not.be.empty;
  });

  it('visible=false has no visible attribute on host', async () => {
    const el = await fixture<LoquixScrollAnchor>(
      html`<loquix-scroll-anchor></loquix-scroll-anchor>`,
    );
    expect(el.visible).to.be.false;
    expect(el.hasAttribute('visible')).to.be.false;
  });

  it('button is focusable when visible', async () => {
    const el = await fixture<LoquixScrollAnchor>(
      html`<loquix-scroll-anchor visible></loquix-scroll-anchor>`,
    );
    const btn = getShadowPart(el, 'button')! as HTMLButtonElement;
    expect(btn.tabIndex).to.be.greaterThanOrEqual(0);
    // Button should not be disabled
    expect(btn.disabled).to.not.be.true;
    // Focus should work
    btn.focus();
    expect(el.shadowRoot!.activeElement).to.equal(btn);
  });

  it('setLocale changes rendered aria-label', async () => {
    const el = await fixture<LoquixScrollAnchor>(
      html`<loquix-scroll-anchor></loquix-scroll-anchor>`,
    );
    // Default English
    const btn = getShadowPart(el, 'button')!;
    expect(btn.getAttribute('aria-label')).to.equal('Scroll to bottom');

    // Change locale
    setLocale({ 'scrollAnchor.label': 'Vers le bas' });
    // Flush the microtask that schedules requestUpdate, then wait for re-render
    await new Promise(r => queueMicrotask(r));
    await el.updateComplete;
    expect(btn.getAttribute('aria-label')).to.equal('Vers le bas');

    // Reset
    resetLocale();
    await new Promise(r => queueMicrotask(r));
    await el.updateComplete;
    expect(btn.getAttribute('aria-label')).to.equal('Scroll to bottom');
  });

  it('visible can be toggled dynamically', async () => {
    const el = await fixture<LoquixScrollAnchor>(
      html`<loquix-scroll-anchor></loquix-scroll-anchor>`,
    );
    expect(el.visible).to.be.false;
    expect(el.hasAttribute('visible')).to.be.false;

    el.visible = true;
    await el.updateComplete;
    expect(el.hasAttribute('visible')).to.be.true;

    el.visible = false;
    await el.updateComplete;
    expect(el.hasAttribute('visible')).to.be.false;
  });

  it('click event dispatches even when not visible', async () => {
    const el = await fixture<LoquixScrollAnchor>(
      html`<loquix-scroll-anchor></loquix-scroll-anchor>`,
    );
    const btn = getShadowPart(el, 'button')!;
    const eventPromise = waitForEvent(el, 'loquix-scroll-anchor-click');
    btn.click();
    const event = await eventPromise;
    expect(event).to.exist;
  });

  it('custom label overrides localized default', async () => {
    const el = await fixture<LoquixScrollAnchor>(
      html`<loquix-scroll-anchor label="Jump to newest"></loquix-scroll-anchor>`,
    );
    const btn = getShadowPart(el, 'button')!;
    expect(btn.getAttribute('aria-label')).to.equal('Jump to newest');
  });
});
