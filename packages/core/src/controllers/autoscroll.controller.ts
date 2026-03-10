import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Options for AutoScrollController.
 */
export interface AutoScrollControllerOptions {
  /** Pixel threshold from bottom to consider "at bottom". Default 50. */
  threshold?: number;
  /** Called when scroll state transitions between at-bottom and away-from-bottom. */
  onScrollStateChange?: (isAtBottom: boolean) => void;
}

/**
 * AutoScrollController — automatically scrolls a container to the bottom
 * when observed elements resize (streaming text, images loading), unless
 * the user has scrolled up.
 *
 * Uses ResizeObserver on **individual elements** (set via `observeElements()`)
 * to detect content growth. The host component is responsible for calling
 * `scrollToBottom()` when new child elements appear (e.g. on `slotchange`).
 *
 * Used in: loquix-message-list
 */
export class AutoScrollController implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement;
  private _scrollContainer: HTMLElement | null = null;
  private _isUserScrolled = false;
  private _isProgrammaticScroll = false;
  private _resizeObserver: ResizeObserver | null = null;
  private _observedElements = new Set<Element>();
  private _rafId = 0;
  private _scrollGuardTimer = 0;
  private _options: AutoScrollControllerOptions;

  constructor(host: ReactiveControllerHost & HTMLElement, options?: AutoScrollControllerOptions) {
    this.host = host;
    this._options = options ?? {};
    host.addController(this);
  }

  private get _threshold(): number {
    return this._options.threshold ?? 50;
  }

  hostConnected(): void {
    // Will be set up after first render via attach()
  }

  hostDisconnected(): void {
    this.detach();
  }

  /**
   * Attach to a scrollable container element.
   * Call this in updated() or after shadow DOM is ready.
   */
  attach(container: HTMLElement): void {
    this.detach();
    this._scrollContainer = container;
    container.addEventListener('scroll', this._onScroll, { passive: true });

    // ResizeObserver — fires when observed elements resize (streaming text, images).
    // Elements to observe are set via observeElements().
    this._resizeObserver = new ResizeObserver(() => {
      if (!this._isUserScrolled) {
        cancelAnimationFrame(this._rafId);
        this._rafId = requestAnimationFrame(() => {
          this._scrollToBottomInternal('instant');
        });
      }
    });

    // Initialize state
    this._isUserScrolled = !this.isAtBottom;
    // Defer initial callback to avoid Lit "change-in-update" warning
    // when onScrollStateChange sets @state() properties during updated()
    Promise.resolve().then(() => {
      this._options.onScrollStateChange?.(!this._isUserScrolled);
    });
  }

  detach(): void {
    if (this._scrollContainer) {
      this._scrollContainer.removeEventListener('scroll', this._onScroll);
    }
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    this._observedElements.clear();
    cancelAnimationFrame(this._rafId);
    this._rafId = 0;
    clearTimeout(this._scrollGuardTimer);
    this._scrollGuardTimer = 0;
    this._isProgrammaticScroll = false;
    this._scrollContainer = null;
  }

  /** Check if the user is near the bottom */
  get isAtBottom(): boolean {
    if (!this._scrollContainer) return true;
    const { scrollTop, scrollHeight, clientHeight } = this._scrollContainer;
    return scrollHeight - scrollTop - clientHeight <= this._threshold;
  }

  /** Whether the user has scrolled away from bottom */
  get isUserScrolled(): boolean {
    return this._isUserScrolled;
  }

  /**
   * Observe elements for size changes (e.g. slotted message items).
   * When an observed element resizes (streaming text, images loading),
   * auto-scroll is triggered if the user hasn't scrolled away.
   *
   * Call this whenever the set of slotted elements changes (slotchange).
   */
  observeElements(elements: Element[]): void {
    if (!this._resizeObserver) return;
    const newSet = new Set(elements);

    // Unobserve removed elements
    for (const el of this._observedElements) {
      if (!newSet.has(el)) {
        this._resizeObserver.unobserve(el);
      }
    }
    // Observe new elements
    for (const el of newSet) {
      if (!this._observedElements.has(el)) {
        this._resizeObserver.observe(el);
      }
    }
    this._observedElements = newSet;
  }

  /** Programmatically scroll to bottom */
  scrollToBottom(behavior: ScrollBehavior = 'smooth'): void {
    this._scrollToBottomInternal(behavior);
  }

  /**
   * Scroll a specific element into view (centered in the scroll container).
   * Uses getBoundingClientRect + scrollTo to avoid cross-shadow-DOM scrolling issues.
   */
  scrollToElement(element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void {
    if (!this._scrollContainer) return;
    const containerRect = this._scrollContainer.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const offset = elementRect.top - containerRect.top + this._scrollContainer.scrollTop;
    const centerOffset = offset - this._scrollContainer.clientHeight / 2 + elementRect.height / 2;

    this._setProgrammaticGuard(behavior);
    this._scrollContainer.scrollTo({
      top: Math.max(0, centerOffset),
      behavior,
    });

    cancelAnimationFrame(this._rafId);
    this._rafId = requestAnimationFrame(() => {
      this._isUserScrolled = !this.isAtBottom;
    });
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  private _scrollToBottomInternal(behavior: ScrollBehavior): void {
    if (!this._scrollContainer) return;
    const wasUserScrolled = this._isUserScrolled;
    this._setProgrammaticGuard(behavior);
    this._scrollContainer.scrollTo({
      top: this._scrollContainer.scrollHeight,
      behavior,
    });
    this._isUserScrolled = false;
    // Notify state change immediately (guard suppresses _onScroll)
    if (wasUserScrolled) {
      this._options.onScrollStateChange?.(true);
    }
  }

  /**
   * Set a guard flag that suppresses user-scroll detection during programmatic scrolls.
   * `instant` completes immediately; `smooth` animates over ~300ms.
   */
  private _setProgrammaticGuard(behavior: ScrollBehavior): void {
    this._isProgrammaticScroll = true;
    clearTimeout(this._scrollGuardTimer);
    const delay = behavior === 'instant' ? 50 : 400;
    this._scrollGuardTimer = window.setTimeout(() => {
      this._isProgrammaticScroll = false;
    }, delay);
  }

  private _onScroll = (): void => {
    // Ignore scroll events fired during programmatic scrolls (smooth animation)
    if (this._isProgrammaticScroll) return;

    const wasUserScrolled = this._isUserScrolled;
    this._isUserScrolled = !this.isAtBottom;

    // Fire callback on state transitions
    if (wasUserScrolled !== this._isUserScrolled) {
      this._options.onScrollStateChange?.(!this._isUserScrolled);
    }
  };
}
