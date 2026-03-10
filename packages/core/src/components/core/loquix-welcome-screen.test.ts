import { expect, fixture, html } from '@open-wc/testing';
import { getSlotContent } from '../../test-utils.js';
import './define-welcome-screen.js';
import type { LoquixWelcomeScreen } from './loquix-welcome-screen.js';
import type { Suggestion } from '../../types/index.js';

const mockSuggestions: Suggestion[] = [
  { id: '1', text: 'Write a poem' },
  { id: '2', text: 'Help with code' },
];

describe('loquix-welcome-screen', () => {
  it('renders default heading', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen></loquix-welcome-screen>`,
    );
    const heading = el.shadowRoot!.querySelector('.heading');
    expect(heading).to.exist;
    expect(heading!.textContent).to.contain('How can I help you?');
  });

  it('uses custom heading', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen heading="Ask me anything!"></loquix-welcome-screen>`,
    );
    const heading = el.shadowRoot!.querySelector('.heading');
    expect(heading!.textContent).to.contain('Ask me anything!');
  });

  it('shows subheading when provided', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen
        subheading="I can help with code, writing, and more."
      ></loquix-welcome-screen>`,
    );
    const subheading = el.shadowRoot!.querySelector('.subheading');
    expect(subheading).to.exist;
    expect(subheading!.textContent).to.contain('I can help with code');
  });

  it('renders suggestion chips when provided', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen .suggestions=${mockSuggestions}></loquix-welcome-screen>`,
    );
    await el.updateComplete;
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips');
    expect(chips).to.exist;
  });

  it('has named slots for customization', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen>
        <span slot="logo">🤖</span>
        <span slot="footer">Powered by AI</span>
      </loquix-welcome-screen>`,
    );
    for (const name of ['logo', 'footer']) {
      const slot = el.shadowRoot!.querySelector(`slot[name="${name}"]`) as HTMLSlotElement;
      expect(slot, `slot "${name}"`).to.exist;
    }
  });

  it('reflects layout attribute', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen layout="split"></loquix-welcome-screen>`,
    );
    expect(el.layout).to.equal('split');
    expect(el.getAttribute('layout')).to.equal('split');
  });

  it('does not render suggestion chips when suggestions are empty', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen></loquix-welcome-screen>`,
    );
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips');
    expect(chips).to.not.exist;
  });

  it('does not render suggestion chips for empty array', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen .suggestions=${[]}></loquix-welcome-screen>`,
    );
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips');
    expect(chips).to.not.exist;
  });

  it('passes suggestionVariant to inner suggestion-chips', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen
        .suggestions=${mockSuggestions}
        suggestion-variant="card"
      ></loquix-welcome-screen>`,
    );
    await el.updateComplete;
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips') as any;
    expect(chips).to.exist;
    expect(chips.variant).to.equal('card');
  });

  it('defaults suggestionVariant to "chip"', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen .suggestions=${mockSuggestions}></loquix-welcome-screen>`,
    );
    await el.updateComplete;
    const chips = el.shadowRoot!.querySelector('loquix-suggestion-chips') as any;
    expect(chips).to.exist;
    expect(chips.variant).to.equal('chip');
  });

  it('uses localized heading when no heading property is set', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen></loquix-welcome-screen>`,
    );
    const heading = el.shadowRoot!.querySelector('.heading');
    expect(heading).to.exist;
    // Default localized heading should be a non-empty string
    expect(heading!.textContent!.trim().length).to.be.greaterThan(0);
  });

  it('has logo slot', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen><span slot="logo">Logo</span></loquix-welcome-screen>`,
    );
    const slot = el.shadowRoot!.querySelector('slot[name="logo"]') as HTMLSlotElement;
    expect(slot).to.exist;
    const assigned = getSlotContent(el, 'logo');
    expect(assigned).to.have.lengthOf(1);
    expect(assigned[0].textContent).to.equal('Logo');
  });

  it('has heading slot that overrides heading property', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen heading="Property heading">
        <h1 slot="heading">Slot heading</h1>
      </loquix-welcome-screen>`,
    );
    const headingSlot = el.shadowRoot!.querySelector('slot[name="heading"]') as HTMLSlotElement;
    expect(headingSlot).to.exist;
    const assigned = getSlotContent(el, 'heading');
    expect(assigned).to.have.lengthOf(1);
    expect(assigned[0].textContent).to.equal('Slot heading');
  });

  it('has subheading slot', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen><p slot="subheading">Custom sub</p></loquix-welcome-screen>`,
    );
    const slot = el.shadowRoot!.querySelector('slot[name="subheading"]') as HTMLSlotElement;
    expect(slot).to.exist;
  });

  it('has suggestions slot', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen
        ><div slot="suggestions">Custom chips</div></loquix-welcome-screen
      >`,
    );
    const slot = el.shadowRoot!.querySelector('slot[name="suggestions"]') as HTMLSlotElement;
    expect(slot).to.exist;
    const assigned = getSlotContent(el, 'suggestions');
    expect(assigned).to.have.lengthOf(1);
  });

  it('has footer slot', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen><span slot="footer">Footer text</span></loquix-welcome-screen>`,
    );
    const slot = el.shadowRoot!.querySelector('slot[name="footer"]') as HTMLSlotElement;
    expect(slot).to.exist;
    const assigned = getSlotContent(el, 'footer');
    expect(assigned).to.have.lengthOf(1);
    expect(assigned[0].textContent).to.equal('Footer text');
  });

  it('does not render subheading element when subheading is empty', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen></loquix-welcome-screen>`,
    );
    const subheading = el.shadowRoot!.querySelector('.subheading');
    expect(subheading).to.not.exist;
  });

  it('defaults to centered layout', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen></loquix-welcome-screen>`,
    );
    expect(el.layout).to.equal('centered');
    expect(el.getAttribute('layout')).to.equal('centered');
  });

  it('renders logo, content, and footer sections', async () => {
    const el = await fixture<LoquixWelcomeScreen>(
      html`<loquix-welcome-screen></loquix-welcome-screen>`,
    );
    const logo = el.shadowRoot!.querySelector('.logo');
    const content = el.shadowRoot!.querySelector('.content');
    const footer = el.shadowRoot!.querySelector('.footer');
    expect(logo).to.exist;
    expect(content).to.exist;
    expect(footer).to.exist;
  });
});
