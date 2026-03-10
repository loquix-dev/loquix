import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart } from '../../test-utils.js';
import './define-drop-zone.js';
import type { LoquixDropZone } from './loquix-drop-zone.js';

// === Helper: create a mock DragEvent with proper DataTransfer ===

function createDragEvent(
  type: string,
  files?: File[],
  dataTransferTypes: string[] = ['Files'],
): DragEvent {
  const event = new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
  });

  const dt = new DataTransfer();
  if (files) {
    for (const file of files) {
      dt.items.add(file);
    }
  }

  // For non-file drags, add text data instead
  if (!dataTransferTypes.includes('Files')) {
    for (const t of dataTransferTypes) {
      dt.setData(t, 'mock');
    }
  }

  // Override types to simulate browser behavior:
  // During dragenter/dragleave, browser exposes types=['Files'] even without actual file access
  Object.defineProperty(dt, 'types', {
    value: dataTransferTypes,
    writable: false,
  });

  Object.defineProperty(event, 'dataTransfer', { value: dt, writable: false });

  return event;
}

function mockFile(name: string, type: string, size = 1024): File {
  return new File([new ArrayBuffer(size)], name, { type });
}

describe('loquix-drop-zone', () => {
  it('renders slotted content', async () => {
    const el = await fixture<LoquixDropZone>(
      html`<loquix-drop-zone><div id="child">Hello</div></loquix-drop-zone>`,
    );
    const slot = el.shadowRoot!.querySelector('slot');
    expect(slot).to.exist;
    const child = el.querySelector('#child');
    expect(child).to.exist;
    expect(child!.textContent).to.equal('Hello');
  });

  it('renders overlay parts', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    const overlay = getShadowPart(el, 'overlay');
    const icon = getShadowPart(el, 'icon');
    const label = getShadowPart(el, 'label');
    expect(overlay).to.exist;
    expect(icon).to.exist;
    expect(label).to.exist;
  });

  it('shows default label', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    const label = getShadowPart(el, 'label');
    expect(label!.textContent).to.equal('Drop files to upload');
  });

  it('shows custom label', async () => {
    const el = await fixture<LoquixDropZone>(
      html`<loquix-drop-zone label="Upload here"></loquix-drop-zone>`,
    );
    const label = getShadowPart(el, 'label');
    expect(label!.textContent).to.equal('Upload here');
  });

  it('sets drag-over attribute on dragenter with files', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    const content = el.shadowRoot!.querySelector('.content')!;
    content.dispatchEvent(createDragEvent('dragenter'));
    await el.updateComplete;
    expect(el.hasAttribute('drag-over')).to.be.true;
  });

  it('removes drag-over attribute on dragleave', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    const content = el.shadowRoot!.querySelector('.content')!;
    content.dispatchEvent(createDragEvent('dragenter'));
    await el.updateComplete;
    expect(el.hasAttribute('drag-over')).to.be.true;

    content.dispatchEvent(createDragEvent('dragleave'));
    await el.updateComplete;
    expect(el.hasAttribute('drag-over')).to.be.false;
  });

  it('handles nested drag enter/leave correctly (counter clamping)', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    const content = el.shadowRoot!.querySelector('.content')!;

    // Enter parent
    content.dispatchEvent(createDragEvent('dragenter'));
    // Enter child
    content.dispatchEvent(createDragEvent('dragenter'));
    await el.updateComplete;
    expect(el.hasAttribute('drag-over')).to.be.true;

    // Leave child
    content.dispatchEvent(createDragEvent('dragleave'));
    await el.updateComplete;
    expect(el.hasAttribute('drag-over')).to.be.true; // Still dragging

    // Leave parent
    content.dispatchEvent(createDragEvent('dragleave'));
    await el.updateComplete;
    expect(el.hasAttribute('drag-over')).to.be.false;

    // Extra dragleave should not go negative (clamped to 0)
    content.dispatchEvent(createDragEvent('dragleave'));
    await el.updateComplete;
    expect(el.hasAttribute('drag-over')).to.be.false;
  });

  it('emits loquix-drop with files on drop', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    const content = el.shadowRoot!.querySelector('.content')!;
    const files = [mockFile('test.txt', 'text/plain')];
    const eventPromise = waitForEvent(el, 'loquix-drop');

    content.dispatchEvent(createDragEvent('drop', files));
    const event = await eventPromise;

    expect(event.detail.files).to.have.length(1);
    expect(event.detail.files[0].name).to.equal('test.txt');
  });

  it('clears drag-over on drop', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    const content = el.shadowRoot!.querySelector('.content')!;

    content.dispatchEvent(createDragEvent('dragenter'));
    await el.updateComplete;
    expect(el.hasAttribute('drag-over')).to.be.true;

    content.dispatchEvent(createDragEvent('drop', [mockFile('f.txt', 'text/plain')]));
    await el.updateComplete;
    expect(el.hasAttribute('drag-over')).to.be.false;
  });

  it('filters files by accept (exact MIME)', async () => {
    const el = await fixture<LoquixDropZone>(
      html`<loquix-drop-zone accept="image/png"></loquix-drop-zone>`,
    );
    const content = el.shadowRoot!.querySelector('.content')!;
    const files = [mockFile('photo.png', 'image/png'), mockFile('doc.pdf', 'application/pdf')];
    const eventPromise = waitForEvent(el, 'loquix-drop');

    content.dispatchEvent(createDragEvent('drop', files));
    const event = await eventPromise;

    expect(event.detail.files).to.have.length(1);
    expect(event.detail.files[0].name).to.equal('photo.png');
  });

  it('filters files by accept (wildcard MIME)', async () => {
    const el = await fixture<LoquixDropZone>(
      html`<loquix-drop-zone accept="image/*"></loquix-drop-zone>`,
    );
    const content = el.shadowRoot!.querySelector('.content')!;
    const files = [
      mockFile('photo.png', 'image/png'),
      mockFile('photo.jpg', 'image/jpeg'),
      mockFile('doc.pdf', 'application/pdf'),
    ];
    const eventPromise = waitForEvent(el, 'loquix-drop');

    content.dispatchEvent(createDragEvent('drop', files));
    const event = await eventPromise;

    expect(event.detail.files).to.have.length(2);
  });

  it('filters files by accept (extension)', async () => {
    const el = await fixture<LoquixDropZone>(
      html`<loquix-drop-zone accept=".pdf,.txt"></loquix-drop-zone>`,
    );
    const content = el.shadowRoot!.querySelector('.content')!;
    const files = [
      mockFile('doc.pdf', 'application/pdf'),
      mockFile('readme.txt', 'text/plain'),
      mockFile('photo.png', 'image/png'),
    ];
    const eventPromise = waitForEvent(el, 'loquix-drop');

    content.dispatchEvent(createDragEvent('drop', files));
    const event = await eventPromise;

    expect(event.detail.files).to.have.length(2);
  });

  it('filters files case-insensitively', async () => {
    const el = await fixture<LoquixDropZone>(
      html`<loquix-drop-zone accept="IMAGE/PNG"></loquix-drop-zone>`,
    );
    const content = el.shadowRoot!.querySelector('.content')!;
    const files = [mockFile('photo.png', 'image/png')];
    const eventPromise = waitForEvent(el, 'loquix-drop');

    content.dispatchEvent(createDragEvent('drop', files));
    const event = await eventPromise;

    expect(event.detail.files).to.have.length(1);
  });

  it('handles files with empty type by falling back to extension', async () => {
    const el = await fixture<LoquixDropZone>(
      html`<loquix-drop-zone accept=".csv"></loquix-drop-zone>`,
    );
    const content = el.shadowRoot!.querySelector('.content')!;
    // File with empty MIME type but .csv extension
    const files = [mockFile('data.csv', '')];
    const eventPromise = waitForEvent(el, 'loquix-drop');

    content.dispatchEvent(createDragEvent('drop', files));
    const event = await eventPromise;

    expect(event.detail.files).to.have.length(1);
    expect(event.detail.files[0].name).to.equal('data.csv');
  });

  it('limits to 1 file when multiple=false', async () => {
    const el = await fixture<LoquixDropZone>(
      html`<loquix-drop-zone .multiple=${false}></loquix-drop-zone>`,
    );
    const content = el.shadowRoot!.querySelector('.content')!;
    const files = [mockFile('a.txt', 'text/plain'), mockFile('b.txt', 'text/plain')];
    const eventPromise = waitForEvent(el, 'loquix-drop');

    content.dispatchEvent(createDragEvent('drop', files));
    const event = await eventPromise;

    expect(event.detail.files).to.have.length(1);
  });

  it('does not emit when disabled', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone disabled></loquix-drop-zone>`);
    const content = el.shadowRoot!.querySelector('.content')!;

    let emitted = false;
    el.addEventListener('loquix-drop', () => {
      emitted = true;
    });

    content.dispatchEvent(createDragEvent('drop', [mockFile('f.txt', 'text/plain')]));
    await el.updateComplete;

    expect(emitted).to.be.false;
    expect(el.hasAttribute('drag-over')).to.be.false;
  });

  it('does not show overlay for non-file drags (text/plain)', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    const content = el.shadowRoot!.querySelector('.content')!;

    // Drag with only text, no files
    content.dispatchEvent(createDragEvent('dragenter', undefined, ['text/plain']));
    await el.updateComplete;

    expect(el.hasAttribute('drag-over')).to.be.false;
  });

  it('does not emit when all files are filtered out by accept', async () => {
    const el = await fixture<LoquixDropZone>(
      html`<loquix-drop-zone accept="image/*"></loquix-drop-zone>`,
    );
    const content = el.shadowRoot!.querySelector('.content')!;

    let emitted = false;
    el.addEventListener('loquix-drop', () => {
      emitted = true;
    });

    // Only PDFs, but accept is image/*
    content.dispatchEvent(createDragEvent('drop', [mockFile('doc.pdf', 'application/pdf')]));
    await el.updateComplete;

    expect(emitted).to.be.false;
  });

  it('resets drag state when disabled is set to true', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    const content = el.shadowRoot!.querySelector('.content')!;

    content.dispatchEvent(createDragEvent('dragenter'));
    await el.updateComplete;
    expect(el.hasAttribute('drag-over')).to.be.true;

    // Dynamically disable
    el.disabled = true;
    await el.updateComplete;
    expect(el.hasAttribute('drag-over')).to.be.false;
  });

  it('reflects overlay-inset to CSS custom property', async () => {
    const el = await fixture<LoquixDropZone>(
      html`<loquix-drop-zone overlay-inset="8px 16px"></loquix-drop-zone>`,
    );
    await el.updateComplete;
    const value = el.style.getPropertyValue('--loquix-drop-zone-overlay-inset');
    expect(value).to.equal('8px 16px');
  });

  // === Codex Review Round 1 — new test cases ===

  it('does not set inline CSS var when overlay-inset is not provided', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    await el.updateComplete;
    const value = el.style.getPropertyValue('--loquix-drop-zone-overlay-inset');
    expect(value).to.equal('');
  });

  it('resets drag state on global dragend event', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    const content = el.shadowRoot!.querySelector('.content')!;

    content.dispatchEvent(createDragEvent('dragenter'));
    await el.updateComplete;
    expect(el.hasAttribute('drag-over')).to.be.true;

    // Simulate global dragend (e.g., drag exits viewport)
    document.dispatchEvent(new DragEvent('dragend', { bubbles: true }));
    await el.updateComplete;
    expect(el.hasAttribute('drag-over')).to.be.false;
  });

  it('treats accept="*" as allow-all', async () => {
    const el = await fixture<LoquixDropZone>(
      html`<loquix-drop-zone accept="*"></loquix-drop-zone>`,
    );
    const content = el.shadowRoot!.querySelector('.content')!;
    const files = [
      mockFile('photo.png', 'image/png'),
      mockFile('doc.pdf', 'application/pdf'),
      mockFile('data.csv', 'text/csv'),
    ];
    const eventPromise = waitForEvent(el, 'loquix-drop');

    content.dispatchEvent(createDragEvent('drop', files));
    const event = await eventPromise;

    expect(event.detail.files).to.have.length(3);
  });

  it('treats accept="*/*" as allow-all', async () => {
    const el = await fixture<LoquixDropZone>(
      html`<loquix-drop-zone accept="*/*"></loquix-drop-zone>`,
    );
    const content = el.shadowRoot!.querySelector('.content')!;
    const files = [mockFile('photo.png', 'image/png'), mockFile('doc.pdf', 'application/pdf')];
    const eventPromise = waitForEvent(el, 'loquix-drop');

    content.dispatchEvent(createDragEvent('drop', files));
    const event = await eventPromise;

    expect(event.detail.files).to.have.length(2);
  });

  it('has aria-hidden on overlay when not dragging', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    const overlay = getShadowPart(el, 'overlay');
    expect(overlay!.getAttribute('aria-hidden')).to.equal('true');
  });

  it('removes aria-hidden from overlay during drag', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    const content = el.shadowRoot!.querySelector('.content')!;

    content.dispatchEvent(createDragEvent('dragenter'));
    await el.updateComplete;

    const overlay = getShadowPart(el, 'overlay');
    expect(overlay!.getAttribute('aria-hidden')).to.equal('false');
  });

  it('has aria-hidden on overlay icon', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    const icon = getShadowPart(el, 'icon');
    expect(icon!.getAttribute('aria-hidden')).to.equal('true');
  });

  it('cleans up global dragend listener on disconnect', async () => {
    const el = await fixture<LoquixDropZone>(html`<loquix-drop-zone></loquix-drop-zone>`);
    const content = el.shadowRoot!.querySelector('.content')!;

    content.dispatchEvent(createDragEvent('dragenter'));
    await el.updateComplete;
    expect(el.hasAttribute('drag-over')).to.be.true;

    // Disconnect the element
    el.remove();

    // Global dragend should NOT reset the counter (listener removed)
    document.dispatchEvent(new DragEvent('dragend', { bubbles: true }));
    // The element should still have drag-over since listener was cleaned up
    expect(el.hasAttribute('drag-over')).to.be.true;
  });
});
