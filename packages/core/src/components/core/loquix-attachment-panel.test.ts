import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart } from '../../test-utils.js';
import './define-attachment-panel.js';
import type { LoquixAttachmentPanel } from './loquix-attachment-panel.js';
import type { Attachment } from '../../types/index.js';

const mockAttachments: Attachment[] = [
  {
    id: '1',
    filename: 'report.pdf',
    filetype: 'application/pdf',
    size: 1048576,
    status: 'complete',
  },
  {
    id: '2',
    filename: 'photo.png',
    filetype: 'image/png',
    size: 524288,
    status: 'uploading',
    progress: 45,
  },
];

describe('loquix-attachment-panel', () => {
  it('renders panel', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel></loquix-attachment-panel>`,
    );
    const panel = getShadowPart(el, 'panel');
    expect(panel).to.exist;
  });

  it('renders trigger button when no max reached', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel></loquix-attachment-panel>`,
    );
    const trigger = getShadowPart(el, 'trigger');
    expect(trigger).to.exist;
    expect(trigger!.textContent).to.contain('Add files');
  });

  it('renders attachment chips when attachments provided', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel .attachments=${mockAttachments}></loquix-attachment-panel>`,
    );
    await el.updateComplete;
    const chips = getShadowPart(el, 'chips');
    expect(chips).to.exist;
    const chipElements = el.shadowRoot!.querySelectorAll('loquix-attachment-chip');
    expect(chipElements.length).to.equal(2);
  });

  it('renders no chips when no attachments', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel></loquix-attachment-panel>`,
    );
    const chips = getShadowPart(el, 'chips');
    expect(chips).to.not.exist;
  });

  it('hides trigger when max files reached', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel
        .attachments=${mockAttachments}
        max-files="2"
      ></loquix-attachment-panel>`,
    );
    const trigger = getShadowPart(el, 'trigger');
    expect(trigger).to.not.exist;
  });

  it('dispatches loquix-attachment-remove on chip remove', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel .attachments=${mockAttachments}></loquix-attachment-panel>`,
    );
    await el.updateComplete;
    const eventPromise = waitForEvent(el, 'loquix-attachment-remove');
    // Simulate remove event from first chip
    const chip = el.shadowRoot!.querySelector('loquix-attachment-chip')!;
    chip.dispatchEvent(
      new CustomEvent('loquix-attachment-remove', {
        bubbles: true,
        composed: true,
        detail: { attachment: mockAttachments[0] },
      }),
    );
    const event = await eventPromise;
    expect(event.detail.attachment.id).to.equal('1');
  });

  it('has hidden file input', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel></loquix-attachment-panel>`,
    );
    const input = el.shadowRoot!.querySelector('.file-input') as HTMLInputElement;
    expect(input).to.exist;
    expect(input.type).to.equal('file');
  });

  it('file input accepts multiple by default', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel></loquix-attachment-panel>`,
    );
    const input = el.shadowRoot!.querySelector('.file-input') as HTMLInputElement;
    expect(input.multiple).to.be.true;
  });

  it('trigger is disabled when component is disabled', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel disabled></loquix-attachment-panel>`,
    );
    expect(el.disabled).to.be.true;
    const trigger = getShadowPart(el, 'trigger');
    expect(trigger!.hasAttribute('disabled')).to.be.true;
  });

  it('defaults to accepting all file types', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel></loquix-attachment-panel>`,
    );
    expect(el.acceptedTypes).to.equal('*');
  });

  it('has trigger slot for custom trigger', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel>
        <button slot="trigger">Upload</button>
      </loquix-attachment-panel>`,
    );
    const slot = el.shadowRoot!.querySelector('slot[name="trigger"]') as HTMLSlotElement;
    expect(slot).to.exist;
  });

  it('defaults to max 10 files', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel></loquix-attachment-panel>`,
    );
    expect(el.maxFiles).to.equal(10);
  });

  it('defaults to max 10 MB file size', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel></loquix-attachment-panel>`,
    );
    expect(el.maxSize).to.equal(10485760);
  });

  it('reflects disabled attribute', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel disabled></loquix-attachment-panel>`,
    );
    expect(el.hasAttribute('disabled')).to.be.true;
  });

  // === no-trigger tests ===

  it('no-trigger hides trigger section', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel no-trigger></loquix-attachment-panel>`,
    );
    const trigger = getShadowPart(el, 'trigger');
    expect(trigger).to.not.exist;
    const slot = el.shadowRoot!.querySelector('slot[name="trigger"]');
    expect(slot).to.not.exist;
  });

  it('no-trigger reflects attribute', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel></loquix-attachment-panel>`,
    );
    expect(el.hasAttribute('no-trigger')).to.be.false;
    el.noTrigger = true;
    await el.updateComplete;
    expect(el.hasAttribute('no-trigger')).to.be.true;
  });

  it('no-trigger still renders chips', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel
        no-trigger
        .attachments=${mockAttachments}
      ></loquix-attachment-panel>`,
    );
    const chips = getShadowPart(el, 'chips');
    expect(chips).to.exist;
    const chipElements = el.shadowRoot!.querySelectorAll('loquix-attachment-chip');
    expect(chipElements.length).to.equal(2);
  });

  it('no-trigger still has hidden file input', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel no-trigger></loquix-attachment-panel>`,
    );
    const input = el.shadowRoot!.querySelector('.file-input') as HTMLInputElement;
    expect(input).to.exist;
    expect(input.type).to.equal('file');
  });

  // === openFilePicker tests ===

  it('openFilePicker opens file input', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel></loquix-attachment-panel>`,
    );
    const input = el.shadowRoot!.querySelector('.file-input') as HTMLInputElement;
    let clicked = false;
    input.addEventListener('click', () => {
      clicked = true;
    });
    el.openFilePicker();
    expect(clicked).to.be.true;
  });

  it('openFilePicker respects disabled', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel disabled></loquix-attachment-panel>`,
    );
    const input = el.shadowRoot!.querySelector('.file-input') as HTMLInputElement;
    let clicked = false;
    input.addEventListener('click', () => {
      clicked = true;
    });
    el.openFilePicker();
    expect(clicked).to.be.false;
  });

  it('openFilePicker respects maxFiles', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel
        .attachments=${mockAttachments}
        max-files="2"
      ></loquix-attachment-panel>`,
    );
    const input = el.shadowRoot!.querySelector('.file-input') as HTMLInputElement;
    let clicked = false;
    input.addEventListener('click', () => {
      clicked = true;
    });
    el.openFilePicker();
    expect(clicked).to.be.false;
  });

  // === addFiles() tests ===

  it('addFiles dispatches loquix-attachment-add', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel></loquix-attachment-panel>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-attachment-add');
    const file = new File(['data'], 'screenshot.png', { type: 'image/png' });
    el.addFiles([file]);
    const event = await eventPromise;
    expect(event.detail.attachments).to.have.lengthOf(1);
    expect(event.detail.attachments[0].filename).to.equal('screenshot.png');
  });

  it('addFiles with empty array does nothing', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel></loquix-attachment-panel>`,
    );
    let fired = false;
    el.addEventListener('loquix-attachment-add', () => {
      fired = true;
    });
    el.addFiles([]);
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('addFiles respects disabled', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel disabled></loquix-attachment-panel>`,
    );
    let fired = false;
    el.addEventListener('loquix-attachment-add', () => {
      fired = true;
    });
    const file = new File(['data'], 'screenshot.png', { type: 'image/png' });
    el.addFiles([file]);
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  // === File type validation (acceptedTypes) ===

  it('acceptedTypes filters by extension', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel accepted-types=".pdf,.txt"></loquix-attachment-panel>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-attachment-add');
    const pdfFile = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    const pngFile = new File(['data'], 'img.png', { type: 'image/png' });
    const txtFile = new File(['data'], 'readme.txt', { type: 'text/plain' });
    el.addFiles([pdfFile, pngFile, txtFile]);
    const event = await eventPromise;
    // Only pdf and txt should pass
    expect(event.detail.attachments).to.have.lengthOf(2);
    const filenames = event.detail.attachments.map((a: Attachment) => a.filename);
    expect(filenames).to.include('doc.pdf');
    expect(filenames).to.include('readme.txt');
    expect(filenames).to.not.include('img.png');
  });

  it('acceptedTypes filters by MIME type wildcard', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel accepted-types="image/*"></loquix-attachment-panel>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-attachment-add');
    const pngFile = new File(['data'], 'img.png', { type: 'image/png' });
    const jpgFile = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    const pdfFile = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    el.addFiles([pngFile, jpgFile, pdfFile]);
    const event = await eventPromise;
    expect(event.detail.attachments).to.have.lengthOf(2);
    const filenames = event.detail.attachments.map((a: Attachment) => a.filename);
    expect(filenames).to.include('img.png');
    expect(filenames).to.include('photo.jpg');
  });

  it('acceptedTypes filters by exact MIME type', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel accepted-types="application/pdf"></loquix-attachment-panel>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-attachment-add');
    const pdfFile = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    const pngFile = new File(['data'], 'img.png', { type: 'image/png' });
    el.addFiles([pdfFile, pngFile]);
    const event = await eventPromise;
    expect(event.detail.attachments).to.have.lengthOf(1);
    expect(event.detail.attachments[0].filename).to.equal('doc.pdf');
  });

  // === Max file size validation (maxSize) ===

  it('maxSize filters out files exceeding limit', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel max-size="1000"></loquix-attachment-panel>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-attachment-add');
    const smallFile = new File(['x'.repeat(500)], 'small.txt', { type: 'text/plain' });
    const largeFile = new File(['x'.repeat(2000)], 'large.txt', { type: 'text/plain' });
    el.addFiles([smallFile, largeFile]);
    const event = await eventPromise;
    expect(event.detail.attachments).to.have.lengthOf(1);
    expect(event.detail.attachments[0].filename).to.equal('small.txt');
  });

  it('maxSize=0 allows all file sizes', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel max-size="0"></loquix-attachment-panel>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-attachment-add');
    const largeFile = new File(['x'.repeat(50000)], 'big.bin', {
      type: 'application/octet-stream',
    });
    el.addFiles([largeFile]);
    const event = await eventPromise;
    expect(event.detail.attachments).to.have.lengthOf(1);
  });

  // === Trigger button label from localization ===

  it('trigger button uses localized label by default', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel></loquix-attachment-panel>`,
    );
    const trigger = getShadowPart(el, 'trigger');
    expect(trigger).to.exist;
    expect(trigger!.textContent).to.contain('Add files');
  });

  it('trigger button uses custom triggerLabel when provided', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel trigger-label="Upload documents"></loquix-attachment-panel>`,
    );
    const trigger = getShadowPart(el, 'trigger');
    expect(trigger).to.exist;
    expect(trigger!.textContent).to.contain('Upload documents');
  });

  // === addFiles() public method adds files ===

  it('addFiles dispatches event with multiple files', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel></loquix-attachment-panel>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-attachment-add');
    const file1 = new File(['data1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['data2'], 'file2.txt', { type: 'text/plain' });
    const file3 = new File(['data3'], 'file3.txt', { type: 'text/plain' });
    el.addFiles([file1, file2, file3]);
    const event = await eventPromise;
    expect(event.detail.attachments).to.have.lengthOf(3);
  });

  // === Multiple files can be added ===

  it('multiple=false limits to single file', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel .multiple=${false}></loquix-attachment-panel>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-attachment-add');
    const file1 = new File(['data1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['data2'], 'file2.txt', { type: 'text/plain' });
    el.addFiles([file1, file2]);
    const event = await eventPromise;
    expect(event.detail.attachments).to.have.lengthOf(1);
    expect(event.detail.attachments[0].filename).to.equal('file1.txt');
  });

  it('addFiles respects remaining maxFiles capacity', async () => {
    const existing: Attachment[] = [
      {
        id: '1',
        filename: 'existing.pdf',
        filetype: 'application/pdf',
        size: 100,
        status: 'complete',
      },
      {
        id: '2',
        filename: 'existing2.pdf',
        filetype: 'application/pdf',
        size: 100,
        status: 'complete',
      },
    ];
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel
        .attachments=${existing}
        max-files="3"
      ></loquix-attachment-panel>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-attachment-add');
    const file1 = new File(['a'], 'new1.txt', { type: 'text/plain' });
    const file2 = new File(['b'], 'new2.txt', { type: 'text/plain' });
    el.addFiles([file1, file2]);
    const event = await eventPromise;
    // Only 1 remaining capacity (3 - 2 existing = 1)
    expect(event.detail.attachments).to.have.lengthOf(1);
    expect(event.detail.attachments[0].filename).to.equal('new1.txt');
  });

  it('no event dispatched when all files are filtered out', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel accepted-types=".pdf"></loquix-attachment-panel>`,
    );
    let fired = false;
    el.addEventListener('loquix-attachment-add', () => {
      fired = true;
    });
    const pngFile = new File(['data'], 'img.png', { type: 'image/png' });
    el.addFiles([pngFile]);
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('file input accept attribute matches acceptedTypes', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel accepted-types=".pdf,image/*"></loquix-attachment-panel>`,
    );
    const input = el.shadowRoot!.querySelector('.file-input') as HTMLInputElement;
    expect(input.accept).to.equal('.pdf,image/*');
  });

  it('file input multiple attribute is false when multiple=false', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel .multiple=${false}></loquix-attachment-panel>`,
    );
    const input = el.shadowRoot!.querySelector('.file-input') as HTMLInputElement;
    expect(input.multiple).to.be.false;
  });

  // === Codex-found fix: */* accepted types handling (2.12) ===

  it('acceptedTypes="*/*" allows all file types (treated as allow-all)', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel accepted-types="*/*"></loquix-attachment-panel>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-attachment-add');
    const pdfFile = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    const pngFile = new File(['data'], 'img.png', { type: 'image/png' });
    const txtFile = new File(['data'], 'readme.txt', { type: 'text/plain' });
    el.addFiles([pdfFile, pngFile, txtFile]);
    const event = await eventPromise;
    // All three files should pass — */* is treated the same as *
    expect(event.detail.attachments).to.have.lengthOf(3);
  });

  it('acceptedTypes=" */* " with whitespace allows all file types', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel accepted-types=" */* "></loquix-attachment-panel>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-attachment-add');
    const file = new File(['data'], 'archive.zip', { type: 'application/zip' });
    el.addFiles([file]);
    const event = await eventPromise;
    expect(event.detail.attachments).to.have.lengthOf(1);
  });

  it('acceptedTypes=" * " with whitespace-padded wildcard allows all file types', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel accepted-types=" * "></loquix-attachment-panel>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-attachment-add');
    const file = new File(['data'], 'anything.xyz', { type: 'application/octet-stream' });
    el.addFiles([file]);
    const event = await eventPromise;
    expect(event.detail.attachments).to.have.lengthOf(1);
  });

  it('acceptedTypes="*/*,.pdf" mixed list with wildcard allows all file types', async () => {
    const el = await fixture<LoquixAttachmentPanel>(
      html`<loquix-attachment-panel accepted-types="*/*,.pdf"></loquix-attachment-panel>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-attachment-add');
    const file = new File(['data'], 'archive.zip', { type: 'application/zip' });
    el.addFiles([file]);
    const event = await eventPromise;
    expect(event.detail.attachments).to.have.lengthOf(1);
  });
});
