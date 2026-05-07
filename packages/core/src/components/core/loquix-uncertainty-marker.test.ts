import { expect, fixture, html } from '@open-wc/testing';
import { setLocale, resetLocale } from '../../i18n/index.js';
import { getShadowPart, waitForEvent, simulateKeyboard } from '../../test-utils.js';
import './define-uncertainty-marker.js';
import type { LoquixUncertaintyMarker } from './loquix-uncertainty-marker.js';

describe('loquix-uncertainty-marker', () => {
  afterEach(() => resetLocale());

  it('renders with defaults (kind=unsure, variant=underline)', async () => {
    const el = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker>around 3.1%</loquix-uncertainty-marker>`,
    );
    expect(el.kind).to.equal('unsure');
    expect(el.variant).to.equal('underline');
    const marker = getShadowPart(el, 'marker')!;
    expect(marker.classList.contains('marker--underline')).to.be.true;
    expect(marker.classList.contains('marker--unsure')).to.be.true;
  });

  it('reflects kind and variant attributes', async () => {
    const el = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker kind="speculative" variant="icon"
        >maybe</loquix-uncertainty-marker
      >`,
    );
    expect(el.getAttribute('kind')).to.equal('speculative');
    expect(el.getAttribute('variant')).to.equal('icon');
    const marker = getShadowPart(el, 'marker')!;
    expect(marker.classList.contains('marker--speculative')).to.be.true;
    expect(marker.classList.contains('marker--icon')).to.be.true;
  });

  it('renders icon only for icon variant', async () => {
    const underline = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker variant="underline">x</loquix-uncertainty-marker>`,
    );
    const icon1 = getShadowPart(underline, 'icon');
    expect(icon1).to.be.null;

    const iconVariant = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker variant="icon">x</loquix-uncertainty-marker>`,
    );
    const icon2 = getShadowPart(iconVariant, 'icon');
    expect(icon2).to.exist;
    expect(icon2!.querySelector('svg')).to.exist;
  });

  it('marker is keyboard-focusable button', async () => {
    const el = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker>x</loquix-uncertainty-marker>`,
    );
    const marker = getShadowPart(el, 'marker')!;
    expect(marker.getAttribute('tabindex')).to.equal('0');
    expect(marker.getAttribute('role')).to.equal('button');
  });

  it('uses aria-describedby (not aria-label) so slotted text stays the accessible name', async () => {
    const el = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker kind="unsure">around 3.1%</loquix-uncertainty-marker>`,
    );
    const marker = getShadowPart(el, 'marker')!;
    expect(marker.getAttribute('aria-label')).to.be.null;
    const describedBy = marker.getAttribute('aria-describedby');
    expect(describedBy).to.not.be.null;
    const tooltip = getShadowPart(el, 'tooltip')!;
    expect(tooltip.id).to.equal(describedBy);
    expect(tooltip.getAttribute('role')).to.equal('tooltip');
  });

  it('default tooltip text uses i18n key for kind', async () => {
    const el = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker kind="needs-verification">x</loquix-uncertainty-marker>`,
    );
    const tooltip = getShadowPart(el, 'tooltip')!;
    expect(tooltip.textContent?.trim()).to.equal('This statement needs verification');
  });

  it('explicit reason overrides default tooltip', async () => {
    const el = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker
        kind="unsure"
        reason="Source is from 2018; recent figures may differ"
        >x</loquix-uncertainty-marker
      >`,
    );
    const tooltip = getShadowPart(el, 'tooltip')!;
    expect(tooltip.textContent?.trim()).to.equal('Source is from 2018; recent figures may differ');
  });

  it('shows tooltip on mouseenter and hides on mouseleave', async () => {
    const el = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker>x</loquix-uncertainty-marker>`,
    );
    const marker = getShadowPart(el, 'marker')!;
    const tooltip = getShadowPart(el, 'tooltip')!;

    expect(tooltip.classList.contains('is-open')).to.be.false;

    marker.dispatchEvent(new MouseEvent('mouseenter'));
    await el.updateComplete;
    expect(tooltip.classList.contains('is-open')).to.be.true;

    marker.dispatchEvent(new MouseEvent('mouseleave'));
    await el.updateComplete;
    expect(tooltip.classList.contains('is-open')).to.be.false;
  });

  it('shows tooltip on focus and hides on blur', async () => {
    const el = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker>x</loquix-uncertainty-marker>`,
    );
    const marker = getShadowPart(el, 'marker')! as HTMLElement;
    const tooltip = getShadowPart(el, 'tooltip')!;

    marker.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;
    expect(tooltip.classList.contains('is-open')).to.be.true;

    marker.dispatchEvent(new FocusEvent('blur'));
    await el.updateComplete;
    expect(tooltip.classList.contains('is-open')).to.be.false;
  });

  it('Escape closes the tooltip', async () => {
    const el = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker>x</loquix-uncertainty-marker>`,
    );
    const marker = getShadowPart(el, 'marker')!;
    const tooltip = getShadowPart(el, 'tooltip')!;

    marker.dispatchEvent(new MouseEvent('mouseenter'));
    await el.updateComplete;
    expect(tooltip.classList.contains('is-open')).to.be.true;

    simulateKeyboard(marker, 'Escape');
    await el.updateComplete;
    expect(tooltip.classList.contains('is-open')).to.be.false;
  });

  it('click fires loquix-uncertainty-click with correct detail', async () => {
    const el = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker kind="speculative">x</loquix-uncertainty-marker>`,
    );
    const marker = getShadowPart(el, 'marker')! as HTMLElement;
    const promise = waitForEvent<{ kind: string; reason?: string }>(el, 'loquix-uncertainty-click');
    marker.click();
    const ev = await promise;
    expect(ev.detail.kind).to.equal('speculative');
  });

  it('Enter activation fires the event', async () => {
    const el = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker kind="unsure" reason="check">x</loquix-uncertainty-marker>`,
    );
    const marker = getShadowPart(el, 'marker')!;
    const promise = waitForEvent<{ kind: string; reason?: string }>(el, 'loquix-uncertainty-click');
    simulateKeyboard(marker, 'Enter');
    const ev = await promise;
    expect(ev.detail.kind).to.equal('unsure');
    expect(ev.detail.reason).to.equal('check');
  });

  it('Space activation fires the event and is preventDefault-able', async () => {
    const el = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker>x</loquix-uncertainty-marker>`,
    );
    const marker = getShadowPart(el, 'marker')!;
    const promise = waitForEvent<{ kind: string }>(el, 'loquix-uncertainty-click');

    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    marker.dispatchEvent(spaceEvent);
    expect(spaceEvent.defaultPrevented).to.be.true;

    const ev = await promise;
    expect(ev.detail.kind).to.equal('unsure');
  });

  it('updates tooltip text when locale changes', async () => {
    const el = await fixture<LoquixUncertaintyMarker>(
      html`<loquix-uncertainty-marker kind="unsure">x</loquix-uncertainty-marker>`,
    );
    const tooltip = getShadowPart(el, 'tooltip')!;
    expect(tooltip.textContent?.trim()).to.equal('Model is uncertain about this claim');

    setLocale({ 'uncertaintyMarker.tipUnsure': 'Modèle incertain' });
    await new Promise(r => queueMicrotask(r));
    await el.updateComplete;
    expect(getShadowPart(el, 'tooltip')!.textContent?.trim()).to.equal('Modèle incertain');
  });
});
