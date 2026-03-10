import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const models = [
  {
    value: 'claude-3.5-sonnet',
    label: 'Claude 3.5 Sonnet',
    description: 'Fast and capable',
    cost: '$3/MTok',
    group: 'Anthropic',
    capabilities: ['code', 'analysis', 'vision'],
  },
  {
    value: 'claude-3-opus',
    label: 'Claude 3 Opus',
    description: 'Most capable',
    cost: '$15/MTok',
    group: 'Anthropic',
    capabilities: ['code', 'analysis', 'reasoning', 'vision'],
  },
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    description: 'Multimodal flagship',
    cost: '$5/MTok',
    group: 'OpenAI',
    capabilities: ['code', 'vision', 'reasoning'],
  },
  {
    value: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    description: 'Fast and affordable',
    cost: '$0.15/MTok',
    group: 'OpenAI',
    capabilities: ['code', 'analysis'],
  },
  {
    value: 'gemini-pro',
    label: 'Gemini 1.5 Pro',
    description: 'Long context',
    cost: '$3.50/MTok',
    group: 'Google',
    capabilities: ['code', 'vision', 'analysis'],
  },
];

const meta: Meta = {
  title: 'Configuration/ModelSelector',
  component: 'loquix-model-selector',
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    placeholder: { control: 'text' },
    showCost: { control: 'boolean' },
    showCapabilities: { control: 'boolean' },
    grouped: { control: 'boolean' },
    searchable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: { placeholder: 'Select model...', value: '' },
  render: args => html` <div style="width:300px;padding-top:300px">
    <loquix-model-selector
      placeholder=${args.placeholder}
      value=${args.value}
      .models=${models}
    ></loquix-model-selector>
  </div>`,
};

export const WithValue: Story = {
  args: { value: 'claude-3.5-sonnet' },
  render: args => html` <div style="width:300px;padding-top:300px">
    <loquix-model-selector value=${args.value} .models=${models}></loquix-model-selector>
  </div>`,
};

export const ShowCost: Story = {
  args: { value: 'claude-3.5-sonnet', showCost: true },
  render: args => html` <div style="width:300px;padding-top:350px">
    <loquix-model-selector
      value=${args.value}
      ?show-cost=${args.showCost}
      .models=${models}
    ></loquix-model-selector>
  </div>`,
};

export const ShowCapabilities: Story = {
  args: { value: 'claude-3.5-sonnet', showCapabilities: true },
  render: args => html` <div style="width:350px;padding-top:350px">
    <loquix-model-selector
      value=${args.value}
      ?show-capabilities=${args.showCapabilities}
      .models=${models}
    ></loquix-model-selector>
  </div>`,
};

export const Grouped: Story = {
  args: { grouped: true, searchable: true, showCost: true },
  render: args => html` <div style="width:350px;padding-top:400px">
    <loquix-model-selector
      ?grouped=${args.grouped}
      ?searchable=${args.searchable}
      ?show-cost=${args.showCost}
      .models=${models}
    ></loquix-model-selector>
  </div>`,
};

export const Disabled: Story = {
  args: { value: 'gpt-4o', disabled: true },
  render: args => html` <div style="width:300px">
    <loquix-model-selector
      value=${args.value}
      ?disabled=${args.disabled}
      .models=${models}
    ></loquix-model-selector>
  </div>`,
};
