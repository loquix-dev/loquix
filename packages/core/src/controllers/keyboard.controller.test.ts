import { expect, fixture, html } from '@open-wc/testing';
import { LitElement } from 'lit';
import { KeyboardController } from './keyboard.controller.js';

// Minimal host element for testing
class TestHost extends LitElement {
  keyboard = new KeyboardController(this);
  render() {
    return html`<div id="target" tabindex="0">target</div>`;
  }
}
customElements.define('test-keyboard-host', TestHost);

function sendKey(el: HTMLElement, key: string, mods: Partial<KeyboardEventInit> = {}): void {
  el.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      composed: true,
      cancelable: true,
      ...mods,
    }),
  );
}

describe('KeyboardController', () => {
  it('attaches to host on connected', async () => {
    const el = await fixture<TestHost>(html`<test-keyboard-host></test-keyboard-host>`);
    expect(el.keyboard).to.exist;
    // Controller should be listening on host
    let called = false;
    el.keyboard.addBinding({
      key: 'Enter',
      handler: () => {
        called = true;
      },
    });
    sendKey(el, 'Enter');
    expect(called).to.be.true;
  });

  it('matches key bindings with modifiers', async () => {
    const el = await fixture<TestHost>(html`<test-keyboard-host></test-keyboard-host>`);
    let result = '';
    el.keyboard.addBinding({
      key: 'Enter',
      ctrl: true,
      handler: () => {
        result = 'ctrl+enter';
      },
    });
    el.keyboard.addBinding({
      key: 'Enter',
      handler: () => {
        result = 'enter';
      },
    });

    // Plain Enter → matches second binding
    sendKey(el, 'Enter');
    expect(result).to.equal('enter');

    // Ctrl+Enter → matches first binding
    sendKey(el, 'Enter', { ctrlKey: true });
    expect(result).to.equal('ctrl+enter');
  });

  it('does not match when wrong modifiers are pressed', async () => {
    const el = await fixture<TestHost>(html`<test-keyboard-host></test-keyboard-host>`);
    let called = false;
    el.keyboard.addBinding({
      key: 'Enter',
      handler: () => {
        called = true;
      },
    });

    // Shift+Enter should NOT match plain Enter binding
    sendKey(el, 'Enter', { shiftKey: true });
    expect(called).to.be.false;
  });

  it('removes bindings by key', async () => {
    const el = await fixture<TestHost>(html`<test-keyboard-host></test-keyboard-host>`);
    let called = false;
    el.keyboard.addBinding({
      key: 'Escape',
      handler: () => {
        called = true;
      },
    });
    el.keyboard.removeBinding('Escape');
    sendKey(el, 'Escape');
    expect(called).to.be.false;
  });

  it('clears all bindings', async () => {
    const el = await fixture<TestHost>(html`<test-keyboard-host></test-keyboard-host>`);
    let count = 0;
    el.keyboard.addBinding({
      key: 'a',
      handler: () => {
        count++;
      },
    });
    el.keyboard.addBinding({
      key: 'b',
      handler: () => {
        count++;
      },
    });
    el.keyboard.clearBindings();
    sendKey(el, 'a');
    sendKey(el, 'b');
    expect(count).to.equal(0);
  });

  it('can attach to a different target', async () => {
    const el = await fixture<TestHost>(html`<test-keyboard-host></test-keyboard-host>`);
    const inner = el.shadowRoot!.querySelector('#target') as HTMLElement;
    el.keyboard.attach(inner);

    let fromInner = false;
    el.keyboard.addBinding({
      key: 'x',
      handler: () => {
        fromInner = true;
      },
    });

    // Dispatch on inner target → should fire
    sendKey(inner, 'x');
    expect(fromInner).to.be.true;
  });

  it('ignores composing events (IME)', async () => {
    const el = await fixture<TestHost>(html`<test-keyboard-host></test-keyboard-host>`);
    let called = false;
    el.keyboard.addBinding({
      key: 'Enter',
      handler: () => {
        called = true;
      },
    });

    el.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
        isComposing: true,
      }),
    );
    expect(called).to.be.false;
  });

  it('detaches on disconnect', async () => {
    const el = await fixture<TestHost>(html`<test-keyboard-host></test-keyboard-host>`);
    let called = false;
    el.keyboard.addBinding({
      key: 'q',
      handler: () => {
        called = true;
      },
    });

    el.remove(); // triggers hostDisconnected
    sendKey(el, 'q');
    expect(called).to.be.false;
  });
});
