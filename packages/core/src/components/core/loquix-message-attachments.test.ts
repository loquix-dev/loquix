import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart, getShadowParts } from '../../test-utils.js';
import './define-message-attachments.js';
import type { LoquixMessageAttachments } from './loquix-message-attachments.js';
import type { Attachment } from '../../types/index.js';

function makeAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    id: 'att-1',
    filename: 'photo.jpg',
    filetype: 'image/jpeg',
    size: 204800,
    status: 'complete',
    ...overrides,
  };
}

describe('loquix-message-attachments', () => {
  it('renders a card for each attachment', async () => {
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${[
          makeAttachment({ id: 'a1', filename: 'a.jpg' }),
          makeAttachment({ id: 'a2', filename: 'b.pdf', filetype: 'pdf' }),
        ]}
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const cards = getShadowParts(el, 'card');
    expect(cards).to.have.length(2);
  });

  it('renders nothing when attachments is empty', async () => {
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments .attachments=${[]}></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const grid = getShadowPart(el, 'grid');
    expect(grid).to.not.exist;
  });

  it('shows <img> for image attachments with safe URL', async () => {
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${[makeAttachment({ url: 'https://example.com/photo.jpg' })]}
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const img = el.shadowRoot!.querySelector('img');
    expect(img).to.exist;
    expect(img!.src).to.include('https://example.com/photo.jpg');
    expect(img!.alt).to.equal('photo.jpg');
    expect(img!.getAttribute('referrerpolicy')).to.equal('no-referrer');
    expect(img!.getAttribute('loading')).to.equal('lazy');
  });

  it('shows emoji icon for non-image attachments', async () => {
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${[makeAttachment({ filetype: 'pdf', url: 'https://example.com/doc.pdf' })]}
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const icon = el.shadowRoot!.querySelector('.card__icon');
    expect(icon).to.exist;
    const img = el.shadowRoot!.querySelector('img');
    expect(img).to.not.exist;
  });

  it('always renders <button> card regardless of URL presence', async () => {
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${[makeAttachment({ url: 'https://example.com/photo.jpg' })]}
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const btn = el.shadowRoot!.querySelector('.card__action') as HTMLButtonElement;
    expect(btn).to.exist;
    expect(btn.tagName).to.equal('BUTTON');
    expect(btn.type).to.equal('button');
    // No <a> tags — navigation is delegated to the consumer via events
    const link = el.shadowRoot!.querySelector('a');
    expect(link).to.not.exist;
  });

  it('dispatches loquix-attachment-click on card click', async () => {
    const att = makeAttachment({ url: undefined });
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments .attachments=${[att]}></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const btn = el.shadowRoot!.querySelector('.card__action') as HTMLButtonElement;
    const eventPromise = waitForEvent(el, 'loquix-attachment-click');
    btn.click();
    const event = await eventPromise;
    expect(event.detail.attachment.id).to.equal('att-1');
  });

  it('dispatches loquix-attachment-click with URL attachment', async () => {
    const att = makeAttachment({ url: 'https://example.com/photo.jpg' });
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments .attachments=${[att]}></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const btn = el.shadowRoot!.querySelector('.card__action') as HTMLButtonElement;
    const eventPromise = waitForEvent(el, 'loquix-attachment-click');
    btn.click();
    const event = await eventPromise;
    expect(event.detail.attachment.id).to.equal('att-1');
    // Consumer can access url from the attachment detail
    expect(event.detail.attachment.url).to.equal('https://example.com/photo.jpg');
  });

  it('remove button visible only when removable=true', async () => {
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${[makeAttachment()]}
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    // removable is false by default — remove button exists but is hidden via CSS
    const remove = getShadowPart(el, 'remove');
    expect(remove).to.exist;
    // Check computed display
    const display = getComputedStyle(remove!).display;
    expect(display).to.equal('none');

    // Enable removable
    el.removable = true;
    await el.updateComplete;
    const removeAfter = getShadowPart(el, 'remove');
    const displayAfter = getComputedStyle(removeAfter!).display;
    expect(displayAfter).to.equal('flex');
  });

  it('dispatches loquix-attachment-remove on remove click', async () => {
    const att = makeAttachment();
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        removable
        .attachments=${[att]}
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const removeBtn = getShadowPart(el, 'remove') as HTMLButtonElement;
    const eventPromise = waitForEvent(el, 'loquix-attachment-remove');
    removeBtn.click();
    const event = await eventPromise;
    expect(event.detail.attachment.id).to.equal('att-1');
  });

  it('remove click does NOT dispatch loquix-attachment-click (stopPropagation)', async () => {
    const att = makeAttachment({ url: undefined });
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        removable
        .attachments=${[att]}
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;

    let clickFired = false;
    el.addEventListener('loquix-attachment-click', () => {
      clickFired = true;
    });

    const removeBtn = getShadowPart(el, 'remove') as HTMLButtonElement;
    removeBtn.click();

    // Give a tick for any async dispatching
    await new Promise(r => setTimeout(r, 50));
    expect(clickFired).to.be.false;
  });

  it('maxVisible hides extra cards and shows overflow button', async () => {
    const atts = Array.from({ length: 5 }, (_, i) =>
      makeAttachment({ id: `att-${i}`, filename: `file-${i}.jpg` }),
    );
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${atts}
        max-visible="3"
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const cards = getShadowParts(el, 'card');
    expect(cards).to.have.length(3);
    const overflow = getShadowPart(el, 'overflow');
    expect(overflow).to.exist;
    expect(overflow!.textContent).to.contain('+2 more');
  });

  it('clicking overflow reveals all cards', async () => {
    const atts = Array.from({ length: 5 }, (_, i) =>
      makeAttachment({ id: `att-${i}`, filename: `file-${i}.jpg` }),
    );
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${atts}
        max-visible="3"
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const overflow = getShadowPart(el, 'overflow') as HTMLButtonElement;
    overflow.click();
    await el.updateComplete;
    const cards = getShadowParts(el, 'card');
    expect(cards).to.have.length(5);
    const overflowAfter = getShadowPart(el, 'overflow');
    expect(overflowAfter).to.not.exist;
  });

  it('overflow resets when attachments change', async () => {
    const atts = Array.from({ length: 5 }, (_, i) =>
      makeAttachment({ id: `att-${i}`, filename: `file-${i}.jpg` }),
    );
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${atts}
        max-visible="3"
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    // Expand
    const overflow = getShadowPart(el, 'overflow') as HTMLButtonElement;
    overflow.click();
    await el.updateComplete;
    expect(getShadowParts(el, 'card')).to.have.length(5);

    // Change attachments — should reset
    el.attachments = Array.from({ length: 4 }, (_, i) =>
      makeAttachment({ id: `new-${i}`, filename: `new-${i}.jpg` }),
    );
    await el.updateComplete;
    expect(getShadowParts(el, 'card')).to.have.length(3);
    expect(getShadowPart(el, 'overflow')).to.exist;
  });

  it('sm size hides info, md shows filename, lg shows filename + size', async () => {
    const att = makeAttachment({ size: 204800 });

    // sm — no info
    const elSm = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        size="sm"
        .attachments=${[att]}
      ></loquix-message-attachments>`,
    );
    await elSm.updateComplete;
    const infoSm = elSm.shadowRoot!.querySelector('.card__info');
    expect(infoSm).to.not.exist;

    // md — filename only
    const elMd = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        size="md"
        .attachments=${[att]}
      ></loquix-message-attachments>`,
    );
    await elMd.updateComplete;
    const filenameMd = getShadowPart(elMd, 'filename');
    expect(filenameMd).to.exist;
    const filesizeMd = getShadowPart(elMd, 'filesize');
    expect(filesizeMd).to.not.exist;

    // lg — filename + filesize
    const elLg = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        size="lg"
        .attachments=${[att]}
      ></loquix-message-attachments>`,
    );
    await elLg.updateComplete;
    const filenameLg = getShadowPart(elLg, 'filename');
    expect(filenameLg).to.exist;
    const filesizeLg = getShadowPart(elLg, 'filesize');
    expect(filesizeLg).to.exist;
    expect(filesizeLg!.textContent).to.contain('200');
  });

  it('does not render <img> for javascript: URL', async () => {
    const att = makeAttachment({ url: 'javascript:alert(1)', filetype: 'image/png' });
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments .attachments=${[att]}></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const img = el.shadowRoot!.querySelector('img');
    expect(img).to.not.exist; // Unsafe URL blocked from img src
    const icon = el.shadowRoot!.querySelector('.card__icon');
    expect(icon).to.exist;
  });

  it('does not render <img> for data:text/html URL', async () => {
    const att = makeAttachment({
      url: 'data:text/html,<script>alert(1)</script>',
      filetype: 'image/png',
    });
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments .attachments=${[att]}></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const img = el.shadowRoot!.querySelector('img');
    expect(img).to.not.exist;
  });

  it('blocks data:image/svg+xml in img src (defense-in-depth)', async () => {
    const att = makeAttachment({
      url: 'data:image/svg+xml,<svg onload="alert(1)"/>',
      filetype: 'image/svg+xml',
    });
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments .attachments=${[att]}></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const img = el.shadowRoot!.querySelector('img');
    expect(img).to.not.exist; // SVG data: blocked — falls back to emoji
    const icon = el.shadowRoot!.querySelector('.card__icon');
    expect(icon).to.exist;
  });

  it('allows data:image/png in img src (case-insensitive)', async () => {
    const att = makeAttachment({
      url: 'data:image/png;base64,iVBOR',
      filetype: 'image/png',
    });
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments .attachments=${[att]}></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const img = el.shadowRoot!.querySelector('img');
    expect(img).to.exist;
    expect(img!.src).to.contain('data:image/png');
  });

  it('handles mixed-case data:Image/PNG', async () => {
    const att = makeAttachment({
      url: 'data:Image/PNG;base64,iVBOR',
      filetype: 'image/png',
    });
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments .attachments=${[att]}></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const img = el.shadowRoot!.querySelector('img');
    expect(img).to.exist;
  });

  it('remove button is sibling of action button, not nested inside it', async () => {
    const att = makeAttachment({ url: 'https://example.com/photo.jpg' });
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        removable
        .attachments=${[att]}
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const card = getShadowPart(el, 'card')!;
    const action = card.querySelector('.card__action');
    const removeBtn = getShadowPart(el, 'remove');
    expect(action).to.exist;
    expect(removeBtn).to.exist;
    // Remove button should NOT be inside the action button
    expect(action!.contains(removeBtn!)).to.be.false;
    // Both should be direct children of card
    expect(removeBtn!.parentElement).to.equal(card);
    expect(action!.parentElement).to.equal(card);
  });

  it('overflow button is outside role="list"', async () => {
    const atts = Array.from({ length: 5 }, (_, i) =>
      makeAttachment({ id: `att-${i}`, filename: `file-${i}.jpg` }),
    );
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${atts}
        max-visible="3"
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const list = el.shadowRoot!.querySelector('[role="list"]');
    const overflow = getShadowPart(el, 'overflow');
    expect(list).to.exist;
    expect(overflow).to.exist;
    expect(list!.contains(overflow!)).to.be.false;
  });

  it('xs size shows filename and filesize in horizontal layout', async () => {
    const att = makeAttachment({ size: 204800 });
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        size="xs"
        .attachments=${[att]}
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const card = getShadowPart(el, 'card');
    expect(card).to.exist;
    expect(card!.classList.contains('card--xs')).to.be.true;
    // xs shows both filename and filesize
    const filename = getShadowPart(el, 'filename');
    expect(filename).to.exist;
    const filesize = getShadowPart(el, 'filesize');
    expect(filesize).to.exist;
    expect(filesize!.textContent).to.contain('200');
  });

  it('xs size reflects size attribute on host', async () => {
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        size="xs"
        .attachments=${[makeAttachment()]}
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    expect(el.getAttribute('size')).to.equal('xs');
  });

  it('has accessible aria-labels on cards', async () => {
    const att = makeAttachment({ size: 204800 });
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments .attachments=${[att]}></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const btn = el.shadowRoot!.querySelector('.card__action') as HTMLElement;
    expect(btn).to.exist;
    expect(btn.getAttribute('aria-label')).to.include('photo.jpg');
  });

  // === "+N more" text from localization ===

  it('overflow button shows localized "+N more" text', async () => {
    const atts = Array.from({ length: 8 }, (_, i) =>
      makeAttachment({ id: `att-${i}`, filename: `file-${i}.jpg` }),
    );
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${atts}
        max-visible="3"
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const overflow = getShadowPart(el, 'overflow');
    expect(overflow).to.exist;
    expect(overflow!.textContent).to.contain('+5 more');
  });

  it('overflow button shows "+1 more" for single hidden attachment', async () => {
    const atts = Array.from({ length: 4 }, (_, i) =>
      makeAttachment({ id: `att-${i}`, filename: `file-${i}.jpg` }),
    );
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${atts}
        max-visible="3"
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const overflow = getShadowPart(el, 'overflow');
    expect(overflow).to.exist;
    expect(overflow!.textContent).to.contain('+1 more');
  });

  // === Remove button label from localization ===

  it('remove button has localized aria-label containing filename', async () => {
    const att = makeAttachment({ filename: 'document.pdf' });
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        removable
        .attachments=${[att]}
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const removeBtn = getShadowPart(el, 'remove') as HTMLButtonElement;
    expect(removeBtn).to.exist;
    expect(removeBtn.getAttribute('aria-label')).to.equal('Remove document.pdf');
  });

  it('each remove button has correct filename in its aria-label', async () => {
    const atts = [
      makeAttachment({ id: 'a1', filename: 'report.pdf' }),
      makeAttachment({ id: 'a2', filename: 'photo.png' }),
    ];
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        removable
        .attachments=${atts}
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const removeBtns = getShadowParts(el, 'remove');
    expect(removeBtns).to.have.length(2);
    expect(removeBtns[0].getAttribute('aria-label')).to.equal('Remove report.pdf');
    expect(removeBtns[1].getAttribute('aria-label')).to.equal('Remove photo.png');
  });

  // === Large number of attachments (10+) renders correctly ===

  it('renders 10+ attachments correctly', async () => {
    const atts = Array.from({ length: 15 }, (_, i) =>
      makeAttachment({ id: `att-${i}`, filename: `file-${i}.jpg` }),
    );
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments .attachments=${atts}></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const cards = getShadowParts(el, 'card');
    expect(cards).to.have.length(15);
  });

  it('renders 10+ attachments with maxVisible correctly', async () => {
    const atts = Array.from({ length: 12 }, (_, i) =>
      makeAttachment({ id: `att-${i}`, filename: `file-${i}.jpg` }),
    );
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${atts}
        max-visible="5"
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;

    // Should show only 5 cards + overflow button
    const cards = getShadowParts(el, 'card');
    expect(cards).to.have.length(5);

    const overflow = getShadowPart(el, 'overflow');
    expect(overflow).to.exist;
    expect(overflow!.textContent).to.contain('+7 more');

    // Click overflow to expand
    overflow!.click();
    await el.updateComplete;

    const allCards = getShadowParts(el, 'card');
    expect(allCards).to.have.length(12);
  });

  it('maxVisible=0 shows all attachments without overflow', async () => {
    const atts = Array.from({ length: 10 }, (_, i) =>
      makeAttachment({ id: `att-${i}`, filename: `file-${i}.jpg` }),
    );
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${atts}
        max-visible="0"
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const cards = getShadowParts(el, 'card');
    expect(cards).to.have.length(10);
    const overflow = getShadowPart(el, 'overflow');
    expect(overflow).to.not.exist;
  });

  it('cards have role="listitem" for accessibility', async () => {
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${[makeAttachment()]}
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const card = getShadowPart(el, 'card')!;
    expect(card.getAttribute('role')).to.equal('listitem');
  });

  it('grid part wraps a role="list" container', async () => {
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments
        .attachments=${[makeAttachment()]}
      ></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const list = el.shadowRoot!.querySelector('[role="list"]');
    expect(list).to.exist;
  });

  it('card title tooltip includes filename and size', async () => {
    const att = makeAttachment({ filename: 'report.pdf', size: 1048576 });
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments .attachments=${[att]}></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const card = getShadowPart(el, 'card')!;
    const title = card.getAttribute('title');
    expect(title).to.include('report.pdf');
    expect(title).to.include('MB');
  });

  it('card title tooltip is just filename when size is 0', async () => {
    const att = makeAttachment({ filename: 'empty.txt', size: 0 });
    const el = await fixture<LoquixMessageAttachments>(
      html`<loquix-message-attachments .attachments=${[att]}></loquix-message-attachments>`,
    );
    await el.updateComplete;
    const card = getShadowPart(el, 'card')!;
    expect(card.getAttribute('title')).to.equal('empty.txt');
  });
});
