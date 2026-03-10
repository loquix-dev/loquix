import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Recipes/Composer with Configuration',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj;

const modes = [
  { value: 'chat', label: 'Chat', icon: '💬' },
  { value: 'research', label: 'Research', icon: '🔍' },
  { value: 'build', label: 'Build', icon: '🔧' },
];

const models = [
  {
    value: 'claude-3.5-sonnet',
    label: 'Claude 3.5 Sonnet',
    description: 'Fast and capable',
    group: 'Anthropic',
  },
  {
    value: 'claude-3-opus',
    label: 'Claude 3 Opus',
    description: 'Most capable',
    group: 'Anthropic',
  },
  { value: 'gpt-4o', label: 'GPT-4o', description: 'Multimodal', group: 'OpenAI' },
];

const parameters = [
  {
    id: 'temperature',
    label: 'Temperature',
    type: 'range' as const,
    min: 0,
    max: 2,
    step: 0.1,
    default: 0.7,
  },
  {
    id: 'max_tokens',
    label: 'Max Tokens',
    type: 'number' as const,
    min: 1,
    max: 4096,
    default: 1024,
  },
  { id: 'stream', label: 'Stream', type: 'toggle' as const, default: true },
];

export const ModeAndModelToolbar: Story = {
  render: () =>
    html` <div style="width:600px">
      <loquix-chat-composer variant="contained" placeholder="Ask Claude anything...">
        <loquix-composer-toolbar slot="toolbar-top" border="bottom">
          <loquix-mode-selector variant="pills" value="chat" .modes=${modes}></loquix-mode-selector>
        </loquix-composer-toolbar>
        <loquix-composer-toolbar slot="toolbar-bottom" border="top">
          <loquix-model-selector
            value="claude-3.5-sonnet"
            .models=${models}
          ></loquix-model-selector>
        </loquix-composer-toolbar>
      </loquix-chat-composer>
    </div>`,
};

export const WithAttachments: Story = {
  render: () =>
    html` <div style="width:600px">
      <loquix-chat-composer variant="contained" placeholder="Attach files and ask...">
        <loquix-attachment-panel
          slot="toolbar-top"
          .attachments=${[
            {
              id: '1',
              filename: 'design.fig',
              filetype: 'application/fig',
              size: 340000,
              status: 'complete' as const,
            },
            {
              id: '2',
              filename: 'data.csv',
              filetype: 'text/csv',
              size: 150000,
              status: 'uploading' as const,
              progress: 75,
            },
          ]}
        ></loquix-attachment-panel>
        <loquix-composer-toolbar slot="toolbar-bottom" border="top">
          <loquix-model-selector
            value="claude-3.5-sonnet"
            .models=${models}
          ></loquix-model-selector>
        </loquix-composer-toolbar>
      </loquix-chat-composer>
    </div>`,
};

export const FullFeatured: Story = {
  render: () =>
    html` <div style="width:700px">
      <loquix-chat-composer variant="contained" placeholder="Type a message...">
        <loquix-composer-toolbar slot="toolbar-top" border="bottom">
          <loquix-mode-selector variant="pills" value="chat" .modes=${modes}></loquix-mode-selector>
        </loquix-composer-toolbar>

        <loquix-suggestion-chips
          slot="suggestions"
          variant="chip"
          .suggestions=${[
            { id: '1', text: 'Write a function', icon: '💻' },
            { id: '2', text: 'Explain concept', icon: '💡' },
            { id: '3', text: 'Debug error', icon: '🐛' },
          ]}
        ></loquix-suggestion-chips>

        <loquix-composer-toolbar slot="toolbar-bottom" border="top">
          <loquix-model-selector
            value="claude-3.5-sonnet"
            .models=${models}
          ></loquix-model-selector>
        </loquix-composer-toolbar>
      </loquix-chat-composer>
    </div>`,
};

export const WithParameterPanel: Story = {
  render: () =>
    html` <div style="display:flex;gap:24px;align-items:start">
      <div style="width:500px">
        <loquix-chat-composer variant="contained" placeholder="Ask anything...">
          <loquix-composer-toolbar slot="toolbar-bottom" border="top">
            <loquix-model-selector
              value="claude-3.5-sonnet"
              .models=${models}
            ></loquix-model-selector>
          </loquix-composer-toolbar>
        </loquix-chat-composer>
      </div>
      <div style="width:280px">
        <loquix-parameter-panel
          compact
          .parameters=${parameters}
          .values=${{ temperature: 0.7, max_tokens: 1024, stream: true }}
          .presets=${[
            {
              id: 'creative',
              label: 'Creative',
              values: { temperature: 1.2, max_tokens: 2048, stream: true },
            },
            {
              id: 'precise',
              label: 'Precise',
              values: { temperature: 0.2, max_tokens: 512, stream: true },
            },
          ]}
        ></loquix-parameter-panel>
      </div>
    </div>`,
};
