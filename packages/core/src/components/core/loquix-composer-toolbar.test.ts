import { expect, fixture, html } from '@open-wc/testing';
import { getShadowPart, getSlotContent } from '../../test-utils.js';
import './define-composer-toolbar.js';
import type { LoquixComposerToolbar } from './loquix-composer-toolbar.js';

describe('loquix-composer-toolbar', () => {
  it('renders toolbar with left and right slots', async () => {
    const el = await fixture<LoquixComposerToolbar>(
      html`<loquix-composer-toolbar></loquix-composer-toolbar>`,
    );
    const toolbar = getShadowPart(el, 'toolbar');
    expect(toolbar).to.exist;
    const left = getShadowPart(el, 'left');
    expect(left).to.exist;
    const right = getShadowPart(el, 'right');
    expect(right).to.exist;
  });

  it('reflects border property', async () => {
    const el = await fixture<LoquixComposerToolbar>(
      html`<loquix-composer-toolbar border="top"></loquix-composer-toolbar>`,
    );
    expect(el.border).to.equal('top');
    expect(el.getAttribute('border')).to.equal('top');
  });

  it('defaults border to none', async () => {
    const el = await fixture<LoquixComposerToolbar>(
      html`<loquix-composer-toolbar></loquix-composer-toolbar>`,
    );
    expect(el.border).to.equal('none');
  });

  it('border="top" reflects attribute and applies styling via host selector', async () => {
    const el = await fixture<LoquixComposerToolbar>(
      html`<loquix-composer-toolbar border="top"></loquix-composer-toolbar>`,
    );
    expect(el.getAttribute('border')).to.equal('top');
    const toolbar = getShadowPart(el, 'toolbar')!;
    const computedStyle = getComputedStyle(toolbar);
    // The host([border='top']) .toolbar rule sets border-top
    expect(computedStyle.borderTopStyle).to.not.equal('none');
  });

  it('border="bottom" reflects attribute and applies bottom border styling', async () => {
    const el = await fixture<LoquixComposerToolbar>(
      html`<loquix-composer-toolbar border="bottom"></loquix-composer-toolbar>`,
    );
    expect(el.getAttribute('border')).to.equal('bottom');
    const toolbar = getShadowPart(el, 'toolbar')!;
    const computedStyle = getComputedStyle(toolbar);
    expect(computedStyle.borderBottomStyle).to.not.equal('none');
  });

  it('border="none" removes borders', async () => {
    const el = await fixture<LoquixComposerToolbar>(
      html`<loquix-composer-toolbar border="none"></loquix-composer-toolbar>`,
    );
    expect(el.getAttribute('border')).to.equal('none');
    const toolbar = getShadowPart(el, 'toolbar')!;
    const computedStyle = getComputedStyle(toolbar);
    expect(computedStyle.borderTopStyle).to.equal('none');
    expect(computedStyle.borderBottomStyle).to.equal('none');
  });

  it('default border value is "none"', async () => {
    const el = await fixture<LoquixComposerToolbar>(
      html`<loquix-composer-toolbar></loquix-composer-toolbar>`,
    );
    expect(el.border).to.equal('none');
    expect(el.getAttribute('border')).to.equal('none');
  });

  it('"actions-left" slot renders content', async () => {
    const el = await fixture<LoquixComposerToolbar>(
      html`<loquix-composer-toolbar>
        <span slot="actions-left" data-testid="left-item">Left Content</span>
      </loquix-composer-toolbar>`,
    );
    const slotted = getSlotContent(el, 'actions-left');
    expect(slotted).to.have.lengthOf(1);
    expect(slotted[0].textContent).to.equal('Left Content');
  });

  it('"actions-right" slot renders content', async () => {
    const el = await fixture<LoquixComposerToolbar>(
      html`<loquix-composer-toolbar>
        <span slot="actions-right" data-testid="right-item">Right Content</span>
      </loquix-composer-toolbar>`,
    );
    const slotted = getSlotContent(el, 'actions-right');
    expect(slotted).to.have.lengthOf(1);
    expect(slotted[0].textContent).to.equal('Right Content');
  });

  it('both slots can be populated simultaneously', async () => {
    const el = await fixture<LoquixComposerToolbar>(
      html`<loquix-composer-toolbar>
        <span slot="actions-left">Left</span>
        <span slot="actions-right">Right</span>
      </loquix-composer-toolbar>`,
    );
    const leftSlotted = getSlotContent(el, 'actions-left');
    const rightSlotted = getSlotContent(el, 'actions-right');
    expect(leftSlotted).to.have.lengthOf(1);
    expect(rightSlotted).to.have.lengthOf(1);
    expect(leftSlotted[0].textContent).to.equal('Left');
    expect(rightSlotted[0].textContent).to.equal('Right');
  });

  it('CSS parts "toolbar", "left", "right" are queryable', async () => {
    const el = await fixture<LoquixComposerToolbar>(
      html`<loquix-composer-toolbar></loquix-composer-toolbar>`,
    );
    const toolbar = getShadowPart(el, 'toolbar');
    expect(toolbar).to.exist;
    expect(toolbar!.tagName.toLowerCase()).to.equal('div');

    const left = getShadowPart(el, 'left');
    expect(left).to.exist;
    expect(left!.tagName.toLowerCase()).to.equal('div');

    const right = getShadowPart(el, 'right');
    expect(right).to.exist;
    expect(right!.tagName.toLowerCase()).to.equal('div');
  });

  it('border can be changed dynamically', async () => {
    const el = await fixture<LoquixComposerToolbar>(
      html`<loquix-composer-toolbar border="none"></loquix-composer-toolbar>`,
    );
    expect(el.getAttribute('border')).to.equal('none');

    el.border = 'top';
    await el.updateComplete;
    expect(el.getAttribute('border')).to.equal('top');

    el.border = 'bottom';
    await el.updateComplete;
    expect(el.getAttribute('border')).to.equal('bottom');
  });
});
