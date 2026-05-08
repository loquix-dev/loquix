import { expect, fixture, html } from '@open-wc/testing';
import { setLocale, resetLocale } from '../../i18n/index.js';
import { getShadowPart, waitForEvent } from '../../test-utils.js';
import './define-disagreement-marker.js';
import type { LoquixDisagreementMarker } from './loquix-disagreement-marker.js';

describe('loquix-disagreement-marker', () => {
  afterEach(() => resetLocale());

  it('renders inline pill by default', async () => {
    const el = await fixture<LoquixDisagreementMarker>(
      html`<loquix-disagreement-marker></loquix-disagreement-marker>`,
    );
    expect(el.variant).to.equal('inline');
    const marker = getShadowPart(el, 'marker')!;
    expect(marker.classList.contains('pill')).to.be.true;
    expect(marker.getAttribute('role')).to.equal('status');
  });

  it('renders banner variant', async () => {
    const el = await fixture<LoquixDisagreementMarker>(
      html`<loquix-disagreement-marker variant="banner"></loquix-disagreement-marker>`,
    );
    const marker = getShadowPart(el, 'marker')!;
    expect(marker.classList.contains('banner')).to.be.true;
    expect(marker.getAttribute('role')).to.equal('status');
    const title = getShadowPart(el, 'title')!;
    expect(title.textContent?.trim()).to.equal('User disagreed with this response');
  });

  it('reflects variant attribute', async () => {
    const el = await fixture<LoquixDisagreementMarker>(
      html`<loquix-disagreement-marker variant="banner"></loquix-disagreement-marker>`,
    );
    expect(el.getAttribute('variant')).to.equal('banner');
  });

  it('inline pill includes the localised label', async () => {
    const el = await fixture<LoquixDisagreementMarker>(
      html`<loquix-disagreement-marker></loquix-disagreement-marker>`,
    );
    const marker = getShadowPart(el, 'marker')!;
    expect(marker.textContent?.trim()).to.contain('Disagreement');
  });

  it('inline pill appends the reason after the label', async () => {
    const el = await fixture<LoquixDisagreementMarker>(
      html`<loquix-disagreement-marker reason="figure was outdated"></loquix-disagreement-marker>`,
    );
    const marker = getShadowPart(el, 'marker')!;
    expect(marker.textContent?.trim()).to.contain('Disagreement');
    expect(marker.textContent?.trim()).to.contain('figure was outdated');
  });

  it('banner shows reason text when provided', async () => {
    const el = await fixture<LoquixDisagreementMarker>(
      html`<loquix-disagreement-marker
        variant="banner"
        reason="The reported figure conflicts with the Q3 transcript."
      ></loquix-disagreement-marker>`,
    );
    const reason = getShadowPart(el, 'reason')!;
    expect(reason.textContent?.trim()).to.equal(
      'The reported figure conflicts with the Q3 transcript.',
    );
  });

  it('banner hides reason part when no reason is set', async () => {
    const el = await fixture<LoquixDisagreementMarker>(
      html`<loquix-disagreement-marker variant="banner"></loquix-disagreement-marker>`,
    );
    expect(getShadowPart(el, 'reason')).to.be.null;
  });

  it('resolve button is hidden by default', async () => {
    const el = await fixture<LoquixDisagreementMarker>(
      html`<loquix-disagreement-marker variant="banner"></loquix-disagreement-marker>`,
    );
    expect(getShadowPart(el, 'resolve')).to.be.null;
  });

  it('resolve button shows when resolvable is set', async () => {
    const el = await fixture<LoquixDisagreementMarker>(
      html`<loquix-disagreement-marker variant="banner" resolvable></loquix-disagreement-marker>`,
    );
    const btn = getShadowPart(el, 'resolve')!;
    expect(btn).to.exist;
    expect(btn.textContent?.trim()).to.equal('Mark resolved');
  });

  it('resolve button fires loquix-disagreement-resolve', async () => {
    const el = await fixture<LoquixDisagreementMarker>(
      html`<loquix-disagreement-marker variant="banner" resolvable></loquix-disagreement-marker>`,
    );
    const btn = getShadowPart(el, 'resolve')! as HTMLButtonElement;
    const promise = waitForEvent(el, 'loquix-disagreement-resolve');
    btn.click();
    const ev = await promise;
    expect(ev).to.exist;
  });

  it('inline variant does not render slotted content', async () => {
    const el = await fixture<LoquixDisagreementMarker>(
      html`<loquix-disagreement-marker
        ><span class="extra">extra</span></loquix-disagreement-marker
      >`,
    );
    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).to.be.null;
  });

  it('banner renders default slot for extra content', async () => {
    const el = await fixture<LoquixDisagreementMarker>(
      html`<loquix-disagreement-marker variant="banner"
        ><span class="extra">extra</span></loquix-disagreement-marker
      >`,
    );
    const slot = el.shadowRoot?.querySelector('slot') as HTMLSlotElement;
    expect(slot).to.exist;
    const assigned = slot.assignedElements() as HTMLElement[];
    expect(assigned[0].textContent?.trim()).to.equal('extra');
  });

  it('updates banner title when locale changes', async () => {
    const el = await fixture<LoquixDisagreementMarker>(
      html`<loquix-disagreement-marker variant="banner"></loquix-disagreement-marker>`,
    );
    setLocale({ 'disagreementMarker.title': 'Désaccord utilisateur' });
    await new Promise(r => queueMicrotask(r));
    await el.updateComplete;
    const title = getShadowPart(el, 'title')!;
    expect(title.textContent?.trim()).to.equal('Désaccord utilisateur');
  });
});
