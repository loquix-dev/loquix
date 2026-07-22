import { expect, fixture, html } from '@open-wc/testing';
import { setLocale, resetLocale } from '../../i18n/index.js';
import { getShadowPart, waitForEvent, getShadowParts } from '../../test-utils.js';
import './define-source-list.js';
import type { LoquixSourceList } from './loquix-source-list.js';
import type { LoquixSourceClickDetail } from '../../events/index.js';
import type { Source } from '../../types/index.js';

const sources: Source[] = [
  {
    title: 'Hybrid retrieval combining BM25 and dense vectors',
    url: 'https://arxiv.org/abs/2104.05740',
    host: 'arxiv.org',
    snippet: 'We show that combining sparse lexical retrieval with dense embedding search…',
  },
  {
    title: 'Designing RAG pipelines for production',
    url: 'https://pinecone.io/learn/rag',
    host: 'pinecone.io',
  },
  {
    id: 's-3',
    title: 'Why your RAG system probably needs a reranker',
    url: 'https://cohere.com/blog/rerank',
    host: 'cohere.com',
  },
];

describe('loquix-source-list', () => {
  afterEach(() => resetLocale());

  it('renders empty state with "0 sources" heading', async () => {
    const el = await fixture<LoquixSourceList>(html`<loquix-source-list></loquix-source-list>`);
    await el.updateComplete;
    const header = getShadowPart(el, 'header')!;
    expect(header.textContent?.trim()).to.contain('0 sources');
  });

  it('renders correct number of source rows', async () => {
    const el = await fixture<LoquixSourceList>(html`<loquix-source-list></loquix-source-list>`);
    el.sources = sources;
    await el.updateComplete;
    const rows = getShadowParts(el, 'source');
    expect(rows.length).to.equal(3);
  });

  it('uses singular "1 source" when count is 1', async () => {
    const el = await fixture<LoquixSourceList>(html`<loquix-source-list></loquix-source-list>`);
    el.sources = sources.slice(0, 1);
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.textContent?.trim()).to.contain('1 source');
  });

  it('renders 1-based indices', async () => {
    const el = await fixture<LoquixSourceList>(html`<loquix-source-list></loquix-source-list>`);
    el.sources = sources;
    await el.updateComplete;
    const indices = getShadowParts(el, 'index').map(n => n.textContent?.trim());
    expect(indices).to.deep.equal(['1', '2', '3']);
  });

  it('reflects layout attribute', async () => {
    const el = await fixture<LoquixSourceList>(
      html`<loquix-source-list layout="list"></loquix-source-list>`,
    );
    expect(el.getAttribute('layout')).to.equal('list');
  });

  it('renders anchors with target=_blank rel=noreferrer', async () => {
    const el = await fixture<LoquixSourceList>(html`<loquix-source-list></loquix-source-list>`);
    el.sources = sources;
    await el.updateComplete;
    const anchors = el.shadowRoot!.querySelectorAll('a.source');
    expect(anchors.length).to.equal(3);
    anchors.forEach(a => {
      expect((a as HTMLAnchorElement).target).to.equal('_blank');
      expect((a as HTMLAnchorElement).rel).to.contain('noreferrer');
    });
  });

  it('renders unsafe URL entries as <span> (no anchor)', async () => {
    const el = await fixture<LoquixSourceList>(html`<loquix-source-list></loquix-source-list>`);
    el.sources = [
      { title: 'safe', url: 'https://example.com/' },
      { title: 'unsafe-data', url: 'data:text/html,<script>alert(1)</script>' },
      { title: 'unsafe-js', url: 'javascript:alert(1)' },
    ];
    await el.updateComplete;
    const rows = getShadowParts(el, 'source');
    expect(rows[0].tagName).to.equal('A');
    expect(rows[1].tagName).to.equal('SPAN');
    expect(rows[2].tagName).to.equal('SPAN');
  });

  it('source-click is cancelable and prevents anchor navigation', async () => {
    const el = await fixture<LoquixSourceList>(html`<loquix-source-list></loquix-source-list>`);
    el.sources = sources;
    await el.updateComplete;
    el.addEventListener('loquix-source-click', e => e.preventDefault());

    const anchor = getShadowPart(el, 'source')! as HTMLAnchorElement;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(click);
    expect(click.defaultPrevented).to.be.true;
  });

  it('source-click event detail carries 1-based index + source', async () => {
    const el = await fixture<LoquixSourceList>(html`<loquix-source-list></loquix-source-list>`);
    el.sources = sources;
    await el.updateComplete;

    const anchors = el.shadowRoot!.querySelectorAll('a.source');
    const promise = waitForEvent<LoquixSourceClickDetail>(el, 'loquix-source-click');
    (anchors[2] as HTMLAnchorElement).dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    const ev = await promise;
    expect(ev.detail.index).to.equal(3);
    expect(ev.detail.source.id).to.equal('s-3');
  });

  it('section is labelled by the localised heading', async () => {
    const el = await fixture<LoquixSourceList>(html`<loquix-source-list></loquix-source-list>`);
    el.sources = sources;
    await el.updateComplete;
    const section = getShadowPart(el, 'container')!;
    const headerId = section.getAttribute('aria-labelledby');
    const header = el.shadowRoot!.getElementById(headerId!);
    expect(header).to.exist;
  });

  it('explicit heading prop overrides localised text', async () => {
    const el = await fixture<LoquixSourceList>(
      html`<loquix-source-list heading="My references"></loquix-source-list>`,
    );
    el.sources = sources;
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.textContent?.trim()).to.contain('My references');
  });

  it('locale change updates the heading', async () => {
    const el = await fixture<LoquixSourceList>(html`<loquix-source-list></loquix-source-list>`);
    el.sources = sources;
    await el.updateComplete;
    setLocale({ 'sourceList.heading': 'Источники: {count}' });
    await new Promise(r => queueMicrotask(r));
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.textContent?.trim()).to.contain('Источники: 3');
  });
});
