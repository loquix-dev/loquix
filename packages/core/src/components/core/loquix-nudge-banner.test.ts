import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart, getSlotContent } from '../../test-utils.js';
import './define-nudge-banner.js';
import type { LoquixNudgeBanner } from './loquix-nudge-banner.js';

describe('loquix-nudge-banner', () => {
  it('renders banner with role=status', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner nudge-id="tip-1">Try a longer prompt!</loquix-nudge-banner>`,
    );
    const banner = getShadowPart(el, 'banner');
    expect(banner).to.exist;
    expect(banner!.getAttribute('role')).to.equal('status');
  });

  it('shows dismiss button when dismissible', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner dismissible>Tip content</loquix-nudge-banner>`,
    );
    const dismiss = getShadowPart(el, 'dismiss');
    expect(dismiss).to.exist;
    expect(dismiss!.getAttribute('aria-label')).to.equal('Dismiss');
  });

  it('dispatches loquix-nudge-dismiss on dismiss click', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner nudge-id="tip-1" dismissible>Tip</loquix-nudge-banner>`,
    );
    const dismiss = getShadowPart(el, 'dismiss')!;
    const eventPromise = waitForEvent(el, 'loquix-nudge-dismiss');
    dismiss.click();
    const event = await eventPromise;
    expect(event.detail.nudgeId).to.equal('tip-1');
    expect(el.hidden).to.be.true;
  });

  it('shows action button when action-label is set', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner action-label="Learn more">Tip</loquix-nudge-banner>`,
    );
    const actionBtn = getShadowPart(el, 'action-button');
    expect(actionBtn).to.exist;
    expect(actionBtn!.textContent).to.contain('Learn more');
  });

  it('dispatches loquix-nudge-action on action click', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner nudge-id="tip-1" action-label="Try it">Tip</loquix-nudge-banner>`,
    );
    const actionBtn = getShadowPart(el, 'action-button')!;
    const eventPromise = waitForEvent(el, 'loquix-nudge-action');
    actionBtn.click();
    const event = await eventPromise;
    expect(event.detail.nudgeId).to.equal('tip-1');
    expect(event.detail.action).to.equal('Try it');
  });

  it('reflects variant attribute', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner variant="warning">Watch out!</loquix-nudge-banner>`,
    );
    expect(el.variant).to.equal('warning');
    expect(el.getAttribute('variant')).to.equal('warning');
  });

  it('renders slotted message text', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner>Try a longer prompt for better results!</loquix-nudge-banner>`,
    );
    expect(el.textContent).to.contain('Try a longer prompt for better results!');
  });

  it('hides dismiss button when dismissible is false', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner .dismissible=${false}>Non-dismissible tip</loquix-nudge-banner>`,
    );
    const dismiss = getShadowPart(el, 'dismiss');
    expect(dismiss).to.not.exist;
  });

  it('banner is hidden after dismiss', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner nudge-id="tip-2" dismissible>Tip</loquix-nudge-banner>`,
    );
    expect(el.hidden).to.be.false;
    const dismiss = getShadowPart(el, 'dismiss')!;
    dismiss.click();
    expect(el.hidden).to.be.true;
  });

  it('dismiss button has localized aria-label', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner dismissible>Content</loquix-nudge-banner>`,
    );
    const dismiss = getShadowPart(el, 'dismiss');
    expect(dismiss).to.exist;
    const ariaLabel = dismiss!.getAttribute('aria-label');
    expect(ariaLabel).to.be.a('string');
    expect(ariaLabel!.length).to.be.greaterThan(0);
  });

  it('CSS part "banner" is queryable', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner>Content</loquix-nudge-banner>`,
    );
    const banner = getShadowPart(el, 'banner');
    expect(banner).to.exist;
    expect(banner!.classList.contains('banner')).to.be.true;
  });

  it('renders icon text when icon property is set', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner icon="💡">Helpful tip</loquix-nudge-banner>`,
    );
    const iconEl = el.shadowRoot!.querySelector('.icon');
    expect(iconEl).to.exist;
    expect(iconEl!.textContent).to.contain('💡');
  });

  it('renders icon slot for custom icon content', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner><span slot="icon">🔔</span>Alert content</loquix-nudge-banner>`,
    );
    const slotContent = getSlotContent(el, 'icon');
    expect(slotContent.length).to.equal(1);
    expect(slotContent[0].textContent).to.equal('🔔');
  });

  it('renders action slot for custom action content', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner><button slot="action">Custom</button>Tip</loquix-nudge-banner>`,
    );
    const slotContent = getSlotContent(el, 'action');
    expect(slotContent.length).to.equal(1);
    expect(slotContent[0].textContent).to.equal('Custom');
  });

  it('does not render action button when action-label is empty', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner>Just a tip</loquix-nudge-banner>`,
    );
    const actionBtn = getShadowPart(el, 'action-button');
    expect(actionBtn).to.not.exist;
  });

  it('defaults to tip variant', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner>Content</loquix-nudge-banner>`,
    );
    expect(el.variant).to.equal('tip');
    expect(el.getAttribute('variant')).to.equal('tip');
  });

  it('sets variant to info', async () => {
    const el = await fixture<LoquixNudgeBanner>(
      html`<loquix-nudge-banner variant="info">Info banner</loquix-nudge-banner>`,
    );
    expect(el.variant).to.equal('info');
    expect(el.getAttribute('variant')).to.equal('info');
  });
});
