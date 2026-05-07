import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/FeedbackForm',
  component: 'loquix-feedback-form',
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'select', options: [null, 'positive', 'negative'] },
    allowReason: { control: 'boolean' },
    requireCommentOnDown: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Idle: Story = {
  render: () => html`<loquix-feedback-form></loquix-feedback-form>`,
};

export const PositiveSelected: Story = {
  args: { value: 'positive' },
  render: args =>
    html`<loquix-feedback-form
      value=${args.value}
      @loquix-feedback-submit=${(e: CustomEvent) =>
        // eslint-disable-next-line no-console
        console.log('feedback submit', e.detail)}
    ></loquix-feedback-form>`,
};

export const NegativeSelected: Story = {
  args: { value: 'negative' },
  render: args =>
    html`<loquix-feedback-form
      value=${args.value}
      @loquix-feedback-submit=${(e: CustomEvent) =>
        // eslint-disable-next-line no-console
        console.log('feedback submit', e.detail)}
    ></loquix-feedback-form>`,
};

export const RequireCommentOnDown: Story = {
  args: { value: 'negative', requireCommentOnDown: true },
  render: args =>
    html`<loquix-feedback-form
      value=${args.value}
      ?require-comment-on-down=${args.requireCommentOnDown}
    ></loquix-feedback-form>`,
};
