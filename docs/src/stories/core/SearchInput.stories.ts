import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { SearchShortcut } from '@loquix/core';

const meta: Meta = {
  title: 'Core/SearchInput',
  component: 'loquix-search-input',
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['plain', 'smart', 'auto'] },
    size: { control: 'select', options: ['md', 'lg'] },
    state: { control: 'select', options: ['idle', 'searching'] },
    value: { control: 'text' },
    placeholder: { control: 'text' },
    kbd: { control: 'text' },
    askLabel: { control: 'text' },
    showAskAffordance: { control: 'boolean' },
    hideKbdWhenAsk: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Plain: Story = {
  args: { mode: 'plain', size: 'md', kbd: 'Cmd K' },
  render: args =>
    html`<div style="max-width:520px">
      <loquix-search-input
        mode=${args.mode}
        size=${args.size}
        state=${ifDefined(args.state)}
        value=${ifDefined(args.value)}
        placeholder=${ifDefined(args.placeholder)}
        kbd=${ifDefined(args.kbd)}
        .hideKbdWhenAsk=${args.hideKbdWhenAsk ?? true}
        ?disabled=${args.disabled}
      ></loquix-search-input>
    </div>`,
};

export const Smart: Story = {
  args: { mode: 'smart', size: 'md', value: '', kbd: 'Cmd K' },
  render: Plain.render,
};

export const AutoWithAskAI: Story = {
  args: {
    mode: 'auto',
    size: 'md',
    value: "What's our refund policy",
    kbd: 'Cmd Enter',
    showAskAffordance: true,
    hideKbdWhenAsk: true,
  },
  render: args =>
    html`<div style="max-width:520px">
      <loquix-search-input
        mode=${args.mode}
        size=${args.size}
        value=${args.value}
        kbd=${args.kbd}
        ?show-ask-affordance=${args.showAskAffordance}
        .hideKbdWhenAsk=${args.hideKbdWhenAsk ?? true}
      ></loquix-search-input>
    </div>`,
};

export const LargeHero: Story = {
  args: { mode: 'smart', size: 'lg', placeholder: 'Search or ask anything...' },
  render: args =>
    html`<div style="max-width:620px">
      <loquix-search-input
        mode=${args.mode}
        size=${args.size}
        placeholder=${args.placeholder}
      ></loquix-search-input>
    </div>`,
};

export const Searching: Story = {
  args: { mode: 'smart', state: 'searching', value: "What's our refund policy" },
  render: args =>
    html`<div style="max-width:520px">
      <loquix-search-input
        mode=${args.mode}
        state=${args.state}
        value=${args.value}
      ></loquix-search-input>
    </div>`,
};

export const Personalities: Story = {
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:18px;max-width:560px">
      <loquix-search-input mode="plain" placeholder="Search..." kbd="Cmd K"></loquix-search-input>
      <loquix-search-input
        mode="smart"
        placeholder="Search or ask anything..."
        kbd="Cmd K"
      ></loquix-search-input>
      <loquix-search-input
        mode="auto"
        value="What's our refund policy"
        kbd="Cmd Enter"
      ></loquix-search-input>
    </div>
  `,
};

export const CustomPrefix: Story = {
  render: () => html`
    <div style="max-width:520px">
      <loquix-search-input mode="auto" value="refund policy">
        <span
          slot="prefix"
          style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:5px;background:var(--loquix-ai-color-subtle);color:var(--loquix-ai-color);font-size:11px;font-weight:700"
          >D</span
        >
      </loquix-search-input>
    </div>
  `,
};

const shortcuts: SearchShortcut[] = [
  { key: 'Enter', label: 'Search' },
  { key: 'Cmd Enter', label: 'Ask AI' },
  { key: 'Esc', label: 'Close' },
];

function makeFooter() {
  const el = document.createElement('loquix-search-footer');
  (el as unknown as { shortcuts: SearchShortcut[] }).shortcuts = shortcuts;
  return el;
}

export const WithFooter: Story = {
  render: () => html`
    <div
      style="width:560px;border:1px solid var(--loquix-border-color);border-radius:12px;background:var(--loquix-surface-bg);overflow:hidden"
    >
      <div style="padding:12px">
        <loquix-search-input
          mode="auto"
          value="What's our refund policy"
          show-ask-affordance
        ></loquix-search-input>
      </div>
      ${makeFooter()}
    </div>
  `,
};
