import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent } from '../../test-utils.js';
import './define-follow-up-suggestions.js';
import type { LoquixFollowUpSuggestions } from './loquix-follow-up-suggestions.js';
import type { Suggestion } from '../../types/index.js';

const mockSuggestions: Suggestion[] = [
  { id: '1', text: 'Tell me more' },
  { id: '2', text: 'Give an example' },
  { id: '3', text: 'Summarize' },
];

describe('loquix-follow-up-suggestions', () => {
  it('renders suggestion chips when suggestions provided', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions
        .suggestions=${mockSuggestions}
      ></loquix-follow-up-suggestions>`,
    );
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips');
    expect(chips).to.exist;
  });

  it('renders nothing when no suggestions', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions></loquix-follow-up-suggestions>`,
    );
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips');
    expect(chips).to.not.exist;
  });

  it('shows label when provided', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions
        .suggestions=${mockSuggestions}
        label="Related questions"
      ></loquix-follow-up-suggestions>`,
    );
    const label = el.shadowRoot!.querySelector('.label');
    expect(label).to.exist;
    expect(label!.textContent).to.contain('Related questions');
  });

  it('reflects variant attribute', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions variant="stacked"></loquix-follow-up-suggestions>`,
    );
    expect(el.variant).to.equal('stacked');
    expect(el.getAttribute('variant')).to.equal('stacked');
  });

  it('passes max-visible to inner chips', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions
        .suggestions=${mockSuggestions}
        max-visible="2"
      ></loquix-follow-up-suggestions>`,
    );
    expect(el.maxVisible).to.equal(2);
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips') as any;
    expect(chips.maxVisible).to.equal(2);
  });

  it('defaults to inline variant', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions></loquix-follow-up-suggestions>`,
    );
    expect(el.variant).to.equal('inline');
  });

  it('renders all suggestion items in the inner chips', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions
        .suggestions=${mockSuggestions}
      ></loquix-follow-up-suggestions>`,
    );
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips') as any;
    expect(chips).to.exist;
    expect(chips.suggestions).to.have.lengthOf(3);
  });

  it('bubbles loquix-suggestion-select event from inner chips', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions
        .suggestions=${mockSuggestions}
      ></loquix-follow-up-suggestions>`,
    );
    const chipsEl = el.shadowRoot!.querySelector('loquix-suggestion-chips') as any;
    await chipsEl.updateComplete;
    const chipButtons = chipsEl.shadowRoot!.querySelectorAll('[part~="chip"]');
    expect(chipButtons.length).to.be.greaterThan(0);
    const eventPromise = waitForEvent(el, 'loquix-suggestion-select');
    (chipButtons[0] as HTMLElement).click();
    const event = await eventPromise;
    expect(event.detail.suggestion.text).to.equal('Tell me more');
  });

  it('renders nothing for empty suggestions array', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions .suggestions=${[]}></loquix-follow-up-suggestions>`,
    );
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips');
    expect(chips).to.not.exist;
  });

  it('passes "chip" variant to inner chips for inline variant', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions
        .suggestions=${mockSuggestions}
        variant="inline"
      ></loquix-follow-up-suggestions>`,
    );
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips') as any;
    expect(chips.variant).to.equal('chip');
  });

  it('passes "pill" variant to inner chips for stacked variant', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions
        .suggestions=${mockSuggestions}
        variant="stacked"
      ></loquix-follow-up-suggestions>`,
    );
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips') as any;
    expect(chips.variant).to.equal('pill');
  });

  it('sets wrap=false on inner chips for carousel variant', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions
        .suggestions=${mockSuggestions}
        variant="carousel"
      ></loquix-follow-up-suggestions>`,
    );
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips') as any;
    expect(chips.wrap).to.be.false;
  });

  it('sets wrap=true on inner chips for non-carousel variant', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions
        .suggestions=${mockSuggestions}
        variant="inline"
      ></loquix-follow-up-suggestions>`,
    );
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips') as any;
    expect(chips.wrap).to.be.true;
  });

  it('multiple suggestions render in correct order', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions
        .suggestions=${mockSuggestions}
      ></loquix-follow-up-suggestions>`,
    );
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips') as any;
    expect(chips.suggestions[0].text).to.equal('Tell me more');
    expect(chips.suggestions[1].text).to.equal('Give an example');
    expect(chips.suggestions[2].text).to.equal('Summarize');
  });

  it('does not show label when label is not provided', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions
        .suggestions=${mockSuggestions}
      ></loquix-follow-up-suggestions>`,
    );
    const label = el.shadowRoot!.querySelector('.label');
    expect(label).to.not.exist;
  });

  it('accepts message-id attribute', async () => {
    const el = await fixture<LoquixFollowUpSuggestions>(
      html`<loquix-follow-up-suggestions
        .suggestions=${mockSuggestions}
        message-id="msg-123"
      ></loquix-follow-up-suggestions>`,
    );
    expect(el.messageId).to.equal('msg-123');
  });
});
