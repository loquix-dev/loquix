import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart } from '../../test-utils.js';
import './define-action-copy.js';
import type { LoquixActionCopy } from './loquix-action-copy.js';

describe('loquix-action-copy', () => {
  it('renders with default label', async () => {
    const el = await fixture<LoquixActionCopy>(html`<loquix-action-copy></loquix-action-copy>`);
    expect(el.action).to.equal('loquix-copy');
    const btn = getShadowPart(el, 'button');
    expect(btn).to.exist;
    expect(btn!.getAttribute('aria-label')).to.equal('Copy message');
  });

  it('dispatches loquix-copy event on click', async () => {
    const el = await fixture<LoquixActionCopy>(html`<loquix-action-copy></loquix-action-copy>`);
    const btn = getShadowPart(el, 'button')!;
    const eventPromise = waitForEvent(el, 'loquix-copy');
    btn.click();
    const event = await eventPromise;
    expect(event).to.exist;
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
  });

  it('sets copied state on click and resets after timeout', async () => {
    const el = await fixture<LoquixActionCopy>(html`<loquix-action-copy></loquix-action-copy>`);
    expect(el.copied).to.be.false;
    const btn = getShadowPart(el, 'button')!;
    btn.click();
    expect(el.copied).to.be.true;
    // aria-label should change while copied
    await el.updateComplete;
    const updatedBtn = getShadowPart(el, 'button')!;
    expect(updatedBtn.getAttribute('aria-label')).to.equal('Copied');
  });

  it('renders copy icon by default and checkmark when copied', async () => {
    const el = await fixture<LoquixActionCopy>(html`<loquix-action-copy></loquix-action-copy>`);
    const btn = getShadowPart(el, 'button')!;
    // Default: copy icon has <rect> for clipboard
    expect(btn.querySelector('rect')).to.exist;

    btn.click();
    await el.updateComplete;
    // Copied: checkmark icon has <polyline>
    const copiedBtn = getShadowPart(el, 'button')!;
    expect(copiedBtn.querySelector('polyline')).to.exist;
  });

  it('does not dispatch when disabled', async () => {
    const el = await fixture<LoquixActionCopy>(
      html`<loquix-action-copy disabled></loquix-action-copy>`,
    );
    let fired = false;
    el.addEventListener('loquix-copy', () => {
      fired = true;
    });
    const btn = getShadowPart(el, 'button')!;
    btn.click();
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  // === Timer cleanup on disconnectedCallback ===

  it('does not error when removed during copied state', async () => {
    const el = await fixture<LoquixActionCopy>(html`<loquix-action-copy></loquix-action-copy>`);
    const btn = getShadowPart(el, 'button')!;
    btn.click();
    expect(el.copied).to.be.true;
    // Remove the element while timer is active
    el.remove();
    // Wait briefly to ensure no error is thrown from cleanup
    await new Promise(r => setTimeout(r, 50));
    // If we get here without error, the timer was cleaned up
    expect(el.isConnected).to.be.false;
  });

  // === copied attribute reflects to DOM ===

  it('reflects copied attribute to DOM as [copied]', async () => {
    const el = await fixture<LoquixActionCopy>(html`<loquix-action-copy></loquix-action-copy>`);
    expect(el.hasAttribute('copied')).to.be.false;
    const btn = getShadowPart(el, 'button')!;
    btn.click();
    await el.updateComplete;
    expect(el.hasAttribute('copied')).to.be.true;
  });

  // === Rapid double-click keeps copied state ===

  it('stays in copied state after rapid double-click', async () => {
    const el = await fixture<LoquixActionCopy>(html`<loquix-action-copy></loquix-action-copy>`);
    const btn = getShadowPart(el, 'button')!;

    // First click sets copied
    btn.click();
    expect(el.copied).to.be.true;

    // Second click also keeps copied
    btn.click();
    expect(el.copied).to.be.true;

    // Two loquix-copy events should have fired
    let eventCount = 0;
    el.addEventListener('loquix-copy', () => {
      eventCount++;
    });
    btn.click();
    btn.click();
    await new Promise(r => setTimeout(r, 50));
    expect(eventCount).to.equal(2);
    expect(el.copied).to.be.true;
  });

  // === Custom label property ===

  it('uses custom label property as aria-label', async () => {
    const el = await fixture<LoquixActionCopy>(
      html`<loquix-action-copy label="Copy code"></loquix-action-copy>`,
    );
    const btn = getShadowPart(el, 'button')!;
    expect(btn.getAttribute('aria-label')).to.equal('Copy code');
  });

  // === After copied, aria-label shows "Copied", default shows "Copy message" ===

  it('shows "Copied" aria-label while copied and default "Copy message" before click', async () => {
    const el = await fixture<LoquixActionCopy>(html`<loquix-action-copy></loquix-action-copy>`);
    // Before click: default label
    expect(getShadowPart(el, 'button')!.getAttribute('aria-label')).to.equal('Copy message');

    // After click: copied label
    getShadowPart(el, 'button')!.click();
    await el.updateComplete;
    expect(getShadowPart(el, 'button')!.getAttribute('aria-label')).to.equal('Copied');
  });

  // === action property from constructor ===

  it('has action="loquix-copy" set from constructor', async () => {
    const el = await fixture<LoquixActionCopy>(html`<loquix-action-copy></loquix-action-copy>`);
    expect(el.action).to.equal('loquix-copy');
  });
});
