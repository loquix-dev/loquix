import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { Attachment } from '@loquix/core';

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const imageAttachments: Attachment[] = [
  {
    id: 'img-1',
    filename: 'hero-banner.jpg',
    filetype: 'image/jpeg',
    size: 2400000,
    status: 'complete',
    url: 'https://picsum.photos/seed/hero/400/300',
  },
  {
    id: 'img-2',
    filename: 'product-shot.png',
    filetype: 'image/png',
    size: 1800000,
    status: 'complete',
    url: 'https://picsum.photos/seed/product/400/300',
  },
  {
    id: 'img-3',
    filename: 'diagram.webp',
    filetype: 'image/webp',
    size: 950000,
    status: 'complete',
    url: 'https://picsum.photos/seed/diagram/400/300',
  },
];

const mixedAttachments: Attachment[] = [
  {
    id: 'f-1',
    filename: 'quarterly-report.pdf',
    filetype: 'application/pdf',
    size: 3200000,
    status: 'complete',
    url: 'https://example.com/report.pdf',
  },
  {
    id: 'f-2',
    filename: 'screenshot.png',
    filetype: 'image/png',
    size: 1500000,
    status: 'complete',
    url: 'https://picsum.photos/seed/screen/400/300',
  },
  { id: 'f-3', filename: 'dataset.csv', filetype: 'csv', size: 50000, status: 'complete' },
  { id: 'f-4', filename: 'presentation.pptx', filetype: 'doc', size: 8500000, status: 'complete' },
  { id: 'f-5', filename: 'archive.zip', filetype: 'zip', size: 15000000, status: 'complete' },
];

const manyAttachments: Attachment[] = [
  ...mixedAttachments,
  { id: 'f-6', filename: 'notes.md', filetype: 'md', size: 4200, status: 'complete' },
  { id: 'f-7', filename: 'styles.css', filetype: 'css', size: 12000, status: 'complete' },
  { id: 'f-8', filename: 'app.tsx', filetype: 'tsx', size: 8500, status: 'complete' },
  {
    id: 'f-9',
    filename: 'background-music.mp3',
    filetype: 'audio/mpeg',
    size: 4500000,
    status: 'complete',
  },
  {
    id: 'f-10',
    filename: 'demo-video.mp4',
    filetype: 'video/mp4',
    size: 25000000,
    status: 'complete',
  },
];

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Configuration/MessageAttachments',
  component: 'loquix-message-attachments',
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    removable: { control: 'boolean' },
    maxVisible: { control: 'number' },
  },
};
export default meta;

type Story = StoryObj;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default — mixed file types at medium size. */
export const Default: Story = {
  args: { size: 'md', removable: false, maxVisible: 0 },
  render: args => html` <div style="width:500px">
    <loquix-message-attachments
      size=${args.size}
      ?removable=${args.removable}
      max-visible=${args.maxVisible}
      .attachments=${mixedAttachments}
    ></loquix-message-attachments>
  </div>`,
};

/** Image gallery — cards with image previews. */
export const ImageGallery: Story = {
  render: () => html` <div style="width:500px">
    <loquix-message-attachments
      size="lg"
      .attachments=${imageAttachments}
    ></loquix-message-attachments>
  </div>`,
};

/** Small size — compact thumbnails, no filename. Tooltip on hover shows full name. */
export const SizeSmall: Story = {
  render: () => html` <div style="width:500px">
    <loquix-message-attachments
      size="sm"
      .attachments=${mixedAttachments}
    ></loquix-message-attachments>
  </div>`,
};

/** Medium size — thumbnail + truncated filename. */
export const SizeMedium: Story = {
  render: () => html` <div style="width:500px">
    <loquix-message-attachments
      size="md"
      .attachments=${mixedAttachments}
    ></loquix-message-attachments>
  </div>`,
};

/** Large size — thumbnail + filename + file size. */
export const SizeLarge: Story = {
  render: () => html` <div style="width:500px">
    <loquix-message-attachments
      size="lg"
      .attachments=${mixedAttachments}
    ></loquix-message-attachments>
  </div>`,
};

/** Removable — shows "x" button on each card. Useful for edit mode. */
export const Removable: Story = {
  render: () => html` <div style="width:500px">
    <loquix-message-attachments
      size="md"
      removable
      .attachments=${mixedAttachments}
      @loquix-attachment-remove=${(e: CustomEvent) => {
        console.log('Remove:', e.detail.attachment.filename);
      }}
    ></loquix-message-attachments>
  </div>`,
};

/** Overflow — only first 4 visible, "+N more" button expands the rest. */
export const WithOverflow: Story = {
  render: () => html` <div style="width:500px">
    <loquix-message-attachments
      size="md"
      max-visible="4"
      .attachments=${manyAttachments}
    ></loquix-message-attachments>
  </div>`,
};

/** Inside a message — typical usage within loquix-message-item. */
export const InsideMessage: Story = {
  render: () => html` <div style="width:600px">
    <loquix-message-item
      sender="assistant"
      status="complete"
      model="Claude 3.5"
      timestamp="3:42 PM"
    >
      <p>Here are the files you requested.</p>
      <loquix-message-attachments
        size="md"
        .attachments=${mixedAttachments}
      ></loquix-message-attachments>
    </loquix-message-item>
  </div>`,
};

/** User message with image attachments. */
export const UserMessageWithImages: Story = {
  render: () => html` <div style="width:600px">
    <loquix-message-item sender="user" status="complete">
      <p>Take a look at these designs.</p>
      <loquix-message-attachments
        size="lg"
        .attachments=${imageAttachments}
      ></loquix-message-attachments>
    </loquix-message-item>
  </div>`,
};

/** Single file — a common case with just one attachment. */
export const SingleFile: Story = {
  render: () => html` <div style="width:500px">
    <loquix-message-attachments
      size="md"
      .attachments=${[mixedAttachments[0]]}
    ></loquix-message-attachments>
  </div>`,
};

/** Vertical (portrait) image previews — demonstrates object-fit: cover cropping. */
export const VerticalImages: Story = {
  render: () => html` <div style="width:500px">
    <loquix-message-attachments
      size="lg"
      .attachments=${[
        {
          id: 'v-1',
          filename: 'portrait-photo.jpg',
          filetype: 'image/jpeg',
          size: 3100000,
          status: 'complete',
          url: 'https://picsum.photos/seed/portrait1/300/500',
        },
        {
          id: 'v-2',
          filename: 'mobile-screenshot.png',
          filetype: 'image/png',
          size: 2200000,
          status: 'complete',
          url: 'https://picsum.photos/seed/portrait2/300/500',
        },
        {
          id: 'v-3',
          filename: 'story-frame.webp',
          filetype: 'image/webp',
          size: 1400000,
          status: 'complete',
          url: 'https://picsum.photos/seed/portrait3/300/500',
        },
      ] as Attachment[]}
    ></loquix-message-attachments>
  </div>`,
};

/** Horizontal (landscape) image previews — wide images cropped to square thumbnails. */
export const HorizontalImages: Story = {
  render: () => html` <div style="width:500px">
    <loquix-message-attachments
      size="lg"
      .attachments=${[
        {
          id: 'h-1',
          filename: 'panorama-view.jpg',
          filetype: 'image/jpeg',
          size: 4200000,
          status: 'complete',
          url: 'https://picsum.photos/seed/pano1/800/400',
        },
        {
          id: 'h-2',
          filename: 'banner-wide.png',
          filetype: 'image/png',
          size: 2800000,
          status: 'complete',
          url: 'https://picsum.photos/seed/pano2/800/400',
        },
        {
          id: 'h-3',
          filename: 'landscape-shot.webp',
          filetype: 'image/webp',
          size: 1900000,
          status: 'complete',
          url: 'https://picsum.photos/seed/pano3/800/400',
        },
      ] as Attachment[]}
    ></loquix-message-attachments>
  </div>`,
};

/** Extra-small size — horizontal inline cards with icon + filename + size. */
export const SizeExtraSmall: Story = {
  render: () => html` <div style="width:400px">
    <loquix-message-attachments
      size="xs"
      .attachments=${mixedAttachments}
    ></loquix-message-attachments>
  </div>`,
};

/** Below-bubble slot — attachments rendered outside the message bubble. */
export const BelowBubble: Story = {
  render: () => html` <div style="width:600px">
    <loquix-message-item
      sender="assistant"
      status="complete"
      model="Claude 3.5"
      timestamp="4:10 PM"
    >
      <p>Here are the files you requested.</p>
      <loquix-message-attachments
        slot="below-bubble"
        size="xs"
        .attachments=${mixedAttachments}
      ></loquix-message-attachments>
    </loquix-message-item>
  </div>`,
};
