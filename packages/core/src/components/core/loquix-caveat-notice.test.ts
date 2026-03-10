import { expect, fixture, html } from '@open-wc/testing';
import { getShadowPart } from '../../test-utils.js';
import { setLocale, resetLocale } from '../../i18n/index.js';
import './define-caveat-notice.js';
import type { LoquixCaveatNotice } from './loquix-caveat-notice.js';

describe('loquix-caveat-notice', () => {
  it('renders default caveat message', async () => {
    const el = await fixture<LoquixCaveatNotice>(
      html`<loquix-caveat-notice></loquix-caveat-notice>`,
    );
    const notice = getShadowPart(el, 'notice');
    expect(notice).to.exist;
    expect(notice!.textContent).to.contain('AI can make mistakes');
    expect(notice!.getAttribute('role')).to.equal('note');
  });

  it('uses custom message when set', async () => {
    const el = await fixture<LoquixCaveatNotice>(
      html`<loquix-caveat-notice message="Double-check this."></loquix-caveat-notice>`,
    );
    const notice = getShadowPart(el, 'notice')!;
    expect(notice.textContent).to.contain('Double-check this.');
  });

  it('shows warning icon only in contextual variant', async () => {
    const footerEl = await fixture<LoquixCaveatNotice>(
      html`<loquix-caveat-notice variant="footer"></loquix-caveat-notice>`,
    );
    // Footer variant should NOT show icon
    expect(footerEl.shadowRoot!.querySelector('.icon')).to.not.exist;

    const contextualEl = await fixture<LoquixCaveatNotice>(
      html`<loquix-caveat-notice variant="contextual"></loquix-caveat-notice>`,
    );
    // Contextual variant SHOULD show warning icon
    expect(contextualEl.shadowRoot!.querySelector('.icon')).to.exist;
  });

  it('contextual variant renders warning icon SVG', async () => {
    const el = await fixture<LoquixCaveatNotice>(
      html`<loquix-caveat-notice variant="contextual"></loquix-caveat-notice>`,
    );
    const icon = el.shadowRoot!.querySelector('.icon');
    expect(icon).to.exist;
    const svg = icon!.querySelector('svg');
    expect(svg).to.exist;
    expect(svg!.getAttribute('viewBox')).to.equal('0 0 24 24');
  });

  it('footer variant does NOT render icon', async () => {
    const el = await fixture<LoquixCaveatNotice>(
      html`<loquix-caveat-notice variant="footer"></loquix-caveat-notice>`,
    );
    expect(el.shadowRoot!.querySelector('.icon')).to.not.exist;
    expect(el.shadowRoot!.querySelector('svg')).to.not.exist;
  });

  it('variant attribute reflects to DOM', async () => {
    const el = await fixture<LoquixCaveatNotice>(
      html`<loquix-caveat-notice variant="contextual"></loquix-caveat-notice>`,
    );
    expect(el.getAttribute('variant')).to.equal('contextual');
    el.variant = 'footer';
    await el.updateComplete;
    expect(el.getAttribute('variant')).to.equal('footer');
  });

  it('custom message property overrides localized text', async () => {
    const el = await fixture<LoquixCaveatNotice>(
      html`<loquix-caveat-notice message="Custom warning"></loquix-caveat-notice>`,
    );
    const notice = getShadowPart(el, 'notice')!;
    expect(notice.textContent).to.contain('Custom warning');
    expect(notice.textContent).to.not.contain('AI can make mistakes');
  });

  it('aria-label on notice matches message text', async () => {
    const el = await fixture<LoquixCaveatNotice>(
      html`<loquix-caveat-notice message="Check results"></loquix-caveat-notice>`,
    );
    const notice = getShadowPart(el, 'notice')!;
    expect(notice.getAttribute('aria-label')).to.equal('Check results');
  });

  it('aria-label uses default localized message when no message property set', async () => {
    const el = await fixture<LoquixCaveatNotice>(
      html`<loquix-caveat-notice></loquix-caveat-notice>`,
    );
    const notice = getShadowPart(el, 'notice')!;
    expect(notice.getAttribute('aria-label')).to.equal(
      'AI can make mistakes. Check important info.',
    );
  });

  it('CSS part "notice" is queryable', async () => {
    const el = await fixture<LoquixCaveatNotice>(
      html`<loquix-caveat-notice></loquix-caveat-notice>`,
    );
    const notice = getShadowPart(el, 'notice');
    expect(notice).to.exist;
    expect(notice!.tagName.toLowerCase()).to.equal('div');
  });

  it('default localized message text renders when no message property set', async () => {
    const el = await fixture<LoquixCaveatNotice>(
      html`<loquix-caveat-notice></loquix-caveat-notice>`,
    );
    const notice = getShadowPart(el, 'notice')!;
    expect(notice.textContent).to.contain('AI can make mistakes. Check important info.');
  });

  it('role="note" is present on the notice div', async () => {
    const el = await fixture<LoquixCaveatNotice>(
      html`<loquix-caveat-notice></loquix-caveat-notice>`,
    );
    const notice = getShadowPart(el, 'notice')!;
    expect(notice.getAttribute('role')).to.equal('note');
  });

  it('responds to locale changes', async () => {
    const el = await fixture<LoquixCaveatNotice>(
      html`<loquix-caveat-notice></loquix-caveat-notice>`,
    );
    setLocale({ 'caveatNotice.message': "L'IA peut se tromper." });
    // Flush the microtask that schedules requestUpdate, then wait for re-render
    await new Promise(r => queueMicrotask(r));
    await el.updateComplete;
    const notice = getShadowPart(el, 'notice')!;
    expect(notice.textContent).to.contain("L'IA peut se tromper.");
    resetLocale();
  });
});
