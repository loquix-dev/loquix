import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const suggestions = [
  { id: '1', text: 'Tell me more about this' },
  { id: '2', text: 'Can you give an example?' },
  { id: '3', text: 'What are the alternatives?' },
];

const meta: Meta = {
  title: 'Onboarding/FollowUpSuggestions',
  component: 'loquix-follow-up-suggestions',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['inline', 'stacked', 'carousel'] },
    maxVisible: { control: 'number' },
    label: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj;

export const Inline: Story = {
  args: { variant: 'inline' },
  render: args =>
    html`<loquix-follow-up-suggestions
      variant=${args.variant}
      .suggestions=${suggestions}
    ></loquix-follow-up-suggestions>`,
};

export const Stacked: Story = {
  args: { variant: 'stacked' },
  render: args =>
    html`<loquix-follow-up-suggestions
      variant=${args.variant}
      .suggestions=${suggestions}
    ></loquix-follow-up-suggestions>`,
};

export const WithLabel: Story = {
  args: { variant: 'inline', label: 'You might also ask:' },
  render: args =>
    html`<loquix-follow-up-suggestions
      variant=${args.variant}
      label=${args.label}
      .suggestions=${suggestions}
    ></loquix-follow-up-suggestions>`,
};

export const MaxVisible: Story = {
  args: { variant: 'inline', maxVisible: 2 },
  render: args =>
    html`<loquix-follow-up-suggestions
      variant=${args.variant}
      max-visible=${args.maxVisible}
      .suggestions=${suggestions}
    ></loquix-follow-up-suggestions>`,
};
