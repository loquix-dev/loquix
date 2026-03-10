import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Configuration/AttachmentChip',
  component: 'loquix-attachment-chip',
  tags: ['autodocs'],
  argTypes: {
    filename: { control: 'text' },
    filetype: { control: 'text' },
    size: { control: 'number' },
    status: { control: 'select', options: ['pending', 'uploading', 'complete', 'error'] },
    purpose: { control: 'select', options: ['style', 'subject', 'source', undefined] },
    removable: { control: 'boolean' },
    progress: { control: { type: 'range', min: 0, max: 100 } },
  },
};
export default meta;

type Story = StoryObj;

export const Complete: Story = {
  args: { filename: 'report.pdf', filetype: 'application/pdf', size: 245000, status: 'complete' },
  render: args =>
    html`<loquix-attachment-chip
      filename=${args.filename}
      filetype=${args.filetype}
      size=${args.size}
      status=${args.status}
      ?removable=${args.removable}
    ></loquix-attachment-chip>`,
};

export const Uploading: Story = {
  args: {
    filename: 'photo.jpg',
    filetype: 'image/jpeg',
    size: 1500000,
    status: 'uploading',
    progress: 65,
  },
  render: args =>
    html`<loquix-attachment-chip
      filename=${args.filename}
      filetype=${args.filetype}
      size=${args.size}
      status=${args.status}
      progress=${args.progress}
    ></loquix-attachment-chip>`,
};

export const Error: Story = {
  args: {
    filename: 'large-video.mp4',
    filetype: 'video/mp4',
    size: 50000000,
    status: 'error',
    error: 'File too large',
  },
  render: args =>
    html`<loquix-attachment-chip
      filename=${args.filename}
      filetype=${args.filetype}
      size=${args.size}
      status=${args.status}
      error=${args.error}
    ></loquix-attachment-chip>`,
};

export const WithPurpose: Story = {
  args: {
    filename: 'style-reference.png',
    filetype: 'image/png',
    size: 800000,
    status: 'complete',
    purpose: 'style',
  },
  render: args =>
    html`<loquix-attachment-chip
      filename=${args.filename}
      filetype=${args.filetype}
      size=${args.size}
      status=${args.status}
      purpose=${args.purpose}
    ></loquix-attachment-chip>`,
};

export const AllStatuses: Story = {
  render: () =>
    html` <div style="display:flex;flex-direction:column;gap:8px">
      <loquix-attachment-chip
        filename="pending.txt"
        filetype="text/plain"
        size="1024"
        status="pending"
      ></loquix-attachment-chip>
      <loquix-attachment-chip
        filename="uploading.csv"
        filetype="text/csv"
        size="50000"
        status="uploading"
        progress="40"
      ></loquix-attachment-chip>
      <loquix-attachment-chip
        filename="complete.pdf"
        filetype="application/pdf"
        size="245000"
        status="complete"
      ></loquix-attachment-chip>
      <loquix-attachment-chip
        filename="error.zip"
        filetype="application/zip"
        size="10000000"
        status="error"
        error="Upload failed"
      ></loquix-attachment-chip>
    </div>`,
};
