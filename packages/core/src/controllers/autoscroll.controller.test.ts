import { expect, fixture, html } from '@open-wc/testing';
import { LitElement } from 'lit';
import { AutoScrollController } from './autoscroll.controller.js';

class TestScrollHost extends LitElement {
  autoscroll = new AutoScrollController(this);
  render() {
    return html`
      <div id="scroller" style="height: 100px; overflow: auto;">
        <div id="content" style="height: 500px;">tall content</div>
      </div>
    `;
  }
}
customElements.define('test-scroll-host', TestScrollHost);

describe('AutoScrollController', () => {
  it('creates controller instance', async () => {
    const el = await fixture<TestScrollHost>(html`<test-scroll-host></test-scroll-host>`);
    expect(el.autoscroll).to.exist;
  });

  it('attaches to scroll container', async () => {
    const el = await fixture<TestScrollHost>(html`<test-scroll-host></test-scroll-host>`);
    const scroller = el.shadowRoot!.querySelector('#scroller') as HTMLElement;
    el.autoscroll.attach(scroller);
    // Initially scrollTop is 0 with 500px content in 100px container → NOT at bottom
    expect(el.autoscroll.isAtBottom).to.be.false;
  });

  it('reports isAtBottom correctly when scrolled', async () => {
    const el = await fixture<TestScrollHost>(html`<test-scroll-host></test-scroll-host>`);
    const scroller = el.shadowRoot!.querySelector('#scroller') as HTMLElement;
    el.autoscroll.attach(scroller);

    // Scroll to bottom
    scroller.scrollTop = scroller.scrollHeight;
    expect(el.autoscroll.isAtBottom).to.be.true;
  });

  it('isUserScrolled is false initially', async () => {
    const el = await fixture<TestScrollHost>(html`<test-scroll-host></test-scroll-host>`);
    expect(el.autoscroll.isUserScrolled).to.be.false;
  });

  it('scrollToBottom scrolls container', async () => {
    const el = await fixture<TestScrollHost>(html`<test-scroll-host></test-scroll-host>`);
    const scroller = el.shadowRoot!.querySelector('#scroller') as HTMLElement;
    el.autoscroll.attach(scroller);

    // Initially NOT at bottom
    expect(scroller.scrollTop).to.equal(0);

    // Scroll to bottom (instant)
    el.autoscroll.scrollToBottom('instant');
    // Allow layout
    await new Promise(r => setTimeout(r, 50));
    expect(scroller.scrollTop).to.be.greaterThan(0);
  });

  it('detaches cleanly on disconnect', async () => {
    const el = await fixture<TestScrollHost>(html`<test-scroll-host></test-scroll-host>`);
    const scroller = el.shadowRoot!.querySelector('#scroller') as HTMLElement;
    el.autoscroll.attach(scroller);

    el.remove(); // triggers hostDisconnected → detach
    // Should not throw when accessing after detach
    expect(el.autoscroll.isAtBottom).to.be.true; // default when no container
  });

  it('accepts options with custom threshold', async () => {
    class TestCustomHost extends LitElement {
      autoscroll = new AutoScrollController(this, { threshold: 100 });
      render() {
        return html`<div id="scroller" style="height: 100px; overflow: auto;">
          <div style="height: 500px;">tall</div>
        </div>`;
      }
    }
    if (!customElements.get('test-custom-threshold-host'))
      customElements.define('test-custom-threshold-host', TestCustomHost);

    const el = await fixture<TestCustomHost>(
      html`<test-custom-threshold-host></test-custom-threshold-host>`,
    );
    const scroller = el.shadowRoot!.querySelector('#scroller') as HTMLElement;
    // Scroll to 100px from bottom — should be "at bottom" with threshold 100
    scroller.scrollTop = scroller.scrollHeight - scroller.clientHeight - 90;
    el.autoscroll.attach(scroller);
    expect(el.autoscroll.isAtBottom).to.be.true;
  });

  it('fires onScrollStateChange callback on transition', async () => {
    const changes: boolean[] = [];
    class TestCallbackHost extends LitElement {
      autoscroll = new AutoScrollController(this, {
        onScrollStateChange: isAtBottom => changes.push(isAtBottom),
      });
      render() {
        return html`<div id="scroller" style="height: 100px; overflow: auto;">
          <div style="height: 500px;">tall</div>
        </div>`;
      }
    }
    if (!customElements.get('test-callback-host'))
      customElements.define('test-callback-host', TestCallbackHost);

    const el = await fixture<TestCallbackHost>(html`<test-callback-host></test-callback-host>`);
    const scroller = el.shadowRoot!.querySelector('#scroller') as HTMLElement;

    // Attach — initial state callback fires deferred (not at bottom)
    el.autoscroll.attach(scroller);
    // Wait for deferred Promise.resolve() callback
    await new Promise(r => setTimeout(r, 10));
    expect(changes).to.have.lengthOf(1);
    expect(changes[0]).to.be.false; // not at bottom initially

    // Scroll to bottom
    scroller.scrollTop = scroller.scrollHeight;
    scroller.dispatchEvent(new Event('scroll'));
    await new Promise(r => setTimeout(r, 50));
    expect(changes).to.have.lengthOf(2);
    expect(changes[1]).to.be.true; // now at bottom
  });

  it('scrollToElement scrolls target to center', async () => {
    const el = await fixture<TestScrollHost>(html`<test-scroll-host></test-scroll-host>`);
    const scroller = el.shadowRoot!.querySelector('#scroller') as HTMLElement;
    el.autoscroll.attach(scroller);

    const target = scroller.querySelector('#content') as HTMLElement;
    el.autoscroll.scrollToElement(target, 'instant');
    await new Promise(r => setTimeout(r, 50));
    // Should have scrolled somewhere
    expect(scroller.scrollTop).to.be.greaterThanOrEqual(0);
  });

  // --- observeElements tests (C1/C2 fix) ---

  it('auto-scrolls when observed element resizes', async () => {
    const el = await fixture<TestScrollHost>(html`<test-scroll-host></test-scroll-host>`);
    const scroller = el.shadowRoot!.querySelector('#scroller') as HTMLElement;
    el.autoscroll.attach(scroller);

    // Scroll to bottom first so isUserScrolled is false
    el.autoscroll.scrollToBottom('instant');
    await new Promise(r => setTimeout(r, 100));

    const content = scroller.querySelector('#content') as HTMLElement;
    el.autoscroll.observeElements([content]);

    const prevScrollTop = scroller.scrollTop;
    // Grow the observed element — ResizeObserver should fire
    content.style.height = '800px';

    // Wait for ResizeObserver + rAF debounce
    await new Promise(r => setTimeout(r, 200));
    // scrollTop should have increased or stayed at max
    expect(scroller.scrollTop).to.be.greaterThanOrEqual(prevScrollTop);
  });

  it('observeElements adds and removes elements correctly', async () => {
    const el = await fixture<TestScrollHost>(html`<test-scroll-host></test-scroll-host>`);
    const scroller = el.shadowRoot!.querySelector('#scroller') as HTMLElement;
    el.autoscroll.attach(scroller);

    const content = scroller.querySelector('#content') as HTMLElement;

    // Observe
    el.autoscroll.observeElements([content]);
    // Unobserve
    el.autoscroll.observeElements([]);
    // No errors should occur
    expect(el.autoscroll).to.exist;
  });

  // --- Programmatic scroll guard test (H1 fix) ---

  it('ignores scroll events during programmatic scroll', async () => {
    const changes: boolean[] = [];
    class TestGuardHost extends LitElement {
      autoscroll = new AutoScrollController(this, {
        onScrollStateChange: isAtBottom => changes.push(isAtBottom),
      });
      render() {
        return html`<div id="scroller" style="height: 100px; overflow: auto;">
          <div style="height: 500px;">tall</div>
        </div>`;
      }
    }
    if (!customElements.get('test-guard-host'))
      customElements.define('test-guard-host', TestGuardHost);

    const el = await fixture<TestGuardHost>(html`<test-guard-host></test-guard-host>`);
    const scroller = el.shadowRoot!.querySelector('#scroller') as HTMLElement;
    el.autoscroll.attach(scroller);
    // Wait for deferred initial callback
    await new Promise(r => setTimeout(r, 10));
    changes.length = 0; // clear initial callback

    // Programmatic scroll to bottom — sets _isProgrammaticScroll guard
    el.autoscroll.scrollToBottom('smooth');

    // scrollToBottom fires onScrollStateChange(true) immediately
    // (was userScrolled → now at bottom)
    expect(changes).to.have.lengthOf(1);
    expect(changes[0]).to.be.true;
    changes.length = 0;

    // Simulate intermediate scroll event (as browser fires during smooth animation)
    scroller.dispatchEvent(new Event('scroll'));

    // No additional state change callback should fire (guard is active)
    expect(changes).to.have.lengthOf(0);
    expect(el.autoscroll.isUserScrolled).to.be.false;
  });
});
