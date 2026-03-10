import { expect, fixture, html } from '@open-wc/testing';
import { LitElement } from 'lit';
import { ResizeController } from './resize.controller.js';

class TestResizeHost extends LitElement {
  resizer = new ResizeController(this, { minRows: 1, maxRows: 5 });
  render() {
    return html`<textarea
      id="ta"
      style="font-size: 16px; line-height: 20px; padding: 4px; border: 1px solid;"
    ></textarea>`;
  }
}
customElements.define('test-resize-host', TestResizeHost);

describe('ResizeController', () => {
  it('creates controller instance', async () => {
    const el = await fixture<TestResizeHost>(html`<test-resize-host></test-resize-host>`);
    expect(el.resizer).to.exist;
  });

  it('attaches to textarea and sets initial height', async () => {
    const el = await fixture<TestResizeHost>(html`<test-resize-host></test-resize-host>`);
    const ta = el.shadowRoot!.querySelector('#ta') as HTMLTextAreaElement;
    el.resizer.attach(ta);
    // After attach, resize() is called setting height
    expect(ta.style.height).to.not.be.empty;
  });

  it('resizes on input', async () => {
    const el = await fixture<TestResizeHost>(html`<test-resize-host></test-resize-host>`);
    const ta = el.shadowRoot!.querySelector('#ta') as HTMLTextAreaElement;
    el.resizer.attach(ta);

    const initialHeight = ta.style.height;
    // Add multiple lines of content
    ta.value = 'line1\nline2\nline3\nline4';
    ta.dispatchEvent(new Event('input'));
    // Height should have changed
    const newHeight = ta.style.height;
    // New height should be >= initial (more content)
    expect(parseFloat(newHeight)).to.be.greaterThanOrEqual(parseFloat(initialHeight));
  });

  it('manual resize() call works', async () => {
    const el = await fixture<TestResizeHost>(html`<test-resize-host></test-resize-host>`);
    const ta = el.shadowRoot!.querySelector('#ta') as HTMLTextAreaElement;
    el.resizer.attach(ta);
    ta.value = 'test';
    el.resizer.resize();
    expect(ta.style.height).to.not.be.empty;
  });

  it('detaches cleanly', async () => {
    const el = await fixture<TestResizeHost>(html`<test-resize-host></test-resize-host>`);
    const ta = el.shadowRoot!.querySelector('#ta') as HTMLTextAreaElement;
    el.resizer.attach(ta);
    el.resizer.detach();

    // After detach, input should not trigger resize
    const heightBefore = ta.style.height;
    ta.value = 'a\nb\nc\nd\ne';
    ta.dispatchEvent(new Event('input'));
    // Height should be unchanged after detach
    expect(ta.style.height).to.equal(heightBefore);
  });

  it('cleans up on host disconnect', async () => {
    const el = await fixture<TestResizeHost>(html`<test-resize-host></test-resize-host>`);
    const ta = el.shadowRoot!.querySelector('#ta') as HTMLTextAreaElement;
    el.resizer.attach(ta);
    el.remove(); // triggers hostDisconnected
    // Should not throw
    expect(() => el.resizer.resize()).to.not.throw();
  });
});
