import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { SearchShortcut } from '@loquix/core';

const meta: Meta = {
  title: 'Core/SearchFooter',
  component: 'loquix-search-footer',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj;

const shortcuts: SearchShortcut[] = [
  { key: 'Enter', label: 'Search' },
  { key: 'Cmd Enter', label: 'Ask AI' },
  { key: 'Esc', label: 'Close' },
];

function makeFooter(items: SearchShortcut[] = shortcuts) {
  const el = document.createElement('loquix-search-footer');
  (el as unknown as { shortcuts: SearchShortcut[] }).shortcuts = items;
  return el;
}

export const Default: Story = {
  render: () => html`<div style="width:560px">${makeFooter()}</div>`,
};

export const WithActions: Story = {
  render: () => {
    const footer = makeFooter();
    const status = document.createElement('span');
    status.slot = 'actions';
    status.textContent = '4 sources';
    footer.append(status);
    return html`<div style="width:560px">${footer}</div>`;
  },
};

export const Compact: Story = {
  render: () =>
    html`<div style="width:420px">
      ${makeFooter([
        { key: 'Enter', label: 'Open' },
        { key: 'Esc', label: 'Close' },
      ])}
    </div>`,
};
