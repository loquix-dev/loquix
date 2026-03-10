import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const filters = [
  { id: 'code', label: 'Code', icon: '💻', group: 'Content' },
  { id: 'text', label: 'Text', icon: '📝', group: 'Content' },
  { id: 'images', label: 'Images', icon: '🖼️', group: 'Content' },
  { id: 'recent', label: 'Recent', icon: '🕐', group: 'Time' },
  { id: 'starred', label: 'Starred', icon: '⭐', group: 'Status' },
  { id: 'shared', label: 'Shared', icon: '🔗', group: 'Status' },
];

const meta: Meta = {
  title: 'Configuration/FilterBar',
  component: 'loquix-filter-bar',
  tags: ['autodocs'],
  argTypes: {
    showNegativePrompt: { control: 'boolean' },
    negativePrompt: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => html` <div style="width:500px">
    <loquix-filter-bar .filters=${filters}></loquix-filter-bar>
  </div>`,
};

export const WithValues: Story = {
  render: () => html` <div style="width:500px">
    <loquix-filter-bar .filters=${filters} .values=${['code', 'recent']}></loquix-filter-bar>
  </div>`,
};

export const WithNegativePrompt: Story = {
  args: { showNegativePrompt: true, negativePrompt: '' },
  render: args => html` <div style="width:500px">
    <loquix-filter-bar
      ?show-negative-prompt=${args.showNegativePrompt}
      negative-prompt=${args.negativePrompt}
      .filters=${filters}
    ></loquix-filter-bar>
  </div>`,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: args => html` <div style="width:500px">
    <loquix-filter-bar
      ?disabled=${args.disabled}
      .filters=${filters}
      .values=${['code']}
    ></loquix-filter-bar>
  </div>`,
};
