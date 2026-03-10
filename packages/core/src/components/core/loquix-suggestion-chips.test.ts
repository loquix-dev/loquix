import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart, getShadowParts, simulateKeyboard } from '../../test-utils.js';
import './define-suggestion-chips.js';
import type { LoquixSuggestionChips } from './loquix-suggestion-chips.js';
import type { Suggestion } from '../../types/index.js';

const mockSuggestions: Suggestion[] = [
  { id: '1', text: 'Write a poem' },
  { id: '2', text: 'Explain quantum physics' },
  { id: '3', text: 'Help with code' },
];

describe('loquix-suggestion-chips', () => {
  it('renders chips for each suggestion', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips .suggestions=${mockSuggestions}></loquix-suggestion-chips>`,
    );
    const chips = getShadowParts(el, 'chip');
    expect(chips).to.have.lengthOf(3);
    expect(chips[0].textContent).to.contain('Write a poem');
    expect(chips[1].textContent).to.contain('Explain quantum physics');
  });

  it('dispatches loquix-suggestion-select on chip click', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips .suggestions=${mockSuggestions}></loquix-suggestion-chips>`,
    );
    const chips = getShadowParts(el, 'chip');
    const eventPromise = waitForEvent(el, 'loquix-suggestion-select');
    chips[0].click();
    const event = await eventPromise;
    expect(event.detail.suggestion.text).to.equal('Write a poem');
  });

  it('does not dispatch when disabled', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips
        .suggestions=${mockSuggestions}
        disabled
      ></loquix-suggestion-chips>`,
    );
    let fired = false;
    el.addEventListener('loquix-suggestion-select', () => {
      fired = true;
    });
    const chips = getShadowParts(el, 'chip');
    chips[0].click();
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('shows "+N more" button when maxVisible is set', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips
        .suggestions=${mockSuggestions}
        max-visible="2"
      ></loquix-suggestion-chips>`,
    );
    const chips = getShadowParts(el, 'chip');
    expect(chips).to.have.lengthOf(2);
    const moreBtn = getShadowPart(el, 'more-button');
    expect(moreBtn).to.exist;
    expect(moreBtn!.textContent).to.contain('+1 more');
  });

  it('renders empty when no suggestions', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips></loquix-suggestion-chips>`,
    );
    const chips = getShadowParts(el, 'chip');
    expect(chips).to.have.lengthOf(0);
  });

  it('ArrowRight moves focus to next chip', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips .suggestions=${mockSuggestions}></loquix-suggestion-chips>`,
    );
    const chips = getShadowParts(el, 'chip');
    chips[0].focus();
    simulateKeyboard(chips[0], 'ArrowRight');
    expect(el.shadowRoot!.activeElement).to.equal(chips[1]);
  });

  it('ArrowLeft moves focus to previous chip', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips .suggestions=${mockSuggestions}></loquix-suggestion-chips>`,
    );
    const chips = getShadowParts(el, 'chip');
    chips[1].focus();
    simulateKeyboard(chips[1], 'ArrowLeft');
    expect(el.shadowRoot!.activeElement).to.equal(chips[0]);
  });

  it('ArrowRight wraps from last chip to first', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips .suggestions=${mockSuggestions}></loquix-suggestion-chips>`,
    );
    const chips = getShadowParts(el, 'chip');
    chips[2].focus();
    simulateKeyboard(chips[2], 'ArrowRight');
    expect(el.shadowRoot!.activeElement).to.equal(chips[0]);
  });

  it('ArrowLeft wraps from first chip to last', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips .suggestions=${mockSuggestions}></loquix-suggestion-chips>`,
    );
    const chips = getShadowParts(el, 'chip');
    chips[0].focus();
    simulateKeyboard(chips[0], 'ArrowLeft');
    expect(el.shadowRoot!.activeElement).to.equal(chips[2]);
  });

  it('clicking "+N more" expands all chips', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips
        .suggestions=${mockSuggestions}
        max-visible="1"
      ></loquix-suggestion-chips>`,
    );
    expect(getShadowParts(el, 'chip')).to.have.lengthOf(1);
    const moreBtn = getShadowPart(el, 'more-button')!;
    expect(moreBtn).to.exist;
    moreBtn.click();
    await el.updateComplete;
    expect(getShadowParts(el, 'chip')).to.have.lengthOf(3);
    expect(getShadowPart(el, 'more-button')).to.not.exist;
  });

  it('renders card-style chips with descriptions when variant="card"', async () => {
    const cardSuggestions: Suggestion[] = [
      { id: '1', text: 'Write a poem', description: 'Create a beautiful verse' },
      { id: '2', text: 'Debug code', description: 'Fix errors in your code' },
    ];
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips
        .suggestions=${cardSuggestions}
        variant="card"
      ></loquix-suggestion-chips>`,
    );
    expect(el.variant).to.equal('card');
    const descriptions = el.shadowRoot!.querySelectorAll('.chip__description');
    expect(descriptions.length).to.equal(2);
    expect(descriptions[0].textContent).to.contain('Create a beautiful verse');
  });

  it('does not render descriptions for non-card variant', async () => {
    const cardSuggestions: Suggestion[] = [
      { id: '1', text: 'Write a poem', description: 'Create a beautiful verse' },
    ];
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips
        .suggestions=${cardSuggestions}
        variant="chip"
      ></loquix-suggestion-chips>`,
    );
    const descriptions = el.shadowRoot!.querySelectorAll('.chip__description');
    expect(descriptions.length).to.equal(0);
  });

  it('disabled chips have disabled attribute', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips
        .suggestions=${mockSuggestions}
        disabled
      ></loquix-suggestion-chips>`,
    );
    const chips = getShadowParts(el, 'chip');
    for (const chip of chips) {
      expect(chip.hasAttribute('disabled')).to.be.true;
    }
  });

  it('renders nothing for empty suggestions array', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips .suggestions=${[]}></loquix-suggestion-chips>`,
    );
    const chips = getShadowParts(el, 'chip');
    expect(chips).to.have.lengthOf(0);
    expect(getShadowPart(el, 'more-button')).to.not.exist;
  });

  it('applies no-wrap class when wrap is false', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips
        .suggestions=${mockSuggestions}
        .wrap=${false}
      ></loquix-suggestion-chips>`,
    );
    const group = el.shadowRoot!.querySelector('.chips');
    expect(group!.classList.contains('chips--no-wrap')).to.be.true;
  });

  it('does not apply no-wrap class when wrap is true', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips
        .suggestions=${mockSuggestions}
        .wrap=${true}
      ></loquix-suggestion-chips>`,
    );
    const group = el.shadowRoot!.querySelector('.chips');
    expect(group!.classList.contains('chips--no-wrap')).to.be.false;
  });

  it('has role="group" on chips container', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips .suggestions=${mockSuggestions}></loquix-suggestion-chips>`,
    );
    const group = el.shadowRoot!.querySelector('[role="group"]');
    expect(group).to.exist;
  });

  it('has aria-label on the chips group', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips .suggestions=${mockSuggestions}></loquix-suggestion-chips>`,
    );
    const group = el.shadowRoot!.querySelector('[role="group"]');
    expect(group!.getAttribute('aria-label')).to.be.a('string');
    expect(group!.getAttribute('aria-label')!.length).to.be.greaterThan(0);
  });

  it('renders icon when suggestion has icon', async () => {
    const iconSuggestions: Suggestion[] = [{ id: '1', text: 'Write a poem', icon: '✏️' }];
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips .suggestions=${iconSuggestions}></loquix-suggestion-chips>`,
    );
    const icon = el.shadowRoot!.querySelector('.chip__icon');
    expect(icon).to.exist;
    expect(icon!.textContent).to.contain('✏️');
  });

  it('does not show more button when all suggestions are within maxVisible', async () => {
    const el = await fixture<LoquixSuggestionChips>(
      html`<loquix-suggestion-chips
        .suggestions=${mockSuggestions}
        max-visible="5"
      ></loquix-suggestion-chips>`,
    );
    const chips = getShadowParts(el, 'chip');
    expect(chips).to.have.lengthOf(3);
    expect(getShadowPart(el, 'more-button')).to.not.exist;
  });
});
