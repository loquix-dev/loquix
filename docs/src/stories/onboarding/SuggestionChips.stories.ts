import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const suggestions = [
  { id: '1', text: 'Write a poem', icon: '✍️' },
  { id: '2', text: 'Summarize an article', icon: '📝' },
  { id: '3', text: 'Debug my code', icon: '🐛' },
  { id: '4', text: 'Explain a concept', icon: '💡' },
  { id: '5', text: 'Translate text', icon: '🌍' },
];

const meta: Meta = {
  title: 'Onboarding/SuggestionChips',
  component: 'loquix-suggestion-chips',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['chip', 'pill', 'card'] },
    maxVisible: { control: 'number' },
    disabled: { control: 'boolean' },
    wrap: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Chips: Story = {
  args: { variant: 'chip', wrap: true },
  render: args =>
    html`<loquix-suggestion-chips
      variant=${args.variant}
      ?wrap=${args.wrap}
      .suggestions=${suggestions}
    ></loquix-suggestion-chips>`,
};

export const Pills: Story = {
  args: { variant: 'pill', wrap: true },
  render: args =>
    html`<loquix-suggestion-chips
      variant=${args.variant}
      ?wrap=${args.wrap}
      .suggestions=${suggestions}
    ></loquix-suggestion-chips>`,
};

export const Cards: Story = {
  args: { variant: 'card', wrap: true },
  render: args =>
    html`<loquix-suggestion-chips
      variant=${args.variant}
      ?wrap=${args.wrap}
      .suggestions=${suggestions}
    ></loquix-suggestion-chips>`,
};

export const MaxVisible: Story = {
  args: { variant: 'chip', maxVisible: 3 },
  render: args =>
    html`<loquix-suggestion-chips
      variant=${args.variant}
      max-visible=${args.maxVisible}
      .suggestions=${suggestions}
    ></loquix-suggestion-chips>`,
};

export const Disabled: Story = {
  args: { variant: 'chip', disabled: true },
  render: args =>
    html`<loquix-suggestion-chips
      variant=${args.variant}
      ?disabled=${args.disabled}
      .suggestions=${suggestions}
    ></loquix-suggestion-chips>`,
};
