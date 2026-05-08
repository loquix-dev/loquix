import { expect, fixture, html } from '@open-wc/testing';
import { setLocale, resetLocale } from '../../i18n/index.js';
import { getShadowPart } from '../../test-utils.js';
import './define-confidence-indicator.js';
import type { LoquixConfidenceIndicator } from './loquix-confidence-indicator.js';

describe('loquix-confidence-indicator', () => {
  afterEach(() => resetLocale());

  it('renders bar variant by default with derived medium level', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator value="0.55"></loquix-confidence-indicator>`,
    );
    expect(el.variant).to.equal('bar');
    expect(el.effectiveLevel).to.equal('medium');
    const meter = getShadowPart(el, 'meter')!;
    expect(meter.classList.contains('bar')).to.be.true;
    expect(meter.classList.contains('bar--medium')).to.be.true;
    expect(meter.getAttribute('role')).to.equal('meter');
  });

  it('derives low level for value below low threshold', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator value="0.2"></loquix-confidence-indicator>`,
    );
    expect(el.effectiveLevel).to.equal('low');
  });

  it('derives high level for value at or above high threshold', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator value="0.9"></loquix-confidence-indicator>`,
    );
    expect(el.effectiveLevel).to.equal('high');
  });

  it('explicit level overrides derivation', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator value="0.9" level="low"></loquix-confidence-indicator>`,
    );
    expect(el.effectiveLevel).to.equal('low');
    const meter = getShadowPart(el, 'meter')!;
    expect(meter.classList.contains('bar--low')).to.be.true;
  });

  it('renders dots variant with correct number of filled dots', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator value="0.6" variant="dots"></loquix-confidence-indicator>`,
    );
    const dots = el.shadowRoot!.querySelectorAll('.dots__dot');
    expect(dots.length).to.equal(5);
    const filled = el.shadowRoot!.querySelectorAll('.dots__dot.is-on');
    expect(filled.length).to.equal(3);
  });

  it('dots variant shows 0 filled at value=0 and 5 at value=1', async () => {
    const zero = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator value="0" variant="dots"></loquix-confidence-indicator>`,
    );
    expect(zero.shadowRoot!.querySelectorAll('.dots__dot.is-on').length).to.equal(0);

    const one = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator value="1" variant="dots"></loquix-confidence-indicator>`,
    );
    expect(one.shadowRoot!.querySelectorAll('.dots__dot.is-on').length).to.equal(5);
  });

  it('renders badge variant', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator
        value="0.85"
        variant="badge"
      ></loquix-confidence-indicator>`,
    );
    const meter = getShadowPart(el, 'meter')!;
    expect(meter.classList.contains('badge')).to.be.true;
    const value = getShadowPart(el, 'value')!;
    expect(value.textContent).to.equal('85%');
  });

  it('renders numeric variant', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator
        value="0.5"
        variant="numeric"
      ></loquix-confidence-indicator>`,
    );
    const meter = getShadowPart(el, 'meter')!;
    expect(meter.classList.contains('num')).to.be.true;
    const value = getShadowPart(el, 'value')!;
    expect(value.textContent?.replace(/\s/g, '')).to.equal('50%');
  });

  it('reflects variant attribute', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator variant="dots"></loquix-confidence-indicator>`,
    );
    expect(el.getAttribute('variant')).to.equal('dots');
  });

  it('parses kebab-case low-threshold and high-threshold attributes', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator
        value="0.5"
        low-threshold="0.3"
        high-threshold="0.6"
      ></loquix-confidence-indicator>`,
    );
    expect(el.lowThreshold).to.equal(0.3);
    expect(el.highThreshold).to.equal(0.6);
    expect(el.effectiveLevel).to.equal('medium');
  });

  it('inverted thresholds fall back to defaults so derivation tracks value', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator
        value="0.9"
        low-threshold="0.8"
        high-threshold="0.4"
      ></loquix-confidence-indicator>`,
    );
    expect(el.effectiveLevel).to.equal('high');
  });

  it('out-of-range thresholds fall back to defaults', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(html`
      <loquix-confidence-indicator
        value="0.9"
        low-threshold="-1"
        high-threshold="2"
      ></loquix-confidence-indicator>
    `);
    // Both thresholds are out of [0, 1]; should reset to defaults so derivation tracks value.
    expect(el.effectiveLevel).to.equal('high');
  });

  it('non-finite thresholds fall back to defaults', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator value="0.9"></loquix-confidence-indicator>`,
    );
    el.lowThreshold = Number.NaN;
    el.highThreshold = Number.NaN;
    await el.updateComplete;
    expect(el.effectiveLevel).to.equal('high');
  });

  it('clamps value=0 → low and renders 0%', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator value="0"></loquix-confidence-indicator>`,
    );
    expect(el.effectiveLevel).to.equal('low');
    const meter = getShadowPart(el, 'meter')!;
    expect(meter.getAttribute('aria-valuenow')).to.equal('0');
  });

  it('clamps value=1 → high and renders 100%', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator value="1"></loquix-confidence-indicator>`,
    );
    expect(el.effectiveLevel).to.equal('high');
    const meter = getShadowPart(el, 'meter')!;
    expect(meter.getAttribute('aria-valuenow')).to.equal('100');
  });

  it('clamps out-of-range values', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator value="1.5"></loquix-confidence-indicator>`,
    );
    const meter = getShadowPart(el, 'meter')!;
    expect(meter.getAttribute('aria-valuenow')).to.equal('100');
  });

  it('exposes ARIA meter attributes including aria-valuetext', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator value="0.9"></loquix-confidence-indicator>`,
    );
    const meter = getShadowPart(el, 'meter')!;
    expect(meter.getAttribute('role')).to.equal('meter');
    expect(meter.getAttribute('aria-valuemin')).to.equal('0');
    expect(meter.getAttribute('aria-valuemax')).to.equal('100');
    expect(meter.getAttribute('aria-valuetext')).to.equal('high');
  });

  it('uses provided label as aria-label', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator
        value="0.5"
        label="Source quality"
      ></loquix-confidence-indicator>`,
    );
    const meter = getShadowPart(el, 'meter')!;
    expect(meter.getAttribute('aria-label')).to.equal('Source quality');
  });

  it('falls back to localised default label', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator value="0.5"></loquix-confidence-indicator>`,
    );
    const meter = getShadowPart(el, 'meter')!;
    expect(meter.getAttribute('aria-label')).to.equal('Confidence');
  });

  it('hides numeric value when show-value is false on bar', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(html`
      <loquix-confidence-indicator value="0.5" .showValue=${false}></loquix-confidence-indicator>
    `);
    expect(getShadowPart(el, 'value')).to.be.null;
  });

  it('updates visible aria-valuetext when locale changes', async () => {
    const el = await fixture<LoquixConfidenceIndicator>(
      html`<loquix-confidence-indicator value="0.9"></loquix-confidence-indicator>`,
    );
    const meter = getShadowPart(el, 'meter')!;
    expect(meter.getAttribute('aria-valuetext')).to.equal('high');

    setLocale({ 'confidenceIndicator.levelHigh': 'high confidence' });
    await new Promise(r => queueMicrotask(r));
    await el.updateComplete;
    expect(getShadowPart(el, 'meter')!.getAttribute('aria-valuetext')).to.equal('high confidence');
  });
});
