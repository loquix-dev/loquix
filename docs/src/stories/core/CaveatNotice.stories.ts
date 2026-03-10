import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/CaveatNotice',
  component: 'loquix-caveat-notice',
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text' },
    variant: { control: 'select', options: ['footer', 'inline', 'contextual'] },
  },
};
export default meta;

type Story = StoryObj;

export const Footer: Story = {
  args: { variant: 'footer' },
  render: args => html`<loquix-caveat-notice variant=${args.variant}></loquix-caveat-notice>`,
};

export const Inline: Story = {
  args: { variant: 'inline' },
  render: args => html`<loquix-caveat-notice variant=${args.variant}></loquix-caveat-notice>`,
};

export const Contextual: Story = {
  args: { variant: 'contextual' },
  render: args => html`<loquix-caveat-notice variant=${args.variant}></loquix-caveat-notice>`,
};

export const CustomMessage: Story = {
  args: {
    message: 'This is an AI-generated response. Please verify all facts.',
    variant: 'footer',
  },
  render: args =>
    html`<loquix-caveat-notice
      message=${args.message}
      variant=${args.variant}
    ></loquix-caveat-notice>`,
};
