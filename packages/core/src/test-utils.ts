/**
 * Shared test utilities for Loquix component tests.
 */

/**
 * Returns a Promise that resolves with the next occurrence of a named event.
 * Automatically cleans up the listener.
 */
export function waitForEvent<T = unknown>(
  el: EventTarget,
  eventName: string,
  timeout = 2000,
): Promise<CustomEvent<T>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for event "${eventName}" after ${timeout}ms`));
    }, timeout);

    el.addEventListener(
      eventName,
      ((e: Event) => {
        clearTimeout(timer);
        resolve(e as CustomEvent<T>);
      }) as EventListener,
      { once: true },
    );
  });
}

/**
 * Queries an element by its `part` attribute inside a component's shadow root.
 */
export function getShadowPart(el: Element, partName: string): HTMLElement | null {
  return el.shadowRoot?.querySelector(`[part~="${partName}"]`) as HTMLElement | null;
}

/**
 * Queries all elements by their `part` attribute inside a component's shadow root.
 */
export function getShadowParts(el: Element, partName: string): HTMLElement[] {
  return Array.from(
    el.shadowRoot?.querySelectorAll(`[part~="${partName}"]`) ?? [],
  ) as HTMLElement[];
}

/**
 * Dispatches a keyboard event on the given element.
 */
export function simulateKeyboard(
  el: EventTarget,
  key: string,
  options: Partial<KeyboardEventInit> = {},
): void {
  el.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      composed: true,
      cancelable: true,
      ...options,
    }),
  );
}

/**
 * Returns the elements assigned to a named slot inside a component's shadow root.
 */
export function getSlotContent(el: Element, slotName: string): Element[] {
  const slot = el.shadowRoot?.querySelector(`slot[name="${slotName}"]`) as HTMLSlotElement | null;
  return slot?.assignedElements() ?? [];
}

/**
 * Waits for the next animation frame + microtask flush.
 */
export function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve)));
}
