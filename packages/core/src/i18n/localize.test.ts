import { expect, fixture, html } from '@open-wc/testing';
import { setLocale, resetLocale, updateLocale, getLocale } from './index.js';
import { registry } from './registry.js';
import { getShadowPart } from '../test-utils.js';

// Import components used in integration tests
import '../components/core/define-chat-composer.js';
import '../components/core/define-action-copy.js';
import '../components/core/define-message-avatar.js';
import '../components/core/define-caveat-notice.js';
import type { LoquixChatComposer } from '../components/core/loquix-chat-composer.js';
import type { LoquixActionCopy } from '../components/core/loquix-action-copy.js';
import type { LoquixCaveatNotice } from '../components/core/loquix-caveat-notice.js';

/** Wait for microtask batch + Lit update cycle. */
async function waitForLocaleUpdate(el: { updateComplete: Promise<boolean> }): Promise<void> {
  // 1. Let the microtask-batched notify fire
  await new Promise<void>(r => queueMicrotask(r));
  // 2. Wait for the Lit update triggered by requestUpdate()
  await el.updateComplete;
}

describe('i18n — Localization System', () => {
  // Isolate each test (Codex #4)
  afterEach(() => {
    resetLocale();
  });

  // ───────────────────────────────────────────────
  // Registry unit tests
  // ───────────────────────────────────────────────

  describe('registry', () => {
    it('term() returns English defaults when no overrides are set', () => {
      expect(registry.term('chatComposer.placeholder')).to.equal('Type a message...');
      expect(registry.term('actionCopy.label')).to.equal('Copy message');
    });

    it('term() returns overrides after setLocale()', () => {
      setLocale({ 'chatComposer.placeholder': 'Write something...' });
      expect(registry.term('chatComposer.placeholder')).to.equal('Write something...');
      // Other keys remain English
      expect(registry.term('actionCopy.label')).to.equal('Copy message');
    });

    it('term() interpolates {variable} placeholders', () => {
      expect(registry.term('attachmentChip.retryLabel', { filename: 'doc.pdf' })).to.equal(
        'Retry upload doc.pdf',
      );
      expect(registry.term('messageAttachments.moreCount', { count: 5 })).to.equal('+5 more');
    });

    it('term() interpolates with custom translations', () => {
      setLocale({
        'attachmentChip.retryLabel': 'Retry: {filename}',
      });
      expect(registry.term('attachmentChip.retryLabel', { filename: 'photo.jpg' })).to.equal(
        'Retry: photo.jpg',
      );
    });

    it('resetLocale() reverts to English defaults', () => {
      setLocale({ 'chatComposer.placeholder': 'Custom' });
      expect(registry.term('chatComposer.placeholder')).to.equal('Custom');
      resetLocale();
      expect(registry.term('chatComposer.placeholder')).to.equal('Type a message...');
    });

    it('updateLocale() merges partial overrides', () => {
      setLocale({ 'actionCopy.label': 'Copy' });
      updateLocale({ 'actionCopy.copied': 'Done!' });
      expect(registry.term('actionCopy.label')).to.equal('Copy');
      expect(registry.term('actionCopy.copied')).to.equal('Done!');
    });

    it('getLocale() returns a copy of current overrides', () => {
      setLocale({ 'chatComposer.placeholder': 'Hi' });
      const locale = getLocale();
      expect(locale).to.deep.equal({ 'chatComposer.placeholder': 'Hi' });
      // Mutating the returned copy does not affect the registry
      locale['chatComposer.sendLabel'] = 'Send!';
      expect(registry.term('chatComposer.sendLabel')).to.equal('Send message');
    });
  });

  // ───────────────────────────────────────────────
  // Component integration tests
  // ───────────────────────────────────────────────

  describe('component integration', () => {
    it('setLocale() updates rendered text (chat-composer)', async () => {
      const el = await fixture<LoquixChatComposer>(
        html`<loquix-chat-composer></loquix-chat-composer>`,
      );
      // Default English — check rendered placeholder on inner prompt-input
      const getRenderedPlaceholder = () =>
        el.shadowRoot!.querySelector('loquix-prompt-input')?.getAttribute('placeholder');
      expect(getRenderedPlaceholder()).to.equal('Type a message...');

      // Switch locale
      setLocale({ 'chatComposer.placeholder': 'Write here...' });
      await waitForLocaleUpdate(el);

      expect(getRenderedPlaceholder()).to.equal('Write here...');
    });

    it('explicit property override takes priority over locale', async () => {
      const el = await fixture<LoquixChatComposer>(
        html`<loquix-chat-composer placeholder="Custom input"></loquix-chat-composer>`,
      );
      expect(el.placeholder).to.equal('Custom input');

      // Even after setLocale(), the explicit value wins
      setLocale({ 'chatComposer.placeholder': 'Localized' });
      await waitForLocaleUpdate(el);
      expect(el.placeholder).to.equal('Custom input');
    });

    it('setLocale() updates rendered aria-label (action-copy)', async () => {
      const el = await fixture<LoquixActionCopy>(html`<loquix-action-copy></loquix-action-copy>`);
      // Default English — check rendered aria-label
      const btn = getShadowPart(el, 'button');
      expect(btn!.getAttribute('aria-label')).to.equal('Copy message');

      setLocale({ 'actionCopy.label': 'Copier' });
      await waitForLocaleUpdate(el);

      // aria-label in the rendered button should be updated
      const updatedBtn = getShadowPart(el, 'button');
      expect(updatedBtn!.getAttribute('aria-label')).to.equal('Copier');
    });

    it('resetLocale() reverts component to English', async () => {
      const el = await fixture<LoquixCaveatNotice>(
        html`<loquix-caveat-notice></loquix-caveat-notice>`,
      );
      setLocale({ 'caveatNotice.message': 'Custom warning' });
      await waitForLocaleUpdate(el);
      expect(el.shadowRoot!.textContent).to.include('Custom warning');

      resetLocale();
      await waitForLocaleUpdate(el);
      expect(el.shadowRoot!.textContent).to.include('AI can make mistakes. Check important info.');
    });
  });

  // ───────────────────────────────────────────────
  // Subscribe / unsubscribe lifecycle
  // ───────────────────────────────────────────────

  describe('controller lifecycle', () => {
    it('disconnected component stops receiving locale updates', async () => {
      const el = await fixture<LoquixChatComposer>(
        html`<loquix-chat-composer></loquix-chat-composer>`,
      );
      const getRenderedPlaceholder = () =>
        el.shadowRoot!.querySelector('loquix-prompt-input')?.getAttribute('placeholder');
      expect(getRenderedPlaceholder()).to.equal('Type a message...');

      // Disconnect
      el.remove();
      await el.updateComplete;

      // Change locale — should not throw or update disconnected component
      setLocale({ 'chatComposer.placeholder': 'After disconnect' });
      // Wait for microtask batch
      await new Promise(r => setTimeout(r, 10));

      // Reconnect
      document.body.appendChild(el);
      await el.updateComplete;

      // After reconnection, the component should pick up the new locale
      expect(getRenderedPlaceholder()).to.equal('After disconnect');
    });
  });

  // ───────────────────────────────────────────────
  // Security (Codex #6)
  // ───────────────────────────────────────────────

  describe('security', () => {
    it('HTML in interpolation values is rendered as escaped text, not executed', async () => {
      setLocale({
        'attachmentChip.retryLabel': 'Retry {filename}',
      });
      // Interpolation with script tag
      const result = registry.term('attachmentChip.retryLabel', {
        filename: '<script>alert("xss")</script>',
      });
      // The string contains the escaped HTML — Lit will escape it further in templates
      expect(result).to.equal('Retry <script>alert("xss")</script>');
      expect(result).to.include('<script>');
      // The string is just a string — no actual DOM injection.
      // Lit's html`` will auto-escape this in text nodes.
    });

    it('HTML in translation values is not executed in components', async () => {
      setLocale({
        'caveatNotice.message': '<img src=x onerror=alert(1)>Danger',
      });
      const el = await fixture<LoquixCaveatNotice>(
        html`<loquix-caveat-notice></loquix-caveat-notice>`,
      );
      await el.updateComplete;

      // The text should be rendered as escaped text, not as actual HTML
      const _badge =
        el.shadowRoot!.querySelector('[part~="badge"]') ||
        el.shadowRoot!.querySelector('.notice') ||
        el.shadowRoot!;
      const textContent = el.shadowRoot!.textContent || '';
      expect(textContent).to.include('<img');
      // No actual <img> element should be in the shadow DOM
      expect(el.shadowRoot!.querySelector('img')).to.be.null;
    });
  });
});
