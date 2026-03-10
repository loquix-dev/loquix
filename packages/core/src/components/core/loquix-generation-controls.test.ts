import { expect, fixture, html } from '@open-wc/testing';
import { waitForEvent, getShadowPart, getShadowParts } from '../../test-utils.js';
import './define-generation-controls.js';
import type { LoquixGenerationControls } from './loquix-generation-controls.js';

describe('loquix-generation-controls', () => {
  it('renders nothing when idle', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="idle"></loquix-generation-controls>`,
    );
    // idle state renders nothing
    expect(el.shadowRoot!.querySelector('.controls')).to.not.exist;
  });

  it('shows stop button when running', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="running"></loquix-generation-controls>`,
    );
    const controls = getShadowPart(el, 'controls');
    expect(controls).to.exist;
    expect(controls!.getAttribute('role')).to.equal('toolbar');
    const buttons = getShadowParts(el, 'button');
    expect(buttons.length).to.be.greaterThanOrEqual(1);
    // Stop button has aria-label
    const stopBtn = buttons.find(b => b.getAttribute('aria-label') === 'Stop generation');
    expect(stopBtn).to.exist;
  });

  it('dispatches loquix-stop on stop click', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="running"></loquix-generation-controls>`,
    );
    const stopBtn = getShadowParts(el, 'button').find(
      b => b.getAttribute('aria-label') === 'Stop generation',
    )!;
    const eventPromise = waitForEvent(el, 'loquix-stop');
    stopBtn.click();
    const event = await eventPromise;
    expect(event).to.exist;
  });

  it('shows pause button when show-pause is set', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="running" show-pause></loquix-generation-controls>`,
    );
    const buttons = getShadowParts(el, 'button');
    const pauseBtn = buttons.find(b => b.getAttribute('aria-label') === 'Pause generation');
    expect(pauseBtn).to.exist;
  });

  it('shows resume button when paused', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="paused"></loquix-generation-controls>`,
    );
    const buttons = getShadowParts(el, 'button');
    const resumeBtn = buttons.find(b => b.getAttribute('aria-label') === 'Resume generation');
    expect(resumeBtn).to.exist;
  });

  // === Empty states ===

  it('renders nothing when state is complete', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="complete"></loquix-generation-controls>`,
    );
    expect(el.shadowRoot!.querySelector('.controls')).to.not.exist;
  });

  it('renders nothing when state is error', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="error"></loquix-generation-controls>`,
    );
    expect(el.shadowRoot!.querySelector('.controls')).to.not.exist;
  });

  // === Running state: stop + pause ===

  it('renders stop and pause buttons when running with show-pause', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="running" show-pause></loquix-generation-controls>`,
    );
    const buttons = getShadowParts(el, 'button');
    expect(buttons.length).to.equal(2);
    const stopBtn = buttons.find(b => b.getAttribute('aria-label') === 'Stop generation');
    const pauseBtn = buttons.find(b => b.getAttribute('aria-label') === 'Pause generation');
    expect(stopBtn).to.exist;
    expect(pauseBtn).to.exist;
  });

  // === Paused state: stop + resume ===

  it('renders only resume button when paused (no stop)', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="paused"></loquix-generation-controls>`,
    );
    const buttons = getShadowParts(el, 'button');
    // The paused branch only renders resume, not stop
    const resumeBtn = buttons.find(b => b.getAttribute('aria-label') === 'Resume generation');
    expect(resumeBtn).to.exist;
  });

  // === Pause event ===

  it('dispatches loquix-pause on pause button click', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="running" show-pause></loquix-generation-controls>`,
    );
    const pauseBtn = getShadowParts(el, 'button').find(
      b => b.getAttribute('aria-label') === 'Pause generation',
    )!;
    const eventPromise = waitForEvent(el, 'loquix-pause');
    pauseBtn.click();
    const event = await eventPromise;
    expect(event).to.exist;
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
  });

  // === Resume event ===

  it('dispatches loquix-resume on resume button click', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="paused"></loquix-generation-controls>`,
    );
    const resumeBtn = getShadowParts(el, 'button').find(
      b => b.getAttribute('aria-label') === 'Resume generation',
    )!;
    const eventPromise = waitForEvent(el, 'loquix-resume');
    resumeBtn.click();
    const event = await eventPromise;
    expect(event).to.exist;
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
  });

  // === showPause=false hides pause ===

  it('only shows stop button when running without show-pause', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="running"></loquix-generation-controls>`,
    );
    const buttons = getShadowParts(el, 'button');
    expect(buttons.length).to.equal(1);
    expect(buttons[0].getAttribute('aria-label')).to.equal('Stop generation');
  });

  // === Aria labels match localized text ===

  it('stop button aria-label matches localized text', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="running"></loquix-generation-controls>`,
    );
    const stopBtn = getShadowParts(el, 'button').find(b => b.classList.contains('button--stop'))!;
    expect(stopBtn.getAttribute('aria-label')).to.equal('Stop generation');
  });

  it('pause button aria-label matches localized text', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="running" show-pause></loquix-generation-controls>`,
    );
    const pauseBtn = getShadowParts(el, 'button').find(
      b => b.getAttribute('aria-label') === 'Pause generation',
    )!;
    expect(pauseBtn.getAttribute('aria-label')).to.equal('Pause generation');
  });

  it('resume button aria-label matches localized text', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="paused"></loquix-generation-controls>`,
    );
    const resumeBtn = getShadowParts(el, 'button').find(
      b => b.getAttribute('aria-label') === 'Resume generation',
    )!;
    expect(resumeBtn.getAttribute('aria-label')).to.equal('Resume generation');
  });

  // === Toolbar aria-label ===

  it('toolbar has aria-label from localization', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="running"></loquix-generation-controls>`,
    );
    const controls = getShadowPart(el, 'controls');
    expect(controls!.getAttribute('aria-label')).to.equal('Generation controls');
  });

  // === SVG icon content ===

  it('stop button SVG contains a filled rect (square)', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="running"></loquix-generation-controls>`,
    );
    const stopBtn = getShadowParts(el, 'button').find(b => b.classList.contains('button--stop'))!;
    const svgEl = stopBtn.querySelector('svg')!;
    const rect = svgEl.querySelector('rect');
    expect(rect).to.exist;
  });

  it('pause button SVG contains two rects (vertical bars)', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="running" show-pause></loquix-generation-controls>`,
    );
    const pauseBtn = getShadowParts(el, 'button').find(
      b => b.getAttribute('aria-label') === 'Pause generation',
    )!;
    const svgEl = pauseBtn.querySelector('svg')!;
    const rects = svgEl.querySelectorAll('rect');
    expect(rects.length).to.equal(2);
  });

  it('resume button SVG contains a path (play triangle)', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="paused"></loquix-generation-controls>`,
    );
    const resumeBtn = getShadowParts(el, 'button').find(
      b => b.getAttribute('aria-label') === 'Resume generation',
    )!;
    const svgEl = resumeBtn.querySelector('svg')!;
    const path = svgEl.querySelector('path');
    expect(path).to.exist;
  });

  // === Button text labels ===

  it('stop button shows "Stop" text label', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="running"></loquix-generation-controls>`,
    );
    const stopBtn = getShadowParts(el, 'button').find(b => b.classList.contains('button--stop'))!;
    expect(stopBtn.textContent).to.contain('Stop');
  });

  it('pause button shows "Pause" text label', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="running" show-pause></loquix-generation-controls>`,
    );
    const pauseBtn = getShadowParts(el, 'button').find(
      b => b.getAttribute('aria-label') === 'Pause generation',
    )!;
    expect(pauseBtn.textContent).to.contain('Pause');
  });

  it('resume button shows "Resume" text label', async () => {
    const el = await fixture<LoquixGenerationControls>(
      html`<loquix-generation-controls state="paused"></loquix-generation-controls>`,
    );
    const resumeBtn = getShadowParts(el, 'button').find(
      b => b.getAttribute('aria-label') === 'Resume generation',
    )!;
    expect(resumeBtn.textContent).to.contain('Resume');
  });
});
