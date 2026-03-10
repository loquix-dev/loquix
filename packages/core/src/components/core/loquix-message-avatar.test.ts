import { expect, fixture, html } from '@open-wc/testing';
import { getShadowPart } from '../../test-utils.js';
import './define-message-avatar.js';
import type { LoquixMessageAvatar } from './loquix-message-avatar.js';

describe('loquix-message-avatar', () => {
  it('renders default AI icon when no src or name', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar></loquix-message-avatar>`,
    );
    const container = getShadowPart(el, 'container');
    expect(container).to.exist;
    expect(container!.getAttribute('aria-label')).to.equal('AI avatar');
    // Should render SVG icon (no img, no initials span)
    expect(container!.querySelector('svg')).to.exist;
    expect(container!.querySelector('img')).to.not.exist;
  });

  it('renders image when src is provided', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar
        src="https://example.com/avatar.png"
        name="Jane"
      ></loquix-message-avatar>`,
    );
    const img = getShadowPart(el, 'image');
    expect(img).to.exist;
    expect(img!.getAttribute('src')).to.equal('https://example.com/avatar.png');
    expect(img!.getAttribute('alt')).to.equal('Jane');
  });

  it('renders initials when name is set without src', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar name="John Doe"></loquix-message-avatar>`,
    );
    const initials = getShadowPart(el, 'initials');
    expect(initials).to.exist;
    expect(initials!.textContent).to.equal('JD');
  });

  it('derives single initial from one-word name', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar name="Claude"></loquix-message-avatar>`,
    );
    const initials = getShadowPart(el, 'initials');
    expect(initials).to.exist;
    expect(initials!.textContent).to.equal('C');
  });

  it('reflects size and state attributes', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar size="lg" state="thinking"></loquix-message-avatar>`,
    );
    expect(el.size).to.equal('lg');
    expect(el.state).to.equal('thinking');
    expect(el.getAttribute('size')).to.equal('lg');
    expect(el.getAttribute('state')).to.equal('thinking');
  });

  it('derives initials "A" from single name "Alice"', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar name="Alice"></loquix-message-avatar>`,
    );
    const initials = getShadowPart(el, 'initials');
    expect(initials).to.exist;
    expect(initials!.textContent).to.equal('A');
  });

  it('renders fallback AI icon when name is empty string', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar name=""></loquix-message-avatar>`,
    );
    const container = getShadowPart(el, 'container');
    // Empty name should fall through to the default SVG icon
    expect(container!.querySelector('svg')).to.exist;
    expect(getShadowPart(el, 'initials')).to.not.exist;
  });

  it('renders img tag with correct src attribute', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar src="https://cdn.example.com/photo.jpg"></loquix-message-avatar>`,
    );
    const img = getShadowPart(el, 'image');
    expect(img).to.exist;
    expect(img!.tagName.toLowerCase()).to.equal('img');
    expect(img!.getAttribute('src')).to.equal('https://cdn.example.com/photo.jpg');
  });

  it('uses localized fallback alt text when src provided without name', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar src="https://example.com/bot.png"></loquix-message-avatar>`,
    );
    const img = getShadowPart(el, 'image');
    expect(img).to.exist;
    // Without name, alt should use the localized fallback
    const alt = img!.getAttribute('alt');
    expect(alt).to.be.a('string');
    expect(alt!.length).to.be.greaterThan(0);
  });

  it('reflects size="sm" as attribute', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar size="sm"></loquix-message-avatar>`,
    );
    expect(el.size).to.equal('sm');
    expect(el.getAttribute('size')).to.equal('sm');
  });

  it('reflects size="md" as attribute', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar size="md"></loquix-message-avatar>`,
    );
    expect(el.size).to.equal('md');
    expect(el.getAttribute('size')).to.equal('md');
  });

  it('reflects size="lg" as attribute', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar size="lg"></loquix-message-avatar>`,
    );
    expect(el.size).to.equal('lg');
    expect(el.getAttribute('size')).to.equal('lg');
  });

  it('reflects state="thinking" as attribute', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar state="thinking"></loquix-message-avatar>`,
    );
    expect(el.getAttribute('state')).to.equal('thinking');
  });

  it('reflects state="streaming" as attribute', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar state="streaming"></loquix-message-avatar>`,
    );
    expect(el.getAttribute('state')).to.equal('streaming');
  });

  it('sets named aria-label when name is provided', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar name="John Doe"></loquix-message-avatar>`,
    );
    const container = getShadowPart(el, 'container');
    const ariaLabel = container!.getAttribute('aria-label');
    expect(ariaLabel).to.contain('John Doe');
  });

  it('sets AI aria-label when no name is provided', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar></loquix-message-avatar>`,
    );
    const container = getShadowPart(el, 'container');
    expect(container!.getAttribute('aria-label')).to.equal('AI avatar');
  });

  it('reflects variant property to DOM', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar variant="image"></loquix-message-avatar>`,
    );
    expect(el.variant).to.equal('image');
    expect(el.getAttribute('variant')).to.equal('image');
  });

  it('has default variant of "icon"', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar></loquix-message-avatar>`,
    );
    expect(el.variant).to.equal('icon');
    expect(el.getAttribute('variant')).to.equal('icon');
  });

  it('CSS part "container" is queryable', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar></loquix-message-avatar>`,
    );
    const container = getShadowPart(el, 'container');
    expect(container).to.exist;
    expect(container!.getAttribute('role')).to.equal('img');
  });

  it('derives initials from multi-word name using first and last', async () => {
    const el = await fixture<LoquixMessageAvatar>(
      html`<loquix-message-avatar name="Mary Jane Watson"></loquix-message-avatar>`,
    );
    const initials = getShadowPart(el, 'initials');
    expect(initials).to.exist;
    expect(initials!.textContent).to.equal('MW');
  });
});
