import { expect, fixture, html } from '@open-wc/testing';
import { setLocale, resetLocale } from '../../i18n/index.js';
import { getShadowPart, waitForEvent } from '../../test-utils.js';
import './define-tool-call-list.js';
import './define-tool-call.js';
import type { LoquixToolCallList } from './loquix-tool-call-list.js';
import type { LoquixToolGroupToggleDetail } from '../../events/index.js';

describe('loquix-tool-call-list', () => {
  afterEach(() => resetLocale());

  it('renders an empty list with default summary', async () => {
    const el = await fixture<LoquixToolCallList>(
      html`<loquix-tool-call-list></loquix-tool-call-list>`,
    );
    await el.updateComplete;
    const summary = getShadowPart(el, 'summary')!;
    expect(summary.textContent?.trim()).to.equal('Used 0 tools');
  });

  it('counts only loquix-tool-call children, ignores whitespace and other tags', async () => {
    const el = await fixture<LoquixToolCallList>(html`
      <loquix-tool-call-list>
        <loquix-tool-call name="a"></loquix-tool-call>
        <div>not a tool</div>
        <loquix-tool-call name="b"></loquix-tool-call>
        <loquix-tool-call name="c"></loquix-tool-call>
      </loquix-tool-call-list>
    `);
    await el.updateComplete;
    const summary = getShadowPart(el, 'summary')!;
    expect(summary.textContent?.trim()).to.equal('Used 3 tools');
  });

  it('uses singular "Used 1 tool" when count is exactly 1', async () => {
    const el = await fixture<LoquixToolCallList>(html`
      <loquix-tool-call-list>
        <loquix-tool-call name="only"></loquix-tool-call>
      </loquix-tool-call-list>
    `);
    await el.updateComplete;
    expect(getShadowPart(el, 'summary')!.textContent?.trim()).to.equal('Used 1 tool');
  });

  it('explicit summary attribute overrides the localised count', async () => {
    const el = await fixture<LoquixToolCallList>(html`
      <loquix-tool-call-list summary="Used 4 tools · 2.3s">
        <loquix-tool-call name="a"></loquix-tool-call>
      </loquix-tool-call-list>
    `);
    await el.updateComplete;
    expect(getShadowPart(el, 'summary')!.textContent?.trim()).to.equal('Used 4 tools · 2.3s');
  });

  it('opens by default; collapses on toggle and dispatches loquix-tool-group-toggle', async () => {
    const el = await fixture<LoquixToolCallList>(html`
      <loquix-tool-call-list>
        <loquix-tool-call name="a"></loquix-tool-call>
      </loquix-tool-call-list>
    `);
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('true');
    expect(getShadowPart(el, 'items')!.hidden).to.be.false;

    const promise = waitForEvent<LoquixToolGroupToggleDetail>(el, 'loquix-tool-group-toggle');
    (getShadowPart(el, 'header')! as HTMLButtonElement).click();
    const ev = await promise;
    expect(ev.detail.open).to.be.false;
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('false');
    expect(getShadowPart(el, 'items')!.hidden).to.be.true;
  });

  it('default-collapsed starts collapsed', async () => {
    const el = await fixture<LoquixToolCallList>(html`
      <loquix-tool-call-list default-collapsed>
        <loquix-tool-call name="a"></loquix-tool-call>
      </loquix-tool-call-list>
    `);
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('false');
  });

  it("user-toggle wins: collapsing then setting summary doesn't re-open", async () => {
    const el = await fixture<LoquixToolCallList>(html`
      <loquix-tool-call-list>
        <loquix-tool-call name="a"></loquix-tool-call>
      </loquix-tool-call-list>
    `);
    await el.updateComplete;
    (getShadowPart(el, 'header')! as HTMLButtonElement).click();
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('false');

    el.summary = 'Override';
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('false');
  });

  it('explicit defaultCollapsed change clears user toggle', async () => {
    const el = await fixture<LoquixToolCallList>(html`
      <loquix-tool-call-list default-collapsed>
        <loquix-tool-call name="a"></loquix-tool-call>
      </loquix-tool-call-list>
    `);
    await el.updateComplete;
    (getShadowPart(el, 'header')! as HTMLButtonElement).click();
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('true');

    el.defaultCollapsed = false;
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('true');

    el.defaultCollapsed = true;
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('false');
  });

  it('count updates on slot mutation', async () => {
    const el = await fixture<LoquixToolCallList>(html`
      <loquix-tool-call-list>
        <loquix-tool-call name="a"></loquix-tool-call>
      </loquix-tool-call-list>
    `);
    await el.updateComplete;
    expect(getShadowPart(el, 'summary')!.textContent?.trim()).to.equal('Used 1 tool');

    const newChild = document.createElement('loquix-tool-call');
    newChild.setAttribute('name', 'b');
    el.appendChild(newChild);
    // wait for slotchange + render
    await new Promise(r => requestAnimationFrame(() => r(undefined)));
    await el.updateComplete;
    expect(getShadowPart(el, 'summary')!.textContent?.trim()).to.equal('Used 2 tools');
  });

  it('locale change updates the summary fallback', async () => {
    const el = await fixture<LoquixToolCallList>(html`
      <loquix-tool-call-list>
        <loquix-tool-call name="a"></loquix-tool-call>
        <loquix-tool-call name="b"></loquix-tool-call>
      </loquix-tool-call-list>
    `);
    await el.updateComplete;
    setLocale({ 'toolCallList.summaryFallback': 'Utilisé {count} outils' });
    await new Promise(r => queueMicrotask(r));
    await el.updateComplete;
    expect(getShadowPart(el, 'summary')!.textContent?.trim()).to.equal('Utilisé 2 outils');
  });
});
