import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { Source } from '@loquix/core';

const meta: Meta = {
  title: 'Core/CitationPopover',
  component: 'loquix-citation-popover',
  tags: ['autodocs'],
  // Use 'padded' so the chip lives in flowing prose, not centered alone.
  parameters: { layout: 'padded' },
  argTypes: {
    index: { control: { type: 'number', min: 1 } },
  },
};
export default meta;

type Story = StoryObj;

const sources: Source[] = [
  {
    id: 's-1',
    title: 'Hybrid retrieval combining BM25 and dense vectors improves recall',
    url: 'https://arxiv.org/abs/2104.05740',
    host: 'arxiv.org',
    snippet:
      'We show that combining sparse lexical retrieval with dense embedding search outperforms either method alone on rare entity mentions.',
    favicon: 'https://www.google.com/s2/favicons?sz=32&domain=arxiv.org',
  },
  {
    id: 's-2',
    title: 'Designing Retrieval-Augmented Generation pipelines for production',
    url: 'https://pinecone.io/learn/rag',
    host: 'pinecone.io',
    snippet:
      'A practical guide to chunking strategies, reranking, and evaluation harnesses for RAG systems.',
    favicon: 'https://www.google.com/s2/favicons?sz=32&domain=pinecone.io',
  },
  {
    id: 's-3',
    title: 'Why your RAG system probably needs a reranker',
    url: 'https://cohere.com/blog/rerank',
    host: 'cohere.com',
    snippet: 'Cross-encoder rerankers consistently lift retrieval quality at the cost of latency.',
    favicon: 'https://www.google.com/s2/favicons?sz=32&domain=cohere.com',
  },
];

function makeChip(index: number, source: Source) {
  const el = document.createElement('loquix-citation-popover');
  el.setAttribute('index', String(index));
  (el as unknown as { source: Source }).source = source;
  return el;
}

export const Single: Story = {
  args: { index: 1 },
  render: args => {
    const chip = makeChip(args.index, sources[0]);
    return html`<p style="font-size:14px;max-width:560px">
      Hybrid retrieval outperforms either approach alone${chip}, especially on long-tail queries.
    </p>`;
  },
};

export const MultipleInProse: Story = {
  render: () => html`
    <p style="font-size:14px;max-width:560px;line-height:1.6">
      For a 5M-document corpus, hybrid retrieval combining BM25 with dense embeddings outperforms
      either method in isolation${makeChip(1, sources[0])}, especially on queries that mention rare
      entities. Production RAG pipelines typically also include a cross-encoder reranking
      stage${makeChip(2, sources[1])}${makeChip(3, sources[2])} applied to the top-N candidates.
    </p>
  `,
};

export const KeyboardFocus: Story = {
  render: () => html`
    <p style="font-size:14px;max-width:560px">
      Tab into the chip and press <kbd>Enter</kbd> or <kbd>Space</kbd> to fire
      <code>loquix-citation-click</code>; <kbd>Esc</kbd> closes the popover.
      ${makeChip(1, sources[0])}
    </p>
  `,
};
