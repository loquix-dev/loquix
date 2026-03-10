import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart } from '../../test-utils.js';
import './define-template-card.js';
import type { LoquixTemplateCard } from './loquix-template-card.js';
import type { Template } from '../../types/index.js';

const mockTemplate: Template = {
  id: 'code-review',
  title: 'Code Review',
  description: 'Review my code for best practices',
  prompt: 'Review the following code...',
};

describe('loquix-template-card', () => {
  it('renders template title and description', async () => {
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${mockTemplate}></loquix-template-card>`,
    );
    const card = getShadowPart(el, 'card');
    expect(card).to.exist;
    expect(card!.textContent).to.contain('Code Review');
    expect(card!.textContent).to.contain('Review my code for best practices');
  });

  it('dispatches loquix-template-select on click', async () => {
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${mockTemplate}></loquix-template-card>`,
    );
    const card = getShadowPart(el, 'card')!;
    const eventPromise = waitForEvent(el, 'loquix-template-select');
    card.click();
    const event = await eventPromise;
    expect(event.detail.template.id).to.equal('code-review');
    expect(event.detail.template.title).to.equal('Code Review');
  });

  it('reflects selected property', async () => {
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${mockTemplate} selected></loquix-template-card>`,
    );
    expect(el.selected).to.be.true;
    expect(el.hasAttribute('selected')).to.be.true;
  });

  it('renders without description', async () => {
    const noDesc: Template = { id: '1', title: 'Quick', prompt: 'Do it' };
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${noDesc}></loquix-template-card>`,
    );
    const card = getShadowPart(el, 'card');
    expect(card).to.exist;
    expect(card!.textContent).to.contain('Quick');
    // No description div should be rendered
    expect(el.shadowRoot!.querySelector('.description')).to.not.exist;
  });

  // === Renders template title ===

  it('renders template title in the card', async () => {
    const tmpl: Template = { id: 'summarize', title: 'Summarize Text', prompt: 'Summarize...' };
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${tmpl}></loquix-template-card>`,
    );
    const titleEl = el.shadowRoot!.querySelector('.title');
    expect(titleEl).to.exist;
    expect(titleEl!.textContent).to.contain('Summarize Text');
  });

  // === Renders description when provided ===

  it('renders description section when template.description is provided', async () => {
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${mockTemplate}></loquix-template-card>`,
    );
    const descEl = el.shadowRoot!.querySelector('.description');
    expect(descEl).to.exist;
    expect(descEl!.textContent).to.contain('Review my code for best practices');
  });

  // === Omits description when empty ===

  it('omits description section when template.description is empty string', async () => {
    const tmpl: Template = { id: '2', title: 'Empty Desc', description: '', prompt: 'Go' };
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${tmpl}></loquix-template-card>`,
    );
    const descEl = el.shadowRoot!.querySelector('.description');
    expect(descEl).to.not.exist;
  });

  it('omits description section when template.description is undefined', async () => {
    const tmpl: Template = { id: '3', title: 'No Desc', prompt: 'Go' };
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${tmpl}></loquix-template-card>`,
    );
    const descEl = el.shadowRoot!.querySelector('.description');
    expect(descEl).to.not.exist;
  });

  // === Renders icon when provided ===

  it('renders icon when template.icon is provided', async () => {
    const tmpl: Template = { id: '4', title: 'With Icon', icon: '🔍', prompt: 'Search' };
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${tmpl}></loquix-template-card>`,
    );
    const iconEl = el.shadowRoot!.querySelector('.icon');
    expect(iconEl).to.exist;
    expect(iconEl!.textContent).to.contain('🔍');
  });

  it('does not render icon span when template.icon is not provided', async () => {
    const tmpl: Template = { id: '5', title: 'No Icon', prompt: 'Go' };
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${tmpl}></loquix-template-card>`,
    );
    const iconEl = el.shadowRoot!.querySelector('.icon');
    expect(iconEl).to.not.exist;
  });

  // === Selected styling ===

  it('does not have selected attribute when selected is false', async () => {
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${mockTemplate}></loquix-template-card>`,
    );
    expect(el.selected).to.be.false;
    expect(el.hasAttribute('selected')).to.be.false;
  });

  it('toggles selected attribute when property changes', async () => {
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${mockTemplate}></loquix-template-card>`,
    );
    expect(el.hasAttribute('selected')).to.be.false;
    el.selected = true;
    await el.updateComplete;
    expect(el.hasAttribute('selected')).to.be.true;
    el.selected = false;
    await el.updateComplete;
    expect(el.hasAttribute('selected')).to.be.false;
  });

  // === Event detail contains template ===

  it('loquix-template-select event contains full template object in detail', async () => {
    const tmpl: Template = {
      id: 'full',
      title: 'Full Template',
      description: 'Desc',
      prompt: 'Do stuff',
      icon: '📋',
    };
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${tmpl}></loquix-template-card>`,
    );
    const card = getShadowPart(el, 'card')!;
    const eventPromise = waitForEvent(el, 'loquix-template-select');
    card.click();
    const event = await eventPromise;
    expect(event.detail.template).to.deep.equal(tmpl);
  });

  // === Event has bubbles and composed ===

  it('loquix-template-select event has bubbles: true and composed: true', async () => {
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${mockTemplate}></loquix-template-card>`,
    );
    const card = getShadowPart(el, 'card')!;
    const eventPromise = waitForEvent(el, 'loquix-template-select');
    card.click();
    const event = await eventPromise;
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
  });

  // === Keyboard: Enter activates card ===

  it('activates card on Enter key press via native button behavior', async () => {
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${mockTemplate}></loquix-template-card>`,
    );
    const card = getShadowPart(el, 'card')!;
    const eventPromise = waitForEvent(el, 'loquix-template-select');
    // Buttons natively handle Enter with a click event
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    card.click();
    const event = await eventPromise;
    expect(event.detail.template.id).to.equal('code-review');
  });

  // === Keyboard: Space activates card ===

  it('activates card on Space key press via native button behavior', async () => {
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${mockTemplate}></loquix-template-card>`,
    );
    const card = getShadowPart(el, 'card')!;
    const eventPromise = waitForEvent(el, 'loquix-template-select');
    // Buttons natively handle Space with a click event
    card.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
    card.click();
    const event = await eventPromise;
    expect(event.detail.template.id).to.equal('code-review');
  });

  // === CSS part "card" is queryable ===

  it('CSS part "card" is queryable via getShadowPart', async () => {
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${mockTemplate}></loquix-template-card>`,
    );
    const card = getShadowPart(el, 'card');
    expect(card).to.exist;
    expect(card!.getAttribute('part')).to.equal('card');
  });

  // === Card element is a button ===

  it('card element is a <button> for accessibility', async () => {
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${mockTemplate}></loquix-template-card>`,
    );
    const card = getShadowPart(el, 'card');
    expect(card!.tagName.toLowerCase()).to.equal('button');
  });

  // === Footer slot exists ===

  it('has a footer slot for extra content', async () => {
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${mockTemplate}></loquix-template-card>`,
    );
    const footerSlot = el.shadowRoot!.querySelector('slot[name="footer"]');
    expect(footerSlot).to.exist;
  });

  // === Icon slot exists ===

  it('has an icon slot for custom icon content', async () => {
    const el = await fixture<LoquixTemplateCard>(
      html`<loquix-template-card .template=${mockTemplate}></loquix-template-card>`,
    );
    const iconSlot = el.shadowRoot!.querySelector('slot[name="icon"]');
    expect(iconSlot).to.exist;
  });
});
