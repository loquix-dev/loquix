import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const simpleOptions = [
  { value: 'opt1', label: 'Option One' },
  { value: 'opt2', label: 'Option Two' },
  { value: 'opt3', label: 'Option Three' },
  { value: 'opt4', label: 'Option Four', disabled: true },
];

const groupedOptions = [
  { value: 'gpt4', label: 'GPT-4', group: 'OpenAI', description: 'Most capable' },
  { value: 'gpt35', label: 'GPT-3.5', group: 'OpenAI', description: 'Fast and efficient' },
  { value: 'claude3', label: 'Claude 3.5', group: 'Anthropic', description: 'Latest Sonnet' },
  { value: 'claude2', label: 'Claude 2', group: 'Anthropic' },
  { value: 'gemini', label: 'Gemini Pro', group: 'Google', description: 'Multimodal' },
];

const meta: Meta = {
  title: 'Configuration/DropdownSelect',
  component: 'loquix-dropdown-select',
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    value: { control: 'text' },
    searchable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placement: { control: 'select', options: ['top', 'bottom'] },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: { placeholder: 'Select an option...' },
  render: args =>
    html` <div style="width:300px;padding-top:200px">
      <loquix-dropdown-select
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
        .options=${simpleOptions}
      ></loquix-dropdown-select>
    </div>`,
};

export const WithValue: Story = {
  args: { value: 'opt2', placeholder: 'Select...' },
  render: args =>
    html` <div style="width:300px;padding-top:200px">
      <loquix-dropdown-select
        value=${args.value}
        placeholder=${args.placeholder}
        .options=${simpleOptions}
      ></loquix-dropdown-select>
    </div>`,
};

export const Searchable: Story = {
  args: { searchable: true, placeholder: 'Search options...' },
  render: args =>
    html` <div style="width:300px;padding-top:200px">
      <loquix-dropdown-select
        ?searchable=${args.searchable}
        placeholder=${args.placeholder}
        .options=${simpleOptions}
      ></loquix-dropdown-select>
    </div>`,
};

export const Grouped: Story = {
  args: { placeholder: 'Choose a model...' },
  render: args =>
    html` <div style="width:300px;padding-top:300px">
      <loquix-dropdown-select
        placeholder=${args.placeholder}
        searchable
        .options=${groupedOptions}
      ></loquix-dropdown-select>
    </div>`,
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Disabled' },
  render: args =>
    html` <div style="width:300px">
      <loquix-dropdown-select
        ?disabled=${args.disabled}
        placeholder=${args.placeholder}
        .options=${simpleOptions}
      ></loquix-dropdown-select>
    </div>`,
};

export const WithActions: Story = {
  render: () =>
    html` <div style="width:300px;padding-top:250px">
      <loquix-dropdown-select
        placeholder="Select..."
        .options=${[
          ...simpleOptions,
          { value: '', label: '', type: 'separator' },
          { value: 'add-new', label: 'Add new option', type: 'action', icon: '+' },
        ]}
      ></loquix-dropdown-select>
    </div>`,
};
