import { expect, fixture, html } from '@open-wc/testing';
import { setLocale, resetLocale } from '../../i18n/index.js';
import { getShadowPart, waitForEvent } from '../../test-utils.js';
import './define-tool-call.js';
import type { LoquixToolCall } from './loquix-tool-call.js';
import type { LoquixToolCallToggleDetail } from '../../events/index.js';

describe('loquix-tool-call', () => {
  afterEach(() => resetLocale());

  it('renders with default pending state, closed', async () => {
    const el = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="lookup"></loquix-tool-call>`,
    );
    expect(el.status).to.equal('pending');
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('false');
    expect(getShadowPart(el, 'body')!.hidden).to.be.true;
  });

  it('opens by default for running and error', async () => {
    const running = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="running"></loquix-tool-call>`,
    );
    expect(getShadowPart(running, 'header')!.getAttribute('aria-expanded')).to.equal('true');

    const errored = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="error"></loquix-tool-call>`,
    );
    expect(getShadowPart(errored, 'header')!.getAttribute('aria-expanded')).to.equal('true');
  });

  it('reflects status attribute', async () => {
    const el = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="success"></loquix-tool-call>`,
    );
    expect(el.getAttribute('status')).to.equal('success');
  });

  it('shows status label and pill class for each state', async () => {
    for (const [status, label] of [
      ['pending', 'Queued'],
      ['running', 'Running'],
      ['success', 'Done'],
      ['error', 'Failed'],
    ] as const) {
      const el = await fixture<LoquixToolCall>(
        html`<loquix-tool-call name="x" status=${status}></loquix-tool-call>`,
      );
      const pill = getShadowPart(el, 'status')!;
      expect(pill.classList.contains(`status--${status}`)).to.be.true;
      expect(pill.textContent?.trim()).to.contain(label);
    }
  });

  it('running status pill has role=status (live region)', async () => {
    const el = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="running"></loquix-tool-call>`,
    );
    expect(getShadowPart(el, 'status')!.getAttribute('role')).to.equal('status');
  });

  it('non-running status pills are not live regions', async () => {
    const el = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="success"></loquix-tool-call>`,
    );
    expect(getShadowPart(el, 'status')!.getAttribute('role')).to.be.null;
  });

  it('shows duration only for success', async () => {
    const success = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="success" duration="1240"></loquix-tool-call>`,
    );
    expect(success.shadowRoot!.querySelector('.duration')?.textContent).to.equal('1.2s');

    const running = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="running" duration="1240"></loquix-tool-call>`,
    );
    expect(running.shadowRoot!.querySelector('.duration')).to.be.null;
  });

  it('toggle fires loquix-tool-call-toggle with name + open + toolId', async () => {
    const el = await fixture<LoquixToolCall>(
      html`<loquix-tool-call
        name="web_search"
        status="success"
        tool-id="abc-1"
      ></loquix-tool-call>`,
    );
    const header = getShadowPart(el, 'header')! as HTMLButtonElement;
    const promise = waitForEvent<LoquixToolCallToggleDetail>(el, 'loquix-tool-call-toggle');
    header.click();
    const ev = await promise;
    expect(ev.detail.name).to.equal('web_search');
    expect(ev.detail.toolId).to.equal('abc-1');
    expect(ev.detail.open).to.be.true;
  });

  it('renders args as JSON in the args block when open', async () => {
    const el = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="running"></loquix-tool-call>`,
    );
    el.args = { query: 'hybrid retrieval', max_results: 5 };
    await el.updateComplete;
    const args = getShadowPart(el, 'args')!;
    expect(args.textContent).to.contain('"query"');
    expect(args.textContent).to.contain('"hybrid retrieval"');
    expect(args.textContent).to.contain('5');
  });

  it('args block hidden when args is undefined', async () => {
    const el = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="running"></loquix-tool-call>`,
    );
    expect(getShadowPart(el, 'args')).to.be.null;
  });

  it('arg-summary shows up to 2 keys + +N indicator', async () => {
    const el = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="success"></loquix-tool-call>`,
    );
    el.args = { a: 1, b: 2, c: 3, d: 4 };
    await el.updateComplete;
    const summary = getShadowPart(el, 'arg-summary')!;
    expect(summary.textContent).to.contain('a:');
    expect(summary.textContent).to.contain('b:');
    expect(summary.textContent).to.contain('+2');
    expect(summary.textContent).to.not.contain('c:');
  });

  it('arg-summary hidden when status is pending', async () => {
    const el = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="pending"></loquix-tool-call>`,
    );
    el.args = { a: 1 };
    await el.updateComplete;
    expect(getShadowPart(el, 'arg-summary')).to.be.null;
  });

  it('result block only shown when status=success and result is set', async () => {
    const success = await fixture<LoquixToolCall>(
      html`<loquix-tool-call
        name="x"
        status="success"
        default-open
        result="found 5"
      ></loquix-tool-call>`,
    );
    expect(getShadowPart(success, 'result')!.textContent).to.contain('found 5');

    const running = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="running" result="x"></loquix-tool-call>`,
    );
    expect(getShadowPart(running, 'result')).to.be.null;
  });

  it('error block only shown when status=error and error is set', async () => {
    const errored = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="error" error="boom"></loquix-tool-call>`,
    );
    expect(getShadowPart(errored, 'error')!.textContent).to.contain('boom');

    const success = await fixture<LoquixToolCall>(
      html`<loquix-tool-call
        name="x"
        status="success"
        default-open
        error="boom"
      ></loquix-tool-call>`,
    );
    expect(getShadowPart(success, 'error')).to.be.null;
  });

  it('args containing cyclic refs render as [unserializable]', async () => {
    const el = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="running"></loquix-tool-call>`,
    );
    type Cyclic = { name: string; self?: Cyclic };
    const cyclic: Cyclic = { name: 'a' };
    cyclic.self = cyclic;
    el.args = cyclic as unknown as Record<string, unknown>;
    await el.updateComplete;
    const args = getShadowPart(el, 'args')!;
    expect(args.textContent).to.contain('[unserializable]');
  });

  it('user-toggle wins: collapsing while running persists when status flips to success', async () => {
    const el = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="running"></loquix-tool-call>`,
    );
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('true');
    (getShadowPart(el, 'header')! as HTMLButtonElement).click();
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('false');

    el.status = 'success';
    await el.updateComplete;
    expect(getShadowPart(el, 'header')!.getAttribute('aria-expanded')).to.equal('false');
  });

  it('locale change updates status pill text', async () => {
    const el = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" status="running"></loquix-tool-call>`,
    );
    setLocale({ 'toolCall.statusRunning': 'En cours' });
    await new Promise(r => queueMicrotask(r));
    await el.updateComplete;
    expect(getShadowPart(el, 'status')!.textContent?.trim()).to.contain('En cours');
  });

  it('toolId attribute reflects between attribute and property', async () => {
    const el = await fixture<LoquixToolCall>(
      html`<loquix-tool-call name="x" tool-id="t-1"></loquix-tool-call>`,
    );
    expect(el.toolId).to.equal('t-1');
    expect(el.getAttribute('tool-id')).to.equal('t-1');
  });
});
