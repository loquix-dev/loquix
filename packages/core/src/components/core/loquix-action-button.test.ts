import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart } from '../../test-utils.js';
import './define-action-button.js';
import type { LoquixActionButton } from './loquix-action-button.js';

describe('loquix-action-button', () => {
  it('renders with default properties', async () => {
    const el = await fixture<LoquixActionButton>(
      html`<loquix-action-button label="Copy"></loquix-action-button>`,
    );
    expect(el).to.exist;
    expect(el.shadowRoot).to.exist;
    const btn = getShadowPart(el, 'button');
    expect(btn).to.exist;
    expect(btn!.getAttribute('aria-label')).to.equal('Copy');
  });

  it('reflects label property', async () => {
    const el = await fixture<LoquixActionButton>(
      html`<loquix-action-button label="Retry"></loquix-action-button>`,
    );
    expect(el.label).to.equal('Retry');
  });

  it('dispatches custom event matching action property on click', async () => {
    const el = await fixture<LoquixActionButton>(
      html`<loquix-action-button label="Copy" action="loquix-copy"></loquix-action-button>`,
    );
    const btn = getShadowPart(el, 'button')!;
    const eventPromise = waitForEvent(el, 'loquix-copy');
    btn.click();
    const event = await eventPromise;
    expect(event).to.exist;
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
  });

  it('does not dispatch when disabled', async () => {
    const el = await fixture<LoquixActionButton>(
      html`<loquix-action-button
        label="Copy"
        action="loquix-copy"
        disabled
      ></loquix-action-button>`,
    );
    let fired = false;
    el.addEventListener('loquix-copy', () => {
      fired = true;
    });
    const btn = getShadowPart(el, 'button')!;
    btn.click();
    // Give a tick for any async dispatch
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('empty action property prevents event dispatch on click', async () => {
    const el = await fixture<LoquixActionButton>(
      html`<loquix-action-button label="Copy" action=""></loquix-action-button>`,
    );
    let fired = false;
    // Listen on the element for any custom event
    const handler = () => {
      fired = true;
    };
    el.addEventListener('loquix-copy', handler);
    el.addEventListener('', handler);
    const btn = getShadowPart(el, 'button')!;
    btn.click();
    await new Promise(r => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('disabled reflects as attribute on host AND on internal button', async () => {
    const el = await fixture<LoquixActionButton>(
      html`<loquix-action-button label="Copy" disabled></loquix-action-button>`,
    );
    // Host attribute
    expect(el.hasAttribute('disabled')).to.be.true;
    expect(el.disabled).to.be.true;
    // Internal button
    const btn = getShadowPart(el, 'button')! as HTMLButtonElement;
    expect(btn.disabled).to.be.true;
    expect(btn.hasAttribute('disabled')).to.be.true;
  });

  it('event has bubbles: true and composed: true', async () => {
    const el = await fixture<LoquixActionButton>(
      html`<loquix-action-button label="Retry" action="loquix-retry"></loquix-action-button>`,
    );
    const btn = getShadowPart(el, 'button')!;
    const eventPromise = waitForEvent(el, 'loquix-retry');
    btn.click();
    const event = await eventPromise;
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
  });

  it('slot content (SVG icon) renders inside button', async () => {
    const el = await fixture<LoquixActionButton>(
      html`<loquix-action-button label="Star">
        <svg data-testid="icon" viewBox="0 0 24 24">
          <path d="M12 2l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9z" />
        </svg>
      </loquix-action-button>`,
    );
    // Verify the slot element exists inside shadow DOM
    const slot = el.shadowRoot!.querySelector('slot');
    expect(slot).to.exist;
    // Verify the SVG was slotted
    const slotted = slot!.assignedElements();
    expect(slotted).to.have.lengthOf(1);
    expect(slotted[0].tagName.toLowerCase()).to.equal('svg');
  });

  it('label property sets aria-label on button', async () => {
    const el = await fixture<LoquixActionButton>(
      html`<loquix-action-button label="Delete"></loquix-action-button>`,
    );
    const btn = getShadowPart(el, 'button')!;
    expect(btn.getAttribute('aria-label')).to.equal('Delete');
  });

  it('custom action name dispatches correct event name', async () => {
    const el = await fixture<LoquixActionButton>(
      html`<loquix-action-button label="Share" action="loquix-share"></loquix-action-button>`,
    );
    const btn = getShadowPart(el, 'button')!;
    const eventPromise = waitForEvent(el, 'loquix-share');
    btn.click();
    const event = await eventPromise;
    expect(event).to.exist;
    expect(event.type).to.equal('loquix-share');
  });

  it('button part is queryable', async () => {
    const el = await fixture<LoquixActionButton>(
      html`<loquix-action-button label="Test"></loquix-action-button>`,
    );
    const btn = getShadowPart(el, 'button');
    expect(btn).to.exist;
    expect(btn!.tagName.toLowerCase()).to.equal('button');
  });
});
