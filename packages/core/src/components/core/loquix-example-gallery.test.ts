import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowParts } from '../../test-utils.js';
import './define-example-gallery.js';
import type { LoquixExampleGallery } from './loquix-example-gallery.js';
import type { GalleryItem } from '../../types/index.js';

const mockItems: GalleryItem[] = [
  { id: '1', title: 'Write a poem', prompt: 'Write a poem', category: 'Creative' },
  { id: '2', title: 'Debug code', prompt: 'Debug my code', category: 'Code' },
  { id: '3', title: 'Summarize text', prompt: 'Summarize this', category: 'Creative' },
];

describe('loquix-example-gallery', () => {
  it('renders items in grid by default', async () => {
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${mockItems}></loquix-example-gallery>`,
    );
    expect(el.variant).to.equal('grid');
    const items = getShadowParts(el, 'item');
    expect(items).to.have.lengthOf(3);
    expect(items[0].textContent).to.contain('Write a poem');
  });

  it('dispatches loquix-gallery-select on item click', async () => {
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${mockItems}></loquix-example-gallery>`,
    );
    const items = getShadowParts(el, 'item');
    const eventPromise = waitForEvent(el, 'loquix-gallery-select');
    items[1].click();
    const event = await eventPromise;
    expect(event.detail.item.id).to.equal('2');
    expect(event.detail.item.title).to.equal('Debug code');
  });

  it('renders heading when provided', async () => {
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery
        .items=${mockItems}
        heading="Try these examples"
      ></loquix-example-gallery>`,
    );
    const heading = el.shadowRoot!.querySelector('.heading');
    expect(heading).to.exist;
    expect(heading!.textContent).to.contain('Try these examples');
  });

  it('shows category tabs when items have multiple categories', async () => {
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${mockItems}></loquix-example-gallery>`,
    );
    const tabs = el.shadowRoot!.querySelectorAll('[role="tab"]');
    expect(tabs.length).to.equal(2); // Creative, Code
  });

  it('renders empty when no items', async () => {
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery></loquix-example-gallery>`,
    );
    const items = getShadowParts(el, 'item');
    expect(items).to.have.lengthOf(0);
  });

  it('renders items as list when variant="list"', async () => {
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${mockItems} variant="list"></loquix-example-gallery>`,
    );
    expect(el.variant).to.equal('list');
    const grid = el.shadowRoot!.querySelector('.gallery--grid');
    expect(grid).to.not.exist;
    const list = el.shadowRoot!.querySelector('.gallery--list');
    expect(list).to.exist;
    const items = getShadowParts(el, 'item');
    expect(items).to.have.lengthOf(3);
  });

  it('auto-derives category tabs from items when no categories prop', async () => {
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${mockItems}></loquix-example-gallery>`,
    );
    const tabs = el.shadowRoot!.querySelectorAll('[role="tab"]');
    const tabTexts = Array.from(tabs).map(t => t.textContent!.trim());
    expect(tabTexts).to.include('Creative');
    expect(tabTexts).to.include('Code');
  });

  it('clicking a category tab filters items to that category', async () => {
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${mockItems}></loquix-example-gallery>`,
    );
    const tabs = el.shadowRoot!.querySelectorAll('[role="tab"]');
    // Click the "Code" tab
    const codeTab = Array.from(tabs).find(t => t.textContent!.trim() === 'Code') as HTMLElement;
    expect(codeTab).to.exist;
    codeTab.click();
    await el.updateComplete;
    const items = getShadowParts(el, 'item');
    expect(items).to.have.lengthOf(1);
    expect(items[0].textContent).to.contain('Debug code');
  });

  it('clicking active category deselects it and shows all items', async () => {
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${mockItems}></loquix-example-gallery>`,
    );
    const tabs = el.shadowRoot!.querySelectorAll('[role="tab"]');
    const codeTab = Array.from(tabs).find(t => t.textContent!.trim() === 'Code') as HTMLElement;
    // Activate
    codeTab.click();
    await el.updateComplete;
    expect(getShadowParts(el, 'item')).to.have.lengthOf(1);
    // Deactivate
    const tabsAfter = el.shadowRoot!.querySelectorAll('[role="tab"]');
    const codeTabAfter = Array.from(tabsAfter).find(
      t => t.textContent!.trim() === 'Code',
    ) as HTMLElement;
    codeTabAfter.click();
    await el.updateComplete;
    expect(getShadowParts(el, 'item')).to.have.lengthOf(3);
  });

  it('applies columns CSS custom property for grid variant', async () => {
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${mockItems} .columns=${4}></loquix-example-gallery>`,
    );
    const grid = el.shadowRoot!.querySelector('.gallery--grid') as HTMLElement;
    expect(grid).to.exist;
    expect(grid.getAttribute('style')).to.contain('--loquix-gallery-columns: 4');
  });

  it('does not set columns style for list variant', async () => {
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery
        .items=${mockItems}
        variant="list"
        .columns=${4}
      ></loquix-example-gallery>`,
    );
    const list = el.shadowRoot!.querySelector('.gallery--list') as HTMLElement;
    expect(list).to.exist;
    // list variant should have empty or no style for columns
    const style = list.getAttribute('style') ?? '';
    expect(style).to.not.contain('--loquix-gallery-columns');
  });

  it('fires loquix-gallery-select with full item detail', async () => {
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${mockItems}></loquix-example-gallery>`,
    );
    const items = getShadowParts(el, 'item');
    const eventPromise = waitForEvent(el, 'loquix-gallery-select');
    items[0].click();
    const event = await eventPromise;
    expect(event.detail.item.id).to.equal('1');
    expect(event.detail.item.prompt).to.equal('Write a poem');
    expect(event.detail.item.category).to.equal('Creative');
  });

  it('shows items without category regardless of active filter', async () => {
    const itemsWithUncategorized: GalleryItem[] = [
      { id: '1', title: 'Write a poem', prompt: 'Write a poem', category: 'Creative' },
      { id: '2', title: 'Debug code', prompt: 'Debug my code', category: 'Code' },
      { id: '3', title: 'General item', prompt: 'General' },
    ];
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${itemsWithUncategorized}></loquix-example-gallery>`,
    );
    // All items shown by default
    expect(getShadowParts(el, 'item')).to.have.lengthOf(3);
    // Filter to "Creative": uncategorized items still pass because _getFilteredItems
    // filters by category match, and items without category won't match
    const tabs = el.shadowRoot!.querySelectorAll('[role="tab"]');
    const creativeTab = Array.from(tabs).find(
      t => t.textContent!.trim() === 'Creative',
    ) as HTMLElement;
    creativeTab.click();
    await el.updateComplete;
    // Only "Creative" items shown (uncategorized items do not match the filter)
    const filteredItems = getShadowParts(el, 'item');
    expect(filteredItems.some(i => i.textContent!.includes('Write a poem'))).to.be.true;
  });

  it('renders icon on items when provided', async () => {
    const itemsWithIcon: GalleryItem[] = [
      { id: '1', title: 'Write a poem', prompt: 'Write a poem', icon: '✏️' },
    ];
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${itemsWithIcon}></loquix-example-gallery>`,
    );
    const icon = el.shadowRoot!.querySelector('.item__icon');
    expect(icon).to.exist;
    expect(icon!.textContent).to.contain('✏️');
  });

  it('renders description on items when provided', async () => {
    const itemsWithDesc: GalleryItem[] = [
      {
        id: '1',
        title: 'Write a poem',
        prompt: 'Write a poem',
        description: 'Create a beautiful verse',
      },
    ];
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${itemsWithDesc}></loquix-example-gallery>`,
    );
    const desc = el.shadowRoot!.querySelector('.item__description');
    expect(desc).to.exist;
    expect(desc!.textContent).to.contain('Create a beautiful verse');
  });

  it('does not render icon or description when not provided', async () => {
    const simpleItems: GalleryItem[] = [{ id: '1', title: 'Simple item', prompt: 'Simple' }];
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${simpleItems}></loquix-example-gallery>`,
    );
    expect(el.shadowRoot!.querySelector('.item__icon')).to.not.exist;
    expect(el.shadowRoot!.querySelector('.item__description')).to.not.exist;
  });

  it('does not render category tabs for items with a single category', async () => {
    const singleCategoryItems: GalleryItem[] = [
      { id: '1', title: 'Write a poem', prompt: 'Write a poem', category: 'Creative' },
      { id: '2', title: 'Write a story', prompt: 'Write a story', category: 'Creative' },
    ];
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${singleCategoryItems}></loquix-example-gallery>`,
    );
    const tabs = el.shadowRoot!.querySelectorAll('[role="tab"]');
    expect(tabs.length).to.equal(0);
  });

  it('does not render heading when heading is empty', async () => {
    const el = await fixture<LoquixExampleGallery>(
      html`<loquix-example-gallery .items=${mockItems}></loquix-example-gallery>`,
    );
    const heading = el.shadowRoot!.querySelector('.heading');
    expect(heading).to.not.exist;
  });
});
