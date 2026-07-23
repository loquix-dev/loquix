import { expect, fixture, html } from '@open-wc/testing';
import { getShadowPart, waitForEvent } from '../../test-utils.js';
import './define-search-result.js';
import type { LoquixSearchResult } from './loquix-search-result.js';
import type { LoquixSearchResultClickDetail } from '../../events/index.js';
import type { SearchResult } from '../../types/index.js';

const result: SearchResult = {
  id: 'r-1',
  rank: 1,
  source: { id: 'docs', name: 'Docs', icon: 'D' },
  title: 'Refund Policy',
  url: 'https://docs.example.com/policies/refunds',
  displayUrl: 'docs.example.com/policies/refunds',
  snippet: 'Customers can request a refund within 30 days of purchase.',
  meta: 'updated 3 weeks ago',
  citationRef: 2,
};

describe('loquix-search-result', () => {
  it('renders result object content', async () => {
    const el = await fixture<LoquixSearchResult>(
      html`<loquix-search-result></loquix-search-result>`,
    );
    el.result = result;
    await el.updateComplete;
    expect(getShadowPart(el, 'rank')!.textContent?.trim()).to.equal('1.');
    expect(getShadowPart(el, 'source')!.textContent?.trim()).to.contain('Docs');
    expect(getShadowPart(el, 'title')!.textContent?.trim()).to.equal('Refund Policy');
    expect(getShadowPart(el, 'snippet')!.textContent?.trim()).to.contain('30 days');
  });

  it('renders safe URLs as anchors', async () => {
    const el = await fixture<LoquixSearchResult>(
      html`<loquix-search-result></loquix-search-result>`,
    );
    el.result = result;
    await el.updateComplete;
    const row = getShadowPart(el, 'row') as HTMLAnchorElement;
    expect(row.tagName).to.equal('A');
    expect(row.href).to.equal('https://docs.example.com/policies/refunds');
    expect(row.target).to.equal('_blank');
  });

  it('renders unsafe URLs as buttons', async () => {
    const el = await fixture<LoquixSearchResult>(
      html`<loquix-search-result></loquix-search-result>`,
    );
    el.result = { ...result, url: 'javascript:alert(1)' };
    await el.updateComplete;
    const row = getShadowPart(el, 'row')!;
    expect(row.tagName).to.equal('BUTTON');
  });

  it('dispatches cancelable result-click before navigation', async () => {
    const el = await fixture<LoquixSearchResult>(
      html`<loquix-search-result></loquix-search-result>`,
    );
    el.result = result;
    await el.updateComplete;
    el.addEventListener('loquix-search-result-click', e => e.preventDefault());

    const row = getShadowPart(el, 'row')!;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    row.dispatchEvent(click);
    expect(click.defaultPrevented).to.be.true;
  });

  it('event detail carries result and index', async () => {
    const el = await fixture<LoquixSearchResult>(
      html`<loquix-search-result></loquix-search-result>`,
    );
    el.result = result;
    await el.updateComplete;

    const eventPromise = waitForEvent<LoquixSearchResultClickDetail>(
      el,
      'loquix-search-result-click',
    );
    getShadowPart(el, 'row')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    const event = await eventPromise;
    expect(event.detail.index).to.equal(1);
    expect(event.detail.result.id).to.equal('r-1');
  });

  it('supports attribute fallbacks', async () => {
    const el = await fixture<LoquixSearchResult>(
      html`<loquix-search-result
        rank="3"
        source-name="Slack"
        source-icon="#"
        title="Refund thread"
        snippet="Support discussion"
      ></loquix-search-result>`,
    );
    expect(getShadowPart(el, 'rank')!.textContent?.trim()).to.equal('3.');
    expect(getShadowPart(el, 'source')!.textContent?.trim()).to.contain('Slack');
    expect(getShadowPart(el, 'title')!.textContent?.trim()).to.equal('Refund thread');
  });
});
