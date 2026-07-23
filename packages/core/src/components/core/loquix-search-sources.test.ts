import { expect, fixture, html } from '@open-wc/testing';
import { getShadowPart, getShadowParts, waitForEvent } from '../../test-utils.js';
import './define-search-sources.js';
import type { LoquixSearchSources } from './loquix-search-sources.js';
import type { LoquixSearchSourceSelectDetail } from '../../events/index.js';
import type { SearchSource } from '../../types/index.js';

const sources: SearchSource[] = [
  { id: 'docs', name: 'Docs', icon: 'D', status: 'done', count: 5, duration: '240ms' },
  { id: 'notion', name: 'Notion', icon: 'N', status: 'running', count: 2 },
  { id: 'slack', name: 'Slack', icon: '#', status: 'error' },
];

describe('loquix-search-sources', () => {
  it('renders progress header and source pills by default', async () => {
    const el = await fixture<LoquixSearchSources>(
      html`<loquix-search-sources></loquix-search-sources>`,
    );
    el.sources = sources;
    el.runningTotal = 7;
    await el.updateComplete;

    expect(getShadowPart(el, 'header')!.textContent).to.contain('Searching 3 sources...');
    expect(getShadowPart(el, 'header')!.textContent).to.contain('7 results so far');
    expect(getShadowPart(el, 'spinner')).to.exist;
    expect(getShadowParts(el, 'pill').length).to.equal(3);
    expect(el.shadowRoot!.textContent).to.contain('Docs');
    expect(el.shadowRoot!.textContent).to.contain('error');
  });

  it('uses headline override', async () => {
    const el = await fixture<LoquixSearchSources>(
      html`<loquix-search-sources headline="Checking connected apps"></loquix-search-sources>`,
    );
    el.sources = sources;
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.textContent).to.contain('Checking connected apps');
  });

  it('renders filter chips with an all option', async () => {
    const el = await fixture<LoquixSearchSources>(
      html`<loquix-search-sources variant="filters"></loquix-search-sources>`,
    );
    el.sources = sources;
    await el.updateComplete;

    const pills = getShadowParts(el, 'pill');
    expect(pills.length).to.equal(4);
    expect(pills[0].textContent).to.contain('All');
    expect(pills[0].textContent).to.contain('7');
    expect(pills[0].classList.contains('is-active')).to.be.true;
  });

  it('dispatches source select events in filters variant', async () => {
    const el = await fixture<LoquixSearchSources>(
      html`<loquix-search-sources variant="filters"></loquix-search-sources>`,
    );
    el.sources = sources;
    await el.updateComplete;

    const eventPromise = waitForEvent<LoquixSearchSourceSelectDetail>(
      el,
      'loquix-search-source-select',
    );
    (getShadowParts(el, 'pill')[2] as HTMLButtonElement).click();
    const event = await eventPromise;
    expect(event.detail.sourceId).to.equal('notion');
    expect(event.detail.source?.name).to.equal('Notion');
    expect(el.activeSource).to.equal('notion');
  });

  it('can hide the all filter chip', async () => {
    const el = await fixture<LoquixSearchSources>(
      html`<loquix-search-sources variant="filters" .showAll=${false}></loquix-search-sources>`,
    );
    el.sources = sources;
    await el.updateComplete;
    expect(getShadowParts(el, 'pill').length).to.equal(3);
    expect(el.shadowRoot!.textContent).not.to.contain('All');
  });
});
