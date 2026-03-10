import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart } from '../../test-utils.js';
import './define-action-feedback.js';
import type { LoquixActionFeedback } from './loquix-action-feedback.js';

describe('loquix-action-feedback', () => {
  it('renders positive (thumbs up) by default', async () => {
    const el = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback></loquix-action-feedback>`,
    );
    expect(el.sentiment).to.equal('positive');
    expect(el.active).to.be.false;
    const btn = getShadowPart(el, 'button');
    expect(btn).to.exist;
    expect(btn!.getAttribute('aria-label')).to.equal('Good response');
    expect(btn!.getAttribute('aria-pressed')).to.equal('false');
  });

  it('renders negative (thumbs down)', async () => {
    const el = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback sentiment="negative"></loquix-action-feedback>`,
    );
    expect(el.sentiment).to.equal('negative');
    const btn = getShadowPart(el, 'button')!;
    expect(btn.getAttribute('aria-label')).to.equal('Bad response');
  });

  it('dispatches loquix-feedback on click', async () => {
    const el = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback sentiment="positive"></loquix-action-feedback>`,
    );
    const btn = getShadowPart(el, 'button')!;
    const eventPromise = waitForEvent(el, 'loquix-feedback');
    btn.click();
    const event = await eventPromise;
    expect(event.detail.sentiment).to.equal('positive');
  });

  it('toggles active state on click', async () => {
    const el = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback></loquix-action-feedback>`,
    );
    const btn = getShadowPart(el, 'button')!;

    btn.click();
    expect(el.active).to.be.true;
    await el.updateComplete;
    expect(getShadowPart(el, 'button')!.getAttribute('aria-pressed')).to.equal('true');

    btn.click();
    expect(el.active).to.be.false;
  });

  it('reflects sentiment attribute', async () => {
    const el = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback sentiment="negative"></loquix-action-feedback>`,
    );
    expect(el.getAttribute('sentiment')).to.equal('negative');
  });

  it('reflects active attribute', async () => {
    const el = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback active></loquix-action-feedback>`,
    );
    expect(el.active).to.be.true;
    expect(el.hasAttribute('active')).to.be.true;
  });

  it('does not dispatch when disabled', async () => {
    const el = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback disabled></loquix-action-feedback>`,
    );
    let fired = false;
    el.addEventListener('loquix-feedback', () => {
      fired = true;
    });
    const btn = getShadowPart(el, 'button')!;
    btn.click();
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('renders different SVG for positive vs negative', async () => {
    const pos = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback sentiment="positive"></loquix-action-feedback>`,
    );
    const neg = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback sentiment="negative"></loquix-action-feedback>`,
    );
    const posSvg = getShadowPart(pos, 'button')!.querySelector('svg path')!.getAttribute('d');
    const negSvg = getShadowPart(neg, 'button')!.querySelector('svg path')!.getAttribute('d');
    expect(posSvg).to.not.equal(negSvg);
  });

  // --- Toggle off (deactivate) ---

  it('clicking same sentiment twice toggles off (deactivate)', async () => {
    const el = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback sentiment="positive"></loquix-action-feedback>`,
    );
    const btn = getShadowPart(el, 'button')!;

    btn.click();
    expect(el.active).to.be.true;

    btn.click();
    expect(el.active).to.be.false;
    await el.updateComplete;
    expect(getShadowPart(el, 'button')!.getAttribute('aria-pressed')).to.equal('false');
  });

  // --- aria-pressed ---

  it('aria-pressed reflects active state correctly', async () => {
    const el = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback></loquix-action-feedback>`,
    );
    const btn = getShadowPart(el, 'button')!;
    expect(btn.getAttribute('aria-pressed')).to.equal('false');

    btn.click();
    await el.updateComplete;
    expect(getShadowPart(el, 'button')!.getAttribute('aria-pressed')).to.equal('true');

    btn.click();
    await el.updateComplete;
    expect(getShadowPart(el, 'button')!.getAttribute('aria-pressed')).to.equal('false');
  });

  // --- Disabled prevents active state change ---

  it('disabled state prevents active state change on click', async () => {
    const el = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback disabled></loquix-action-feedback>`,
    );
    expect(el.active).to.be.false;
    const btn = getShadowPart(el, 'button')!;
    btn.click();
    await new Promise(r => setTimeout(r, 50));
    expect(el.active).to.be.false;
  });

  // --- Localization aria-labels ---

  it('positive button has correct aria-label from localization', async () => {
    const el = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback sentiment="positive"></loquix-action-feedback>`,
    );
    const btn = getShadowPart(el, 'button')!;
    expect(btn.getAttribute('aria-label')).to.equal('Good response');
  });

  it('negative button has correct aria-label from localization', async () => {
    const el = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback sentiment="negative"></loquix-action-feedback>`,
    );
    const btn = getShadowPart(el, 'button')!;
    expect(btn.getAttribute('aria-label')).to.equal('Bad response');
  });

  // --- SVG icons ---

  it('SVG icon has aria-hidden attribute', async () => {
    const el = await fixture<LoquixActionFeedback>(
      html`<loquix-action-feedback sentiment="positive"></loquix-action-feedback>`,
    );
    const svg = getShadowPart(el, 'button')!.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).to.equal('true');
  });

  // --- Mutual exclusion ---

  it('mutual exclusion: clicking positive when negative is active switches state', async () => {
    const container = await fixture<HTMLDivElement>(
      html`<div>
        <loquix-action-feedback sentiment="positive"></loquix-action-feedback>
        <loquix-action-feedback sentiment="negative"></loquix-action-feedback>
      </div>`,
    );
    const posEl = container.querySelector(
      'loquix-action-feedback[sentiment="positive"]',
    ) as LoquixActionFeedback;
    const negEl = container.querySelector(
      'loquix-action-feedback[sentiment="negative"]',
    ) as LoquixActionFeedback;

    // Activate negative first
    const negBtn = getShadowPart(negEl, 'button')!;
    negBtn.click();
    expect(negEl.active).to.be.true;

    // Now activate positive — should deactivate negative
    const posBtn = getShadowPart(posEl, 'button')!;
    posBtn.click();
    expect(posEl.active).to.be.true;
    expect(negEl.active).to.be.false;
  });

  it('mutual exclusion: clicking negative when positive is active switches state', async () => {
    const container = await fixture<HTMLDivElement>(
      html`<div>
        <loquix-action-feedback sentiment="positive"></loquix-action-feedback>
        <loquix-action-feedback sentiment="negative"></loquix-action-feedback>
      </div>`,
    );
    const posEl = container.querySelector(
      'loquix-action-feedback[sentiment="positive"]',
    ) as LoquixActionFeedback;
    const negEl = container.querySelector(
      'loquix-action-feedback[sentiment="negative"]',
    ) as LoquixActionFeedback;

    // Activate positive first
    const posBtn = getShadowPart(posEl, 'button')!;
    posBtn.click();
    expect(posEl.active).to.be.true;

    // Now activate negative — should deactivate positive
    const negBtn = getShadowPart(negEl, 'button')!;
    negBtn.click();
    expect(negEl.active).to.be.true;
    expect(posEl.active).to.be.false;
  });
});
