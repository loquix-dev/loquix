import type { Meta, StoryObj } from '@storybook/web-components';
import { html, svg } from 'lit';
import { ref } from 'lit/directives/ref.js';

const meta: Meta = {
  title: 'Recipes/File Upload',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj;

/**
 * Wire up controlled attachment-panel state once per composer element.
 * Handles add (from paste, drag-and-drop, file picker) and remove events.
 */
const wiredSet = new WeakSet();

function wireComposer(el: Element | undefined) {
  if (!el || wiredSet.has(el)) return;
  wiredSet.add(el);

  const panel = el.querySelector('loquix-attachment-panel') as any;
  if (!panel) return;

  el.addEventListener('loquix-attachment-add', ((e: CustomEvent) => {
    panel.attachments = [...panel.attachments, ...e.detail.attachments];
  }) as EventListener);

  el.addEventListener('loquix-attachment-remove', ((e: CustomEvent) => {
    panel.attachments = panel.attachments.filter((a: any) => a.id !== e.detail.attachmentId);
  }) as EventListener);
}

/** Open file picker via the slotted attachment-panel. */
function openPicker(e: Event) {
  const composer = (e.target as HTMLElement).closest('loquix-chat-composer');
  const panel = composer?.querySelector('loquix-attachment-panel') as any;
  panel?.openFilePicker();
}

/** Reusable upload button for actions-left slot. */
const uploadButton = html` <button
  slot="actions-left"
  @click=${openPicker}
  title="Attach files"
  style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:none;border-radius:8px;background:transparent;color:inherit;cursor:pointer;opacity:0.5;transition:opacity .15s"
  @mouseenter=${(e: Event) => ((e.target as HTMLElement).style.opacity = '0.8')}
  @mouseleave=${(e: Event) => ((e.target as HTMLElement).style.opacity = '0.5')}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path
      d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
    />
  </svg>
</button>`;

/** Default attachment panel with built-in trigger button. */
export const Default: Story = {
  render: () =>
    html` <div style="width:600px">
      <loquix-chat-composer
        variant="contained"
        placeholder="Type a message..."
        ${ref(wireComposer)}
      >
        <loquix-attachment-panel slot="toolbar-top"></loquix-attachment-panel>
      </loquix-chat-composer>
    </div>`,
};

/** Paste files from clipboard. */
export const PasteToUpload: Story = {
  render: () =>
    html` <div style="width:600px">
      <p style="margin:0 0 12px;font-size:0.875rem;color:var(--loquix-text-secondary-color,#666)">
        Copy a file to the clipboard, then press
        <kbd style="padding:2px 6px;border:1px solid #ccc;border-radius:4px;font-size:0.8125rem"
          >⌘V</kbd
        >
        /
        <kbd style="padding:2px 6px;border:1px solid #ccc;border-radius:4px;font-size:0.8125rem"
          >Ctrl+V</kbd
        >
        inside the input.
      </p>
      <loquix-chat-composer
        variant="contained"
        placeholder="Paste a file here..."
        ${ref(wireComposer)}
      >
        <loquix-attachment-panel slot="toolbar-top" no-trigger></loquix-attachment-panel>
        ${uploadButton}
      </loquix-chat-composer>
    </div>`,
};

/** Drag and drop files onto the input area. */
export const DragAndDrop: Story = {
  render: () =>
    html` <div style="width:600px">
      <p style="margin:0 0 12px;font-size:0.875rem;color:var(--loquix-text-secondary-color,#666)">
        Drag files from your file manager onto the input area below.
      </p>
      <loquix-chat-composer
        variant="contained"
        placeholder="Drop files here..."
        ${ref(wireComposer)}
      >
        <loquix-attachment-panel slot="toolbar-top" no-trigger></loquix-attachment-panel>
        ${uploadButton}
      </loquix-chat-composer>
    </div>`,
};

/** Click the paperclip icon to open the native file picker. */
export const FilePicker: Story = {
  render: () =>
    html` <div style="width:600px">
      <p style="margin:0 0 12px;font-size:0.875rem;color:var(--loquix-text-secondary-color,#666)">
        Click the paperclip icon below the input to open the file picker.
      </p>
      <loquix-chat-composer
        variant="contained"
        placeholder="Type a message..."
        ${ref(wireComposer)}
      >
        <loquix-attachment-panel slot="toolbar-top" no-trigger></loquix-attachment-panel>
        ${uploadButton}
      </loquix-chat-composer>
    </div>`,
};

/** All upload methods work together — paste, drag-and-drop, and file picker. */
export const Combined: Story = {
  render: () =>
    html` <div style="width:600px">
      <p style="margin:0 0 12px;font-size:0.875rem;color:var(--loquix-text-secondary-color,#666)">
        Upload files via paste, drag-and-drop, or the paperclip button. Files appear alongside
        existing attachments.
      </p>
      <loquix-chat-composer
        variant="contained"
        placeholder="Type a message..."
        ${ref(wireComposer)}
      >
        <loquix-attachment-panel
          slot="toolbar-top"
          no-trigger
          .attachments=${[
            {
              id: '1',
              filename: 'report.pdf',
              filetype: 'application/pdf',
              size: 245000,
              status: 'complete' as const,
            },
            {
              id: '2',
              filename: 'data.csv',
              filetype: 'text/csv',
              size: 50000,
              status: 'complete' as const,
            },
          ]}
        ></loquix-attachment-panel>
        ${uploadButton}
      </loquix-chat-composer>
    </div>`,
};

/** Only images are accepted — other file types are silently rejected. */
export const ImagesOnly: Story = {
  render: () =>
    html` <div style="width:600px">
      <p style="margin:0 0 12px;font-size:0.875rem;color:var(--loquix-text-secondary-color,#666)">
        Only image files are accepted. Non-image files will be rejected.
      </p>
      <loquix-chat-composer variant="contained" placeholder="Upload images..." ${ref(wireComposer)}>
        <loquix-attachment-panel
          slot="toolbar-top"
          no-trigger
          accepted-types="image/*"
        ></loquix-attachment-panel>
        ${uploadButton}
      </loquix-chat-composer>
    </div>`,
};

/** Dropdown menu with "+" button — extensible for future sources (Google Drive, etc.). */
export const WithDropdownMenu: Story = {
  render: () => {
    const uploadIcon = svg`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;

    const attachOptions = [
      { value: 'device', label: 'From device', icon: uploadIcon, type: 'action' as const },
    ];

    function handleSelect(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail.value === 'device') {
        const composer = (e.target as HTMLElement).closest('loquix-chat-composer');
        const panel = composer?.querySelector('loquix-attachment-panel') as any;
        panel?.openFilePicker();
      }
    }

    return html` <div style="width:600px">
      <p style="margin:0 0 12px;font-size:0.875rem;color:var(--loquix-text-secondary-color,#666)">
        Click the "+" button to open the attachment menu.
      </p>
      <loquix-chat-composer
        variant="contained"
        placeholder="Type a message..."
        ${ref(wireComposer)}
      >
        <loquix-attachment-panel slot="toolbar-top" no-trigger></loquix-attachment-panel>
        <loquix-dropdown-select
          slot="actions-left"
          placeholder=""
          no-chevron
          .options=${attachOptions}
          @loquix-select-change=${handleSelect}
          style="--loquix-dropdown-trigger-padding:6px;--loquix-dropdown-trigger-radius:8px;--loquix-dropdown-min-width:180px"
        >
          <span
            slot="trigger-icon"
            style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;font-size:1.25rem;line-height:1"
            >+</span
          >
        </loquix-dropdown-select>
      </loquix-chat-composer>
    </div>`;
  },
};

/** Single file upload — only one file allowed at a time. */
export const SingleFile: Story = {
  render: () =>
    html` <div style="width:600px">
      <p style="margin:0 0 12px;font-size:0.875rem;color:var(--loquix-text-secondary-color,#666)">
        Only one file can be attached at a time.
      </p>
      <loquix-chat-composer
        variant="contained"
        placeholder="Attach a single file..."
        ${ref(wireComposer)}
      >
        <loquix-attachment-panel
          slot="toolbar-top"
          no-trigger
          max-files="1"
          .multiple=${false}
        ></loquix-attachment-panel>
        ${uploadButton}
      </loquix-chat-composer>
    </div>`,
};
