import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart } from '../../test-utils.js';
import './define-attachment-chip.js';
import type { LoquixAttachmentChip } from './loquix-attachment-chip.js';

describe('loquix-attachment-chip', () => {
  it('renders filename and size', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="document.pdf"
        filetype="pdf"
        size="1048576"
      ></loquix-attachment-chip>`,
    );
    const chip = getShadowPart(el, 'chip');
    expect(chip).to.exist;
    expect(chip!.textContent).to.contain('document.pdf');
    expect(chip!.textContent).to.contain('1.0 MB');
  });

  it('shows remove button when removable', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="file.txt"
        filetype="txt"
        size="100"
      ></loquix-attachment-chip>`,
    );
    const removeBtn = getShadowPart(el, 'remove');
    expect(removeBtn).to.exist;
  });

  it('dispatches loquix-attachment-remove on remove click', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="file.txt"
        filetype="txt"
        size="100"
        attachment-id="att-1"
      ></loquix-attachment-chip>`,
    );
    const removeBtn = getShadowPart(el, 'remove')!;
    const eventPromise = waitForEvent(el, 'loquix-attachment-remove');
    removeBtn.click();
    const event = await eventPromise;
    expect(event.detail.attachment.id).to.equal('att-1');
    expect(event.detail.attachment.filename).to.equal('file.txt');
  });

  it('shows file type emoji icon', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="photo.png"
        filetype="image/png"
        size="5000"
      ></loquix-attachment-chip>`,
    );
    const icon = getShadowPart(el, 'icon');
    expect(icon).to.exist;
    // Image files get picture frame emoji
    expect(icon!.textContent).to.contain('\u{1f5bc}\ufe0f');
  });

  it('shows error state with retry button', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="big-file.zip"
        filetype="zip"
        size="99999"
        status="error"
        error="File too large"
        attachment-id="att-2"
      ></loquix-attachment-chip>`,
    );
    const retryBtn = getShadowPart(el, 'retry');
    expect(retryBtn).to.exist;
    const eventPromise = waitForEvent(el, 'loquix-attachment-retry');
    retryBtn!.click();
    const event = await eventPromise;
    expect(event.detail.attachment.id).to.equal('att-2');
  });

  // === Status states ===

  it('shows "Waiting..." status label when pending', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="file.txt"
        filetype="txt"
        size="100"
        status="pending"
      ></loquix-attachment-chip>`,
    );
    const chip = getShadowPart(el, 'chip');
    expect(chip!.textContent).to.contain('Waiting\u2026');
  });

  it('shows progress percentage and progress bar when uploading', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="file.txt"
        filetype="txt"
        size="100"
        status="uploading"
        progress="42"
      ></loquix-attachment-chip>`,
    );
    const chip = getShadowPart(el, 'chip');
    expect(chip!.textContent).to.contain('42%');
    const progressBar = el.shadowRoot!.querySelector('.chip__progress');
    expect(progressBar).to.exist;
    expect((progressBar as HTMLElement).style.getPropertyValue('--progress')).to.equal('42%');
  });

  it('shows "Connecting..." and indeterminate progress when uploading with progress=0', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="file.txt"
        filetype="txt"
        size="100"
        status="uploading"
        progress="0"
      ></loquix-attachment-chip>`,
    );
    expect(getShadowPart(el, 'chip')!.textContent).to.contain('Connecting\u2026');
    const bar = el.shadowRoot!.querySelector('.chip__progress');
    expect(bar).to.exist;
    expect(bar!.classList.contains('chip__progress--indeterminate')).to.be.true;
  });

  it('shows "Error" status label when status is error', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="file.txt"
        filetype="txt"
        size="100"
        status="error"
      ></loquix-attachment-chip>`,
    );
    expect(getShadowPart(el, 'chip')!.textContent).to.contain('Error');
  });

  it('renders normally with no status label and no progress bar when complete', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="report.pdf"
        filetype="pdf"
        size="2048"
        status="complete"
      ></loquix-attachment-chip>`,
    );
    const chip = getShadowPart(el, 'chip');
    expect(chip!.textContent).to.contain('report.pdf');
    expect(chip!.textContent).to.contain('2.0 KB');
    expect(el.shadowRoot!.querySelector('.chip__status')).to.not.exist;
    expect(el.shadowRoot!.querySelector('.chip__progress')).to.not.exist;
  });

  // === Filename truncation ===

  it('truncates long filenames with ellipsis preserving extension', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="very-long-filename-here.pdf"
        filetype="pdf"
        size="100"
        max-filename-length="15"
      ></loquix-attachment-chip>`,
    );
    const text = getShadowPart(el, 'chip')!.textContent!;
    expect(text).to.contain('\u2026');
    expect(text).to.contain('.pdf');
    expect(text).to.not.contain('very-long-filename-here.pdf');
  });

  it('does not truncate when name is shorter than max or max is 0', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="short.pdf"
        filetype="pdf"
        size="100"
        max-filename-length="20"
      ></loquix-attachment-chip>`,
    );
    expect(getShadowPart(el, 'chip')!.textContent).to.contain('short.pdf');

    el.maxFilenameLength = 0;
    el.filename = 'any-length-file-name.pdf';
    await el.updateComplete;
    expect(getShadowPart(el, 'chip')!.textContent).to.contain('any-length-file-name.pdf');
  });

  it('truncates filename without extension using ellipsis', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="a-very-long-filename-without-extension"
        filetype="txt"
        size="100"
        max-filename-length="10"
      ></loquix-attachment-chip>`,
    );
    expect(getShadowPart(el, 'chip')!.textContent).to.contain('\u2026');
  });

  // === Size formatting ===

  it('formats file sizes correctly for various byte values', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="f.txt"
        filetype="txt"
        size="0"
      ></loquix-attachment-chip>`,
    );
    expect(getShadowPart(el, 'chip')!.textContent).to.contain('0 B');

    el.size = 500;
    await el.updateComplete;
    expect(getShadowPart(el, 'chip')!.textContent).to.contain('500 B');

    el.size = 1024;
    await el.updateComplete;
    expect(getShadowPart(el, 'chip')!.textContent).to.contain('1.0 KB');

    el.size = 1536;
    await el.updateComplete;
    expect(getShadowPart(el, 'chip')!.textContent).to.contain('1.5 KB');

    el.size = 1048576;
    await el.updateComplete;
    expect(getShadowPart(el, 'chip')!.textContent).to.contain('1.0 MB');
  });

  // === Safe preview URL ===

  it('renders preview image for allowed protocols', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="photo.png"
        filetype="png"
        size="100"
        preview="https://example.com/thumb.png"
      ></loquix-attachment-chip>`,
    );
    let img = el.shadowRoot!.querySelector('.chip__preview') as HTMLImageElement;
    expect(img).to.exist;
    expect(img.src).to.equal('https://example.com/thumb.png');

    el.preview = 'blob:https://example.com/abc-123';
    await el.updateComplete;
    img = el.shadowRoot!.querySelector('.chip__preview') as HTMLImageElement;
    expect(img).to.exist;

    el.preview = 'data:image/png;base64,iVBOR';
    await el.updateComplete;
    img = el.shadowRoot!.querySelector('.chip__preview') as HTMLImageElement;
    expect(img).to.exist;
  });

  it('rejects dangerous protocols in preview URL', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="photo.png"
        filetype="png"
        size="100"
        preview="javascript:alert(1)"
      ></loquix-attachment-chip>`,
    );
    expect(el.shadowRoot!.querySelector('.chip__preview')).to.not.exist;

    el.preview = 'file:///etc/passwd';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.chip__preview')).to.not.exist;
  });

  // === File type icons ===

  it('maps file extensions to correct emoji icons', async () => {
    const cases: [string, string][] = [
      ['pdf', '📄'],
      ['ts', '💻'],
      ['video/mp4', '🎬'],
      ['mp3', '🎵'],
      ['zip', '📦'],
      ['md', '📝'],
      ['csv', '📊'],
      ['xyz', '📎'],
      ['jpg', '🖼️'],
    ];
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="test"
        filetype="pdf"
        size="100"
      ></loquix-attachment-chip>`,
    );
    for (const [ft, emoji] of cases) {
      el.filetype = ft;
      await el.updateComplete;
      expect(getShadowPart(el, 'icon')!.textContent).to.contain(
        emoji,
        `Expected ${emoji} for filetype="${ft}"`,
      );
    }
  });

  // === Remove button visibility ===

  it('hides remove button when removable=false', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="file.txt"
        filetype="txt"
        size="100"
        .removable=${false}
      ></loquix-attachment-chip>`,
    );
    expect(getShadowPart(el, 'remove')).to.not.exist;
  });

  // === Retry button ===

  it('dispatches loquix-attachment-retry with correct detail and event flags', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="important.pdf"
        filetype="pdf"
        size="2048"
        status="error"
        error="Network timeout"
        attachment-id="att-retry"
      ></loquix-attachment-chip>`,
    );
    const retryBtn = getShadowPart(el, 'retry')!;
    const eventPromise = waitForEvent(el, 'loquix-attachment-retry');
    retryBtn.click();
    const event = await eventPromise;
    expect(event.detail.attachment.id).to.equal('att-retry');
    expect(event.detail.attachment.filename).to.equal('important.pdf');
    expect(event.detail.attachment.status).to.equal('error');
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
  });

  it('hides retry button when no-retry is set', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="file.txt"
        filetype="txt"
        size="100"
        status="error"
        error="Failed"
        no-retry
      ></loquix-attachment-chip>`,
    );
    expect(getShadowPart(el, 'retry')).to.not.exist;

    el.noRetry = false;
    await el.updateComplete;
    expect(getShadowPart(el, 'retry')).to.exist;
  });

  // === Remove event detail ===

  it('dispatches loquix-attachment-remove with bubbles and composed', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="file.txt"
        filetype="txt"
        size="100"
        attachment-id="att-rm"
      ></loquix-attachment-chip>`,
    );
    const removeBtn = getShadowPart(el, 'remove')!;
    const eventPromise = waitForEvent(el, 'loquix-attachment-remove');
    removeBtn.click();
    const event = await eventPromise;
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
    expect(event.detail.attachment.filename).to.equal('file.txt');
    expect(event.detail.attachment.id).to.equal('att-rm');
  });

  // === Error tooltip ===

  it('renders error tooltip with content and role when error property is set', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="file.txt"
        filetype="txt"
        size="100"
        status="error"
        error="Quota exceeded"
      ></loquix-attachment-chip>`,
    );
    const tooltip = el.shadowRoot!.querySelector('#error-tooltip');
    expect(tooltip).to.exist;
    expect(tooltip!.textContent!.trim()).to.equal('Quota exceeded');
    expect(tooltip!.getAttribute('role')).to.equal('tooltip');
    const errorIcon = el.shadowRoot!.querySelector('.chip__error-icon');
    expect(errorIcon!.getAttribute('aria-label')).to.equal('Quota exceeded');
  });

  it('does not render error tooltip when error is empty and shows fallback aria-label', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="file.txt"
        filetype="txt"
        size="100"
        status="error"
      ></loquix-attachment-chip>`,
    );
    expect(el.shadowRoot!.querySelector('#error-tooltip')).to.not.exist;
    const errorIcon = el.shadowRoot!.querySelector('.chip__error-icon');
    expect(errorIcon).to.exist;
    expect(errorIcon!.getAttribute('aria-label')).to.equal('Upload error');
  });

  // === Purpose in metadata ===

  it('shows purpose in metadata when set', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="style.png"
        filetype="png"
        size="100"
        purpose="style"
      ></loquix-attachment-chip>`,
    );
    expect(getShadowPart(el, 'chip')!.textContent).to.contain('style');
  });

  // === Codex-found fix: data: URL restriction (1.7) ===

  it('rejects non-image data: URLs in preview', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="file.txt"
        filetype="txt"
        size="100"
        preview="data:text/html,&lt;script&gt;alert(1)&lt;/script&gt;"
      ></loquix-attachment-chip>`,
    );
    expect(el.shadowRoot!.querySelector('.chip__preview')).to.not.exist;
  });

  it('rejects data:image/svg+xml in preview (XSS vector)', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="icon.svg"
        filetype="svg"
        size="100"
        preview="data:image/svg+xml,&lt;svg onload=alert(1)&gt;"
      ></loquix-attachment-chip>`,
    );
    expect(el.shadowRoot!.querySelector('.chip__preview')).to.not.exist;
  });

  it('allows safe data:image/png in preview', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="photo.png"
        filetype="png"
        size="100"
        preview="data:image/png;base64,iVBOR"
      ></loquix-attachment-chip>`,
    );
    const img = el.shadowRoot!.querySelector('.chip__preview') as HTMLImageElement;
    expect(img).to.exist;
  });

  it('allows safe data:image/jpeg in preview', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="photo.jpg"
        filetype="jpg"
        size="100"
        preview="data:image/jpeg;base64,/9j/4AA"
      ></loquix-attachment-chip>`,
    );
    const img = el.shadowRoot!.querySelector('.chip__preview') as HTMLImageElement;
    expect(img).to.exist;
  });

  it('rejects data:application/pdf in preview', async () => {
    const el = await fixture<LoquixAttachmentChip>(
      html`<loquix-attachment-chip
        filename="doc.pdf"
        filetype="pdf"
        size="100"
        preview="data:application/pdf;base64,abc"
      ></loquix-attachment-chip>`,
    );
    expect(el.shadowRoot!.querySelector('.chip__preview')).to.not.exist;
  });
});
