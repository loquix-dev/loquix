import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { SearchResult } from '@loquix/core';

const meta: Meta = {
  title: 'Core/SearchResults',
  component: 'loquix-search-results',
  tags: ['autodocs'],
  argTypes: {
    layout: { control: 'select', options: ['blended', 'sectioned'] },
    emptyText: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj;

const results: SearchResult[] = [
  {
    id: 'docs-refunds',
    rank: 1,
    source: { id: 'docs', name: 'Docs', icon: 'D', duration: '240ms' },
    title: 'Refund Policy',
    url: 'https://docs.example.com/policies/refunds',
    displayUrl: 'docs.example.com/policies/refunds',
    meta: 'updated 3 weeks ago',
    snippet:
      'Customers can request a refund within 30 days of purchase. Refunds are processed back to the original payment method within 5-7 business days.',
    citationRef: 1,
  },
  {
    id: 'notion-refunds',
    rank: 2,
    source: { id: 'notion', name: 'Knowledge base', icon: 'N', duration: '510ms' },
    title: 'Refund process - internal guide',
    url: 'https://team.notion.so/refund-process',
    displayUrl: 'team.notion.so/refund-process',
    meta: 'edited yesterday by Anna',
    snippet:
      'Step-by-step internal workflow for customer success agents handling refund requests. Includes Stripe and accounting steps.',
    citationRef: 2,
  },
  {
    id: 'slack-refunds',
    rank: 3,
    source: { id: 'slack', name: 'Slack', icon: '#', duration: '380ms' },
    title: '#help-customers - How long do refunds take?',
    url: 'https://slack.com/help-customers/p173',
    displayUrl: 'slack.com/help-customers/p173',
    meta: 'thread - 3 days ago',
    snippet:
      'Customer asking why refund is not showing yet. The standard response says 5-7 business days is normal.',
  },
  {
    id: 'docs-exceptions',
    rank: 4,
    source: { id: 'docs', name: 'Docs', icon: 'D', duration: '240ms' },
    title: 'Refund Exceptions',
    url: 'https://docs.example.com/policies/refunds-exceptions',
    displayUrl: 'docs.example.com/policies/refunds-exceptions',
    meta: 'updated 2 months ago',
    snippet:
      'Some product categories are not eligible for refund: gift cards, activated downloadable software, and subscriptions past the first 14 days.',
    citationRef: 3,
  },
];

function makeResults(layout: 'blended' | 'sectioned', items = results) {
  const el = document.createElement('loquix-search-results');
  el.setAttribute('layout', layout);
  (el as unknown as { results: SearchResult[] }).results = items;
  return el;
}

export const Blended: Story = {
  render: () => html`<div style="max-width:660px">${makeResults('blended')}</div>`,
};

export const Sectioned: Story = {
  render: () => html`<div style="max-width:660px">${makeResults('sectioned')}</div>`,
};

export const SingleResult: Story = {
  render: () =>
    html`<div style="max-width:620px">
      <loquix-search-result
        rank="1"
        source-name="Docs"
        source-icon="D"
        title="Refund Policy"
        url="https://docs.example.com/policies/refunds"
        display-url="docs.example.com/policies/refunds"
        snippet="Customers can request a refund within 30 days of purchase."
        citation-ref="1"
      ></loquix-search-result>
    </div>`,
};

export const Empty: Story = {
  render: () =>
    html`<div style="max-width:620px"><loquix-search-results></loquix-search-results></div>`,
};
