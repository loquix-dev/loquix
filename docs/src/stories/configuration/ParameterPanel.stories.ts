import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const parameters = [
  {
    id: 'temperature',
    label: 'Temperature',
    type: 'range' as const,
    min: 0,
    max: 2,
    step: 0.1,
    default: 0.7,
    description: 'Controls randomness of output',
  },
  {
    id: 'max_tokens',
    label: 'Max Tokens',
    type: 'number' as const,
    min: 1,
    max: 4096,
    default: 1024,
    description: 'Maximum response length',
  },
  {
    id: 'top_p',
    label: 'Top P',
    type: 'range' as const,
    min: 0,
    max: 1,
    step: 0.05,
    default: 1,
    advanced: true,
  },
  {
    id: 'stream',
    label: 'Stream',
    type: 'toggle' as const,
    default: true,
    description: 'Stream response tokens',
  },
  {
    id: 'format',
    label: 'Output Format',
    type: 'select' as const,
    default: 'text',
    options: [
      { value: 'text', label: 'Text' },
      { value: 'json', label: 'JSON' },
      { value: 'markdown', label: 'Markdown' },
    ],
  },
];

const presets = [
  {
    id: 'creative',
    label: 'Creative',
    description: 'Higher randomness',
    values: { temperature: 1.2, max_tokens: 2048, top_p: 0.95 },
  },
  {
    id: 'precise',
    label: 'Precise',
    description: 'Low randomness',
    values: { temperature: 0.2, max_tokens: 1024, top_p: 0.5 },
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Default settings',
    values: { temperature: 0.7, max_tokens: 1024, top_p: 1 },
  },
];

const meta: Meta = {
  title: 'Configuration/ParameterPanel',
  component: 'loquix-parameter-panel',
  tags: ['autodocs'],
  argTypes: {
    compact: { control: 'boolean' },
    showAdvanced: { control: 'boolean' },
    disabled: { control: 'boolean' },
    activePreset: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => html` <div style="width:350px">
    <loquix-parameter-panel
      .parameters=${parameters}
      .values=${{ temperature: 0.7, max_tokens: 1024, stream: true, format: 'text' }}
    ></loquix-parameter-panel>
  </div>`,
};

export const WithPresets: Story = {
  args: { activePreset: 'balanced' },
  render: args => html` <div style="width:350px">
    <loquix-parameter-panel
      active-preset=${args.activePreset}
      .parameters=${parameters}
      .presets=${presets}
      .values=${{ temperature: 0.7, max_tokens: 1024, top_p: 1, stream: true, format: 'text' }}
    ></loquix-parameter-panel>
  </div>`,
};

export const ShowAdvanced: Story = {
  args: { showAdvanced: true },
  render: args => html` <div style="width:350px">
    <loquix-parameter-panel
      ?show-advanced=${args.showAdvanced}
      .parameters=${parameters}
      .values=${{ temperature: 0.7, max_tokens: 1024, top_p: 1, stream: true, format: 'text' }}
    ></loquix-parameter-panel>
  </div>`,
};

export const Compact: Story = {
  args: { compact: true },
  render: args => html` <div style="width:300px">
    <loquix-parameter-panel
      ?compact=${args.compact}
      .parameters=${parameters}
      .values=${{ temperature: 0.7, max_tokens: 1024, stream: true, format: 'text' }}
    ></loquix-parameter-panel>
  </div>`,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: args => html` <div style="width:350px">
    <loquix-parameter-panel
      ?disabled=${args.disabled}
      .parameters=${parameters}
      .values=${{ temperature: 0.7, max_tokens: 1024, stream: true, format: 'text' }}
    ></loquix-parameter-panel>
  </div>`,
};
