import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Core/GenerationControls',
  component: 'loquix-generation-controls',
  tags: ['autodocs'],
  argTypes: {
    state: { control: 'select', options: ['idle', 'running', 'paused', 'complete', 'error'] },
    showPause: { control: 'boolean' },
    showSkip: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Idle: Story = {
  args: { state: 'idle' },
  render: args =>
    html`<loquix-generation-controls state=${args.state}></loquix-generation-controls>`,
};

export const Running: Story = {
  args: { state: 'running' },
  render: args =>
    html`<loquix-generation-controls state=${args.state}></loquix-generation-controls>`,
};

export const RunningWithPause: Story = {
  args: { state: 'running', showPause: true },
  render: args =>
    html`<loquix-generation-controls
      state=${args.state}
      ?show-pause=${args.showPause}
    ></loquix-generation-controls>`,
};

export const Paused: Story = {
  args: { state: 'paused' },
  render: args =>
    html`<loquix-generation-controls state=${args.state}></loquix-generation-controls>`,
};

export const AllStates: Story = {
  render: () => html` <div style="display:flex;flex-direction:column;gap:12px">
    <loquix-generation-controls state="idle"></loquix-generation-controls>
    <loquix-generation-controls state="running" show-pause></loquix-generation-controls>
    <loquix-generation-controls state="paused"></loquix-generation-controls>
    <loquix-generation-controls state="complete"></loquix-generation-controls>
    <loquix-generation-controls state="error"></loquix-generation-controls>
  </div>`,
};
