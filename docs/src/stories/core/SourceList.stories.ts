import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { Source } from '@loquix/core';

const meta: Meta = {
  title: 'Core/SourceList',
  component: 'loquix-source-list',
  tags: ['autodocs'],
  argTypes: {
    layout: { control: 'select', options: ['grid', 'list'] },
    heading: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj;

const sources: Source[] = [
  {
    title: 'Hybrid retrieval combining BM25 and dense vectors improves recall on long-tail queries',
    host: 'arxiv.org',
    url: 'https://arxiv.org/abs/2104.05740',
    snippet:
      'Combining sparse lexical retrieval with dense embedding search outperforms either method alone, particularly on rare entity mentions.',
  },
  {
    title: 'Designing Retrieval-Augmented Generation pipelines for production',
    host: 'pinecone.io',
    url: 'https://pinecone.io/learn/rag',
    snippet: 'A practical guide to chunking strategies, reranking, and evaluation harnesses.',
  },
  {
    title: 'Why your RAG system probably needs a reranker',
    host: 'cohere.com',
    url: 'https://cohere.com/blog/rerank',
    snippet: 'Cross-encoder rerankers consistently lift retrieval quality at the cost of latency.',
  },
  {
    title: 'BEIR: A heterogeneous benchmark for zero-shot evaluation of IR models',
    host: 'github.com',
    url: 'https://github.com/beir-cellar/beir',
    snippet: 'Eighteen datasets across nine task families.',
  },
];

function makeList(srcs: Source[], layout: 'grid' | 'list' = 'grid') {
  const el = document.createElement('loquix-source-list');
  el.setAttribute('layout', layout);
  (el as unknown as { sources: Source[] }).sources = srcs;
  return el;
}

export const Grid: Story = {
  render: () => html`<div style="max-width:580px">${makeList(sources, 'grid')}</div>`,
};

export const List: Story = {
  render: () => html`<div style="max-width:580px">${makeList(sources.slice(0, 3), 'list')}</div>`,
};

export const NoSnippets: Story = {
  render: () => {
    const minimalSources = sources.map(({ title, url, host }) => ({ title, url, host }));
    return html`<div style="max-width:580px">${makeList(minimalSources, 'grid')}</div>`;
  },
};
