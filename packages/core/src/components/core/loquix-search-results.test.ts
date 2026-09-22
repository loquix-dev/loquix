import { expect, fixture, html } from '@open-wc/testing';
import type { LitElement } from 'lit';
import { getShadowPart, getShadowParts } from '../../test-utils.js';
import './define-search-results.js';
import type { LoquixSearchResults } from './loquix-search-results.js';
import type { SearchResult } from '../../types/index.js';

const results: SearchResult[] = [
  {
    id: 'docs-1',
    source: { id: 'docs', name: 'Docs', icon: 'D', duration: '240ms' },
    title: 'Refund Policy',
    url: 'https://docs.example.com/refunds',
  },
  {
    id: 'docs-2',
    source: { id: 'docs', name: 'Docs', icon: 'D', duration: '240ms' },
    title: 'Refund Exceptions',
    url: 'https://docs.example.com/refund-exceptions',
  },
  {
    id: 'slack-1',
    source: { id: 'slack', name: 'Slack', icon: '#' },
    title: 'Refund thread',
    url: 'https://slack.com/example',
  },
];

describe('loquix-search-results', () => {
  it('renders empty state text', async () => {
    const el = await fixture<LoquixSearchResults>(
      html`<loquix-search-results></loquix-search-results>`,
    );
    expect(getShadowPart(el, 'empty')!.textContent?.trim()).to.equal('No results found.');
  });

  it('renders blended result rows by default', async () => {
    const el = await fixture<LoquixSearchResults>(
      html`<loquix-search-results></loquix-search-results>`,
    );
    el.results = results;
    await el.updateComplete;
    const rows = el.shadowRoot!.querySelectorAll('loquix-search-result');
    expect(rows.length).to.equal(3);
    expect(getShadowPart(el, 'container')).to.exist;
  });

  it('reflects layout attribute', async () => {
    const el = await fixture<LoquixSearchResults>(
      html`<loquix-search-results layout="sectioned"></loquix-search-results>`,
    );
    expect(el.getAttribute('layout')).to.equal('sectioned');
  });

  it('groups sectioned results by source', async () => {
    const el = await fixture<LoquixSearchResults>(
      html`<loquix-search-results layout="sectioned"></loquix-search-results>`,
    );
    el.results = results;
    await el.updateComplete;
    const sections = getShadowParts(el, 'section');
    expect(sections.length).to.equal(2);
    expect(sections[0].textContent).to.contain('Docs');
    expect(sections[0].textContent).to.contain('2 results');
    expect(sections[1].textContent).to.contain('Slack');
    expect(sections[1].textContent).to.contain('1 result');
  });

  it('numbers blended rows by position when rank is omitted', async () => {
    const el = await fixture<LoquixSearchResults>(
      html`<loquix-search-results></loquix-search-results>`,
    );
    el.results = results;
    await el.updateComplete;

    const first = el.shadowRoot!.querySelector('loquix-search-result') as LitElement;
    await first.updateComplete;
    expect(getShadowPart(first, 'rank')!.textContent?.trim()).to.equal('1.');
  });

  it('leaves a blended row unnumbered when rank is null', async () => {
    const el = await fixture<LoquixSearchResults>(
      html`<loquix-search-results></loquix-search-results>`,
    );
    el.results = [{ title: 'Service is too busy. Try again.', rank: null }];
    await el.updateComplete;

    const row = el.shadowRoot!.querySelector('loquix-search-result') as LitElement;
    await row.updateComplete;
    expect(getShadowPart(row, 'rank') === null, 'rank must be suppressed for rank: null').to.be
      .true;
  });

  it('leaves a sectioned row unnumbered when rank is null', async () => {
    const el = await fixture<LoquixSearchResults>(
      html`<loquix-search-results layout="sectioned"></loquix-search-results>`,
    );
    el.results = [
      {
        title: 'Service is too busy. Try again.',
        rank: null,
        source: { id: 'docs', name: 'Docs' },
      },
    ];
    await el.updateComplete;

    const row = el.shadowRoot!.querySelector('loquix-search-result') as LitElement;
    await row.updateComplete;
    expect(getShadowPart(row, 'rank') === null, 'rank must be suppressed for rank: null').to.be
      .true;
  });

  it('uses empty-text override', async () => {
    const el = await fixture<LoquixSearchResults>(
      html`<loquix-search-results empty-text="Nothing here"></loquix-search-results>`,
    );
    expect(getShadowPart(el, 'empty')!.textContent?.trim()).to.equal('Nothing here');
  });
});
