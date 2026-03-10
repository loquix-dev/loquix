import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const sampleAttachments = [
  {
    id: '1',
    filename: 'design-spec.pdf',
    filetype: 'application/pdf',
    size: 245000,
    status: 'complete' as const,
  },
  {
    id: '2',
    filename: 'screenshot.png',
    filetype: 'image/png',
    size: 1500000,
    status: 'complete' as const,
  },
  {
    id: '3',
    filename: 'data.csv',
    filetype: 'text/csv',
    size: 50000,
    status: 'uploading' as const,
    progress: 60,
  },
];

const meta: Meta = {
  title: 'Configuration/AttachmentPanel',
  component: 'loquix-attachment-panel',
  tags: ['autodocs'],
  argTypes: {
    acceptedTypes: { control: 'text' },
    maxFiles: { control: 'number' },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj;

export const Empty: Story = {
  args: { maxFiles: 10 },
  render: args =>
    html` <div style="width:500px">
      <loquix-attachment-panel
        max-files=${args.maxFiles}
        ?disabled=${args.disabled}
      ></loquix-attachment-panel>
    </div>`,
};

export const WithAttachments: Story = {
  render: () =>
    html` <div style="width:500px">
      <loquix-attachment-panel .attachments=${sampleAttachments}></loquix-attachment-panel>
    </div>`,
};

export const ImagesOnly: Story = {
  args: { acceptedTypes: 'image/*', maxFiles: 5 },
  render: args =>
    html` <div style="width:500px">
      <loquix-attachment-panel
        accepted-types=${args.acceptedTypes}
        max-files=${args.maxFiles}
      ></loquix-attachment-panel>
    </div>`,
};

export const SingleFile: Story = {
  args: { multiple: false, maxFiles: 1 },
  render: args =>
    html` <div style="width:500px">
      <loquix-attachment-panel
        ?multiple=${args.multiple}
        max-files=${args.maxFiles}
      ></loquix-attachment-panel>
    </div>`,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: args =>
    html` <div style="width:500px">
      <loquix-attachment-panel
        ?disabled=${args.disabled}
        .attachments=${sampleAttachments}
      ></loquix-attachment-panel>
    </div>`,
};
