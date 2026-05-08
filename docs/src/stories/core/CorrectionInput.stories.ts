import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/CorrectionInput',
  component: 'loquix-correction-input',
  tags: ['autodocs'],
  argTypes: {
    original: { control: 'text' },
    value: { control: 'text' },
    reason: { control: 'text' },
    reasonRequired: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Empty: Story = {
  render: () => html`<loquix-correction-input></loquix-correction-input>`,
};

export const Prefilled: Story = {
  args: {
    original: "The Eiffel Tower is 320 meters tall and was built in 1889 for the World's Fair.",
    value:
      'The Eiffel Tower is 330 meters tall (including antennas) and was built in 1889 for the Exposition Universelle.',
  },
  render: args =>
    html`<loquix-correction-input
      original=${args.original}
      value=${args.value}
      @loquix-correction-submit=${(e: CustomEvent) =>
        // eslint-disable-next-line no-console
        console.log('correction submit', e.detail)}
    ></loquix-correction-input>`,
};

export const ReasonRequired: Story = {
  args: {
    original: 'Some claim that needs correcting.',
    reasonRequired: true,
  },
  render: args =>
    html`<loquix-correction-input
      original=${args.original}
      ?reason-required=${args.reasonRequired}
    ></loquix-correction-input>`,
};
