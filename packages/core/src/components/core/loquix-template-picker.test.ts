import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent } from '../../test-utils.js';
import './define-template-picker.js';
import type { LoquixTemplatePicker } from './loquix-template-picker.js';
import type { Template } from '../../types/index.js';

const mockTemplates: Template[] = [
  {
    id: '1',
    title: 'Code Review',
    description: 'Review code for bugs',
    category: 'Code',
    prompt: 'Review this code...',
  },
  {
    id: '2',
    title: 'Summarize',
    description: 'Summarize text',
    category: 'Writing',
    prompt: 'Summarize this...',
  },
  {
    id: '3',
    title: 'Debug Help',
    description: 'Debug an issue',
    category: 'Code',
    prompt: 'Help me debug...',
  },
  {
    id: '4',
    title: 'Email Draft',
    description: 'Draft an email',
    category: 'Writing',
    prompt: 'Draft an email...',
  },
];

describe('loquix-template-picker', () => {
  it('renders dialog element', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    const dialog = el.shadowRoot!.querySelector('dialog');
    expect(dialog).to.exist;
  });

  it('defaults to closed', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    expect(el.open).to.be.false;
  });

  it('opens on show()', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;
    expect(el.open).to.be.true;
  });

  it('dispatches loquix-template-picker-open on show()', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    const eventPromise = waitForEvent(el, 'loquix-template-picker-open');
    el.show();
    const event = await eventPromise;
    expect(event).to.exist;
  });

  it('closes on hide()', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;
    el.hide();
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it('dispatches loquix-template-picker-close on hide()', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;
    const eventPromise = waitForEvent(el, 'loquix-template-picker-close');
    el.hide();
    const event = await eventPromise;
    expect(event).to.exist;
  });

  it('renders heading', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker
        .templates=${mockTemplates}
        heading="Pick a template"
      ></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;
    const heading = el.shadowRoot!.querySelector('.heading');
    expect(heading).to.exist;
    expect(heading!.textContent).to.contain('Pick a template');
  });

  it('uses default heading', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    const heading = el.shadowRoot!.querySelector('.heading');
    expect(heading).to.exist;
    expect(heading!.textContent).to.contain('Choose a template');
  });

  it('renders template cards in grid', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates} open></loquix-template-picker>`,
    );
    // Force showModal via show()
    el.show();
    await el.updateComplete;
    const cards = el.shadowRoot!.querySelectorAll('loquix-template-card');
    expect(cards.length).to.equal(4);
  });

  it('renders search input when searchable', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;
    const search = el.shadowRoot!.querySelector('.search-input');
    expect(search).to.exist;
  });

  it('renders category tabs when multiple categories exist', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;
    const tabs = el.shadowRoot!.querySelectorAll('.category-btn');
    expect(tabs.length).to.equal(2);
    expect(tabs[0].textContent).to.contain('Code');
    expect(tabs[1].textContent).to.contain('Writing');
  });

  it('has close button', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;
    const closeBtn = el.shadowRoot!.querySelector('.close-btn');
    expect(closeBtn).to.exist;
    expect(closeBtn!.getAttribute('aria-label')).to.equal('Close');
  });

  it('shows empty state when no templates match', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${[]}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;
    const empty = el.shadowRoot!.querySelector('.empty');
    expect(empty).to.exist;
    expect(empty!.textContent).to.contain('No templates match');
  });

  it('reflects open attribute', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.true;
  });

  // --- Search filtering ---

  it('search filtering: type text filters templates to matching ones', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;

    const searchInput = el.shadowRoot!.querySelector('.search-input') as HTMLInputElement;
    searchInput.value = 'Code';
    searchInput.dispatchEvent(new Event('input'));
    await el.updateComplete;

    // Only "Code Review" matches — title contains "Code". "Debug Help" does not contain "Code" in title or description.
    const cards = el.shadowRoot!.querySelectorAll('loquix-template-card');
    expect(cards.length).to.equal(1);
  });

  it('search filtering by description shows matching templates', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;

    const searchInput = el.shadowRoot!.querySelector('.search-input') as HTMLInputElement;
    searchInput.value = 'bugs';
    searchInput.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const cards = el.shadowRoot!.querySelectorAll('loquix-template-card');
    expect(cards.length).to.equal(1); // "Code Review" has description "Review code for bugs"
  });

  // --- Category + search combined filtering ---

  it('category + search combined filtering narrows results', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;

    // Click category "Code"
    const tabs = el.shadowRoot!.querySelectorAll('.category-btn');
    (tabs[0] as HTMLButtonElement).click();
    await el.updateComplete;

    // Should only show Code category items
    let cards = el.shadowRoot!.querySelectorAll('loquix-template-card');
    expect(cards.length).to.equal(2); // Code Review and Debug Help

    // Now also search
    const searchInput = el.shadowRoot!.querySelector('.search-input') as HTMLInputElement;
    searchInput.value = 'Review';
    searchInput.dispatchEvent(new Event('input'));
    await el.updateComplete;

    cards = el.shadowRoot!.querySelectorAll('loquix-template-card');
    expect(cards.length).to.equal(1); // Only Code Review
  });

  // --- Category toggling ---

  it('clicking active category deselects it (shows all again)', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;

    const tabs = el.shadowRoot!.querySelectorAll('.category-btn');
    (tabs[0] as HTMLButtonElement).click();
    await el.updateComplete;

    let cards = el.shadowRoot!.querySelectorAll('loquix-template-card');
    expect(cards.length).to.equal(2);

    // Click again to deselect
    (tabs[0] as HTMLButtonElement).click();
    await el.updateComplete;

    cards = el.shadowRoot!.querySelectorAll('loquix-template-card');
    expect(cards.length).to.equal(4);
  });

  // --- loquix-template-select fires on card click ---

  it('loquix-template-select fires with template detail on card click', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;

    const eventPromise = waitForEvent(el, 'loquix-template-select');
    // Simulate the card dispatching the event
    const card = el.shadowRoot!.querySelector('loquix-template-card')!;
    card.dispatchEvent(
      new CustomEvent('loquix-template-select', {
        bubbles: true,
        composed: true,
        detail: { template: mockTemplates[0] },
      }),
    );
    const event = await eventPromise;
    expect(event.detail.template).to.deep.equal(mockTemplates[0]);
    // Should also close the picker
    expect(el.open).to.be.false;
  });

  // --- Explicit categories prop overrides auto-derived categories ---

  it('explicit categories prop overrides auto-derived categories', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker
        .templates=${mockTemplates}
        .categories=${['Writing', 'Code']}
      ></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;

    const tabs = el.shadowRoot!.querySelectorAll('.category-btn');
    expect(tabs.length).to.equal(2);
    expect(tabs[0].textContent).to.contain('Writing');
    expect(tabs[1].textContent).to.contain('Code');
  });

  // --- Search input placeholder from localization ---

  it('search input placeholder is from localization', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;

    const searchInput = el.shadowRoot!.querySelector('.search-input') as HTMLInputElement;
    expect(searchInput.getAttribute('placeholder')).to.be.a('string').and.not.be.empty;
  });

  // --- Search input aria-label from localization ---

  it('search input has aria-label from localization', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;

    const searchInput = el.shadowRoot!.querySelector('.search-input') as HTMLInputElement;
    expect(searchInput.getAttribute('aria-label')).to.be.a('string').and.not.be.empty;
  });

  // --- Empty text from localization ---

  it('empty state text comes from localization', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${[]}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;

    const empty = el.shadowRoot!.querySelector('.empty');
    expect(empty).to.exist;
    expect(empty!.textContent!.trim()).to.be.a('string').and.not.be.empty;
  });

  // --- hide() resets search and category ---

  it('hide() resets search query and active category', async () => {
    const el = await fixture<LoquixTemplatePicker>(
      html`<loquix-template-picker .templates=${mockTemplates}></loquix-template-picker>`,
    );
    el.show();
    await el.updateComplete;

    // Set search and category
    const searchInput = el.shadowRoot!.querySelector('.search-input') as HTMLInputElement;
    searchInput.value = 'test';
    searchInput.dispatchEvent(new Event('input'));
    const tabs = el.shadowRoot!.querySelectorAll('.category-btn');
    (tabs[0] as HTMLButtonElement).click();
    await el.updateComplete;

    el.hide();
    await el.updateComplete;

    // Reopen
    el.show();
    await el.updateComplete;

    // Search should be cleared
    const searchInput2 = el.shadowRoot!.querySelector('.search-input') as HTMLInputElement;
    expect(searchInput2.value).to.equal('');
    // All cards should be visible
    const cards = el.shadowRoot!.querySelectorAll('loquix-template-card');
    expect(cards.length).to.equal(4);
  });
});
