import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/DisagreementMarker',
  component: 'loquix-disagreement-marker',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['inline', 'banner'] },
    reason: { control: 'text' },
    resolvable: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const InlinePill: Story = {
  args: { variant: 'inline' },
  render: args =>
    html`<p style="font-size:14px;max-width:460px">
      Earlier response on Q3 numbers
      <loquix-disagreement-marker variant=${args.variant}></loquix-disagreement-marker> — the user
      pointed out the figure was outdated.
    </p>`,
};

export const InlinePillWithReason: Story = {
  args: { variant: 'inline', reason: 'figure was outdated' },
  render: args =>
    html`<loquix-disagreement-marker
      variant=${args.variant}
      reason=${args.reason}
    ></loquix-disagreement-marker>`,
};

export const Banner: Story = {
  args: {
    variant: 'banner',
    reason: 'The reported revenue figure conflicts with the Q3 earnings call transcript.',
  },
  render: args =>
    html`<div style="max-width:480px">
      <loquix-disagreement-marker
        variant=${args.variant}
        reason=${args.reason}
      ></loquix-disagreement-marker>
    </div>`,
};

export const BannerResolvable: Story = {
  args: {
    variant: 'banner',
    reason: 'Including antennas, the tower is 330 m tall (verified via the official site).',
    resolvable: true,
  },
  render: args =>
    html`<div style="max-width:480px">
      <loquix-disagreement-marker
        variant=${args.variant}
        reason=${args.reason}
        ?resolvable=${args.resolvable}
        @loquix-disagreement-resolve=${() => alert('Marked resolved')}
      ></loquix-disagreement-marker>
    </div>`,
};
