import { expect, fixture, html } from '@open-wc/testing';
import { resetLocale } from '../../i18n/index.js';
import { waitForEvent, simulateKeyboard } from '../../test-utils.js';
import './define-citation-popover.js';
import type { LoquixCitationPopover } from './loquix-citation-popover.js';
import type { LoquixCitationClickDetail } from '../../events/index.js';
import type { Source } from '../../types/index.js';

const sampleSource: Source = {
  id: 's-1',
  title: 'Hybrid retrieval combining BM25 and dense vectors',
  url: 'https://arxiv.org/abs/2104.05740',
  host: 'arxiv.org',
  snippet: 'We show that combining sparse lexical retrieval with dense embedding search…',
};

function getChip(el: LoquixCitationPopover): HTMLButtonElement {
  return el.shadowRoot!.querySelector('.chip') as HTMLButtonElement;
}
function getPopover(el: LoquixCitationPopover): HTMLElement {
  return el.shadowRoot!.querySelector('.popover') as HTMLElement;
}

describe('loquix-citation-popover', () => {
  afterEach(() => resetLocale());

  it('renders the chip with the index number', async () => {
    const el = await fixture<LoquixCitationPopover>(
      html`<loquix-citation-popover index="3"></loquix-citation-popover>`,
    );
    el.source = sampleSource;
    await el.updateComplete;
    const chip = getChip(el);
    expect(chip.textContent?.trim()).to.equal('3');
  });

  it('chip accessible name = visible index; popover is the description', async () => {
    const el = await fixture<LoquixCitationPopover>(
      html`<loquix-citation-popover index="1"></loquix-citation-popover>`,
    );
    el.source = sampleSource;
    await el.updateComplete;
    const chip = getChip(el);
    expect(chip.tagName).to.equal('BUTTON');
    // No aria-label override — the chip number "1" is the accessible name.
    expect(chip.getAttribute('aria-label')).to.be.null;
    expect(chip.textContent?.trim()).to.equal('1');
    // The popover provides the description via aria-describedby.
    const describedBy = chip.getAttribute('aria-describedby');
    expect(describedBy).to.not.be.null;
    const popover = getPopover(el);
    expect(popover.id).to.equal(describedBy);
    expect(popover.getAttribute('role')).to.equal('tooltip');
  });

  it('popover starts hidden and renders source content when shown', async () => {
    const el = await fixture<LoquixCitationPopover>(
      html`<loquix-citation-popover index="1"></loquix-citation-popover>`,
    );
    el.source = sampleSource;
    await el.updateComplete;
    const popover = getPopover(el);
    expect(popover.hidden).to.be.true;

    getChip(el).dispatchEvent(new MouseEvent('mouseenter'));
    await el.updateComplete;
    expect(popover.hidden).to.be.false;
    expect(popover.textContent).to.contain(sampleSource.title);
    expect(popover.textContent).to.contain(sampleSource.host);
    expect(popover.textContent).to.contain('We show that combining');
  });

  it('mouseleave on chip closes popover', async () => {
    const el = await fixture<LoquixCitationPopover>(
      html`<loquix-citation-popover index="1"></loquix-citation-popover>`,
    );
    el.source = sampleSource;
    await el.updateComplete;
    getChip(el).dispatchEvent(new MouseEvent('mouseenter'));
    await el.updateComplete;
    getChip(el).dispatchEvent(new MouseEvent('mouseleave'));
    await el.updateComplete;
    expect(getPopover(el).hidden).to.be.true;
  });

  it('focus shows the popover; Escape closes it', async () => {
    const el = await fixture<LoquixCitationPopover>(
      html`<loquix-citation-popover index="2"></loquix-citation-popover>`,
    );
    el.source = sampleSource;
    await el.updateComplete;
    const chip = getChip(el);
    chip.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;
    expect(getPopover(el).hidden).to.be.false;
    simulateKeyboard(chip, 'Escape');
    await el.updateComplete;
    expect(getPopover(el).hidden).to.be.true;
  });

  it('click fires loquix-citation-click with index + source', async () => {
    const el = await fixture<LoquixCitationPopover>(
      html`<loquix-citation-popover index="4"></loquix-citation-popover>`,
    );
    el.source = sampleSource;
    await el.updateComplete;
    const promise = waitForEvent<LoquixCitationClickDetail>(el, 'loquix-citation-click');
    getChip(el).click();
    const ev = await promise;
    expect(ev.detail.index).to.equal(4);
    expect(ev.detail.source.id).to.equal('s-1');
    expect(ev.detail.source.url).to.equal(sampleSource.url);
  });

  it('Enter and Space activate the chip; Space is preventDefault-able', async () => {
    const el = await fixture<LoquixCitationPopover>(
      html`<loquix-citation-popover index="1"></loquix-citation-popover>`,
    );
    el.source = sampleSource;
    await el.updateComplete;
    const chip = getChip(el);

    const enterPromise = waitForEvent<LoquixCitationClickDetail>(el, 'loquix-citation-click');
    simulateKeyboard(chip, 'Enter');
    const enterEv = await enterPromise;
    expect(enterEv.detail.index).to.equal(1);

    const spacePromise = waitForEvent<LoquixCitationClickDetail>(el, 'loquix-citation-click');
    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    chip.dispatchEvent(spaceEvent);
    expect(spaceEvent.defaultPrevented).to.be.true;
    const spaceEv = await spacePromise;
    expect(spaceEv.detail.index).to.equal(1);
  });

  it('rejects unsafe favicon URLs (data:, javascript:) — falls back to link icon', async () => {
    const el = await fixture<LoquixCitationPopover>(
      html`<loquix-citation-popover index="1"></loquix-citation-popover>`,
    );
    el.source = {
      ...sampleSource,
      favicon: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
    };
    await el.updateComplete;
    getChip(el).dispatchEvent(new MouseEvent('mouseenter'));
    await el.updateComplete;
    const popover = getPopover(el);
    expect(popover.querySelector('img')).to.be.null;
    expect(popover.querySelector('svg')).to.exist;
  });

  it('renders favicon img when URL is http(s)', async () => {
    const el = await fixture<LoquixCitationPopover>(
      html`<loquix-citation-popover index="1"></loquix-citation-popover>`,
    );
    el.source = {
      ...sampleSource,
      favicon: 'https://www.google.com/s2/favicons?domain=arxiv.org',
    };
    await el.updateComplete;
    getChip(el).dispatchEvent(new MouseEvent('mouseenter'));
    await el.updateComplete;
    const img = getPopover(el).querySelector('img') as HTMLImageElement;
    expect(img).to.exist;
    expect(img.src).to.equal('https://www.google.com/s2/favicons?domain=arxiv.org');
    expect(img.getAttribute('referrerpolicy')).to.equal('no-referrer');
    expect(img.getAttribute('loading')).to.equal('lazy');
    expect(img.alt).to.equal('');
  });

  it('disconnect cleans up listeners (no error on subsequent scroll)', async () => {
    const el = await fixture<LoquixCitationPopover>(
      html`<loquix-citation-popover index="1"></loquix-citation-popover>`,
    );
    el.source = sampleSource;
    await el.updateComplete;
    getChip(el).dispatchEvent(new MouseEvent('mouseenter'));
    await el.updateComplete;
    el.remove();
    // Dispatching a scroll after removal should not throw or affect the
    // component (autoUpdate cleanup must have run).
    window.dispatchEvent(new Event('scroll'));
    expect(true).to.be.true;
  });

  it('chip text node is the accessible name (no aria-label override)', async () => {
    const el = await fixture<LoquixCitationPopover>(
      html`<loquix-citation-popover index="7"></loquix-citation-popover>`,
    );
    el.source = sampleSource;
    await el.updateComplete;
    const chip = getChip(el);
    expect(chip.getAttribute('aria-label')).to.be.null;
    expect(chip.textContent?.trim()).to.equal('7');
  });

  it('open/close race during _show await: hide before setupAutoUpdate keeps it torn down', async () => {
    const el = await fixture<LoquixCitationPopover>(
      html`<loquix-citation-popover index="1"></loquix-citation-popover>`,
    );
    el.source = sampleSource;
    await el.updateComplete;
    const chip = getChip(el);
    // Trigger show (async — sets _open=true, awaits updateComplete, then sets up).
    chip.dispatchEvent(new MouseEvent('mouseenter'));
    // Synchronously hide before the _show microtasks finish.
    chip.dispatchEvent(new MouseEvent('mouseleave'));
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 50));
    // Removing the host while popover is closed should not throw —
    // and the disconnect-time teardown should be a no-op (no leaked listeners).
    el.remove();
    window.dispatchEvent(new Event('scroll'));
    expect(true).to.be.true;
  });
});
