import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Configuration/ComposerToolbar',
  component: 'loquix-composer-toolbar',
  tags: ['autodocs'],
  argTypes: {
    border: { control: 'select', options: ['none', 'top', 'bottom'] },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: { border: 'none' },
  render: args =>
    html` <div style="width:500px">
      <loquix-composer-toolbar border=${args.border}>
        <span>Toolbar content goes here</span>
      </loquix-composer-toolbar>
    </div>`,
};

export const WithBorder: Story = {
  args: { border: 'bottom' },
  render: args =>
    html` <div style="width:500px">
      <loquix-composer-toolbar border=${args.border}>
        <span>Toolbar with bottom border</span>
      </loquix-composer-toolbar>
    </div>`,
};
