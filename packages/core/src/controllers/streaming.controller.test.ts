import { expect } from '@open-wc/testing';
import type { ReactiveControllerHost } from 'lit';
import { StreamingController, sanitizeTimeoutMs } from './streaming.controller.js';

// Minimal mock host
function createMockHost(): ReactiveControllerHost {
  return {
    addController() {},
    removeController() {},
    requestUpdate() {},
    updateComplete: Promise.resolve(true),
  };
}

function createStream(chunks: string[]): ReadableStream<string> {
  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
        // Small delay to simulate async streaming
        await new Promise(r => setTimeout(r, 10));
      }
      controller.close();
    },
  });
}

describe('StreamingController', () => {
  it('initializes in idle state', () => {
    const host = createMockHost();
    const ctrl = new StreamingController(host);
    expect(ctrl.state).to.equal('idle');
    expect(ctrl.text).to.equal('');
    expect(ctrl.chunks).to.have.lengthOf(0);
  });

  it('streams chunks and accumulates text', async () => {
    const host = createMockHost();
    const receivedChunks: string[] = [];
    const ctrl = new StreamingController(host, {
      onChunk: chunk => {
        receivedChunks.push(chunk);
      },
    });

    const stream = createStream(['Hello', ' ', 'World']);
    await ctrl.connect(stream);

    expect(ctrl.state).to.equal('complete');
    expect(ctrl.text).to.equal('Hello World');
    expect(ctrl.chunks).to.deep.equal(['Hello', ' ', 'World']);
    expect(receivedChunks).to.deep.equal(['Hello', ' ', 'World']);
  });

  it('calls onComplete with full text', async () => {
    const host = createMockHost();
    let completedText = '';
    const ctrl = new StreamingController(host, {
      onComplete: text => {
        completedText = text;
      },
    });

    await ctrl.connect(createStream(['foo', 'bar']));
    expect(completedText).to.equal('foobar');
  });

  it('tracks state changes through lifecycle', async () => {
    const host = createMockHost();
    const states: string[] = [];
    const ctrl = new StreamingController(host, {
      onStateChange: state => {
        states.push(state);
      },
    });

    await ctrl.connect(createStream(['data']));
    expect(states).to.include('connecting');
    expect(states).to.include('streaming');
    expect(states).to.include('complete');
  });

  it('can pause and resume', async () => {
    const host = createMockHost();
    const receivedChunks: string[] = [];
    const ctrl = new StreamingController(host, {
      onChunk: chunk => {
        receivedChunks.push(chunk);
      },
    });

    // Create a stream we can control
    let enqueue: (value: string) => void;
    let close: () => void;
    const stream = new ReadableStream<string>({
      start(controller) {
        enqueue = (v: string) => controller.enqueue(v);
        close = () => controller.close();
      },
    });

    const connectPromise = ctrl.connect(stream);

    // Wait for streaming to start
    await new Promise(r => setTimeout(r, 20));

    // Send first chunk
    enqueue!('A');
    await new Promise(r => setTimeout(r, 20));
    expect(receivedChunks).to.include('A');

    // Pause
    ctrl.pause();
    expect(ctrl.state).to.equal('paused');

    // Chunks during pause are buffered
    enqueue!('B');
    await new Promise(r => setTimeout(r, 20));
    // B should not be in receivedChunks yet (it's buffered)
    expect(receivedChunks).to.not.include('B');

    // Resume flushes buffered chunks
    ctrl.resume();
    expect(ctrl.state).to.equal('streaming');
    expect(receivedChunks).to.include('B');

    close!();
    await connectPromise;
    expect(ctrl.text).to.equal('AB');
  });

  it('abort cancels the stream', async () => {
    const host = createMockHost();
    const ctrl = new StreamingController(host);

    let enqueue: (value: string) => void;
    const stream = new ReadableStream<string>({
      start(controller) {
        enqueue = (v: string) => controller.enqueue(v);
      },
    });

    const connectPromise = ctrl.connect(stream);
    await new Promise(r => setTimeout(r, 20));

    enqueue!('start');
    await new Promise(r => setTimeout(r, 20));

    ctrl.abort();
    expect(ctrl.state).to.equal('idle');

    // Wait for connect to finish (it will catch the cancellation)
    await connectPromise.catch(() => {});
  });

  it('reset clears chunks and state', async () => {
    const host = createMockHost();
    const ctrl = new StreamingController(host);

    await ctrl.connect(createStream(['some', 'data']));
    expect(ctrl.text).to.equal('somedata');

    ctrl.reset();
    expect(ctrl.state).to.equal('idle');
    expect(ctrl.text).to.equal('');
    expect(ctrl.chunks).to.have.lengthOf(0);
  });

  it('handles stream errors', async () => {
    const host = createMockHost();
    let errorMsg = '';
    const ctrl = new StreamingController(host, {
      onError: err => {
        errorMsg = err.message;
      },
    });

    const stream = new ReadableStream<string>({
      start(controller) {
        controller.error(new Error('network failure'));
      },
    });

    await ctrl.connect(stream);
    expect(ctrl.state).to.equal('error');
    expect(errorMsg).to.equal('network failure');
  });

  it('cleans up previous stream on new connect', async () => {
    const host = createMockHost();
    const ctrl = new StreamingController(host);

    await ctrl.connect(createStream(['first']));
    expect(ctrl.text).to.equal('first');

    await ctrl.connect(createStream(['second']));
    expect(ctrl.text).to.equal('second');
  });

  // === Codex-found fix tests ===

  it('flushes pending chunks when stream completes while paused (1.6)', async () => {
    const host = createMockHost();
    const receivedChunks: string[] = [];
    let completedText = '';
    const ctrl = new StreamingController(host, {
      onChunk: chunk => {
        receivedChunks.push(chunk);
      },
      onComplete: text => {
        completedText = text;
      },
    });

    let enqueue: (value: string) => void;
    let close: () => void;
    const stream = new ReadableStream<string>({
      start(controller) {
        enqueue = (v: string) => controller.enqueue(v);
        close = () => controller.close();
      },
    });

    const connectPromise = ctrl.connect(stream);
    await new Promise(r => setTimeout(r, 20));

    // Send first chunk normally
    enqueue!('A');
    await new Promise(r => setTimeout(r, 20));
    expect(receivedChunks).to.include('A');

    // Pause and send more chunks
    ctrl.pause();
    enqueue!('B');
    enqueue!('C');
    await new Promise(r => setTimeout(r, 20));

    // B and C should be buffered, not yet delivered
    expect(receivedChunks).to.not.include('B');
    expect(receivedChunks).to.not.include('C');

    // Close stream while still paused — pending chunks must be flushed
    close!();
    await connectPromise;

    expect(ctrl.state).to.equal('complete');
    expect(ctrl.text).to.equal('ABC');
    expect(completedText).to.equal('ABC');
    expect(receivedChunks).to.deep.equal(['A', 'B', 'C']);
  });

  it('generation counter prevents stale connect() from corrupting new stream (1.8)', async () => {
    const host = createMockHost();
    const errors: string[] = [];
    const completions: string[] = [];
    const ctrl = new StreamingController(host, {
      onError: err => {
        errors.push(err.message);
      },
      onComplete: text => {
        completions.push(text);
      },
    });

    // Start a slow stream
    let enqueueA: (value: string) => void;
    const streamA = new ReadableStream<string>({
      start(controller) {
        enqueueA = (v: string) => controller.enqueue(v);
      },
    });

    const connectA = ctrl.connect(streamA);
    await new Promise(r => setTimeout(r, 20));
    enqueueA!('from-A');
    await new Promise(r => setTimeout(r, 20));

    // Start a new stream while A is still running — this calls abort() internally
    const streamB = createStream(['from-B']);
    const connectB = ctrl.connect(streamB);

    // Let both settle
    await connectA.catch(() => {});
    await connectB;

    // Only stream B's data should be present
    expect(ctrl.text).to.equal('from-B');
    expect(ctrl.state).to.equal('complete');
    // The stale stream A should NOT have set error state
    expect(errors).to.have.lengthOf(0);
    expect(completions).to.deep.equal(['from-B']);
  });

  it('handles getReader() throwing on locked stream (1.10)', async () => {
    const host = createMockHost();
    let errorMsg = '';
    const ctrl = new StreamingController(host, {
      onError: err => {
        errorMsg = err.message;
      },
    });

    // Create a stream and lock it by getting a reader first
    const stream = new ReadableStream<string>({
      start(controller) {
        controller.enqueue('data');
        controller.close();
      },
    });
    stream.getReader(); // Lock the stream

    await ctrl.connect(stream);

    // getReader() on a locked stream throws — should be caught and reported
    expect(ctrl.state).to.equal('error');
    expect(errorMsg).to.not.be.empty;
  });

  // === streamIdleTimeout ===

  it('sanitizeTimeoutMs: undefined/NaN use the default; 0/negative/±Infinity disable', () => {
    expect(sanitizeTimeoutMs(undefined, 60_000)).to.equal(60_000);
    expect(sanitizeTimeoutMs(5_000, 60_000)).to.equal(5_000);
    expect(sanitizeTimeoutMs(0, 60_000)).to.equal(0);
    expect(sanitizeTimeoutMs(-1, 60_000)).to.equal(0);
    // NaN's likely cause is arithmetic on a missing config value, so it falls
    // back to the default rather than silently disabling the guard.
    expect(sanitizeTimeoutMs(NaN, 60_000)).to.equal(60_000);
    // Unlike NaN, ±Infinity is a deliberate "no timeout" and is honoured as
    // disabled (0) rather than folded into the default — this is what makes
    // `Infinity` the natural way to spell "no timeout" for these options,
    // unlike UploadController's `_sanitizeInt`, where Infinity is meaningless
    // for a concurrency/retry count and falls back to the default like NaN.
    expect(sanitizeTimeoutMs(Infinity, 60_000)).to.equal(0);
    expect(sanitizeTimeoutMs(-Infinity, 60_000)).to.equal(0);
  });

  it('sanitizeTimeoutMs clamps a finite value above the 32-bit signed int max instead of passing it through', () => {
    // setTimeout takes a 32-bit signed integer; a delay above 2_147_483_647
    // overflows and fires almost immediately (measured: 1ms for 2_147_483_648)
    // instead of after the huge delay the caller asked for — the opposite of
    // what "a very long timeout" is supposed to mean. Clamping to the 32-bit
    // max keeps it closest to the caller's intent; `±Infinity` remains the
    // explicit way to disable the timeout entirely.
    expect(sanitizeTimeoutMs(2_147_483_647, 60_000)).to.equal(2_147_483_647);
    expect(sanitizeTimeoutMs(2_147_483_648, 60_000)).to.equal(2_147_483_647);
  });

  it('aborts with a TimeoutError when no chunk arrives within idleTimeout', async () => {
    const host = createMockHost();
    let errorName = '';
    let errorMsg = '';
    const ctrl = new StreamingController(host, {
      onError: err => {
        errorName = err.name;
        errorMsg = err.message;
      },
    });

    // A stream that emits one chunk and then never closes or emits again.
    const stream = new ReadableStream<string>({
      start(controller) {
        controller.enqueue('hello');
        // ...then silence forever.
      },
    });

    await ctrl.connect(stream, { idleTimeout: 100 });

    expect(ctrl.state).to.equal('error');
    expect(errorName).to.equal('TimeoutError');
    expect(errorMsg).to.not.be.empty;
    expect(ctrl.text).to.equal('hello');
  });

  it('does not trip idleTimeout while chunks keep arriving', async () => {
    const host = createMockHost();
    let errored = false;
    const ctrl = new StreamingController(host, {
      onError: () => {
        errored = true;
      },
    });

    // 5 chunks, 40ms apart — each gap is well under idleTimeout (150ms), but
    // the total stream duration (~200ms) exceeds it.
    const stream = createStream(['a', 'b', 'c', 'd', 'e']);
    await ctrl.connect(stream, { idleTimeout: 150 });

    expect(errored).to.be.false;
    expect(ctrl.state).to.equal('complete');
    expect(ctrl.text).to.equal('abcde');
  });

  it('idleTimeout: 0 disables idle detection', async () => {
    const host = createMockHost();
    let errored = false;
    const ctrl = new StreamingController(host, {
      onError: () => {
        errored = true;
      },
    });

    let enqueue!: (v: string) => void;
    let close!: () => void;
    const stream = new ReadableStream<string>({
      start(controller) {
        enqueue = v => controller.enqueue(v);
        close = () => controller.close();
      },
    });

    const connectPromise = ctrl.connect(stream, { idleTimeout: 0 });
    await new Promise(r => setTimeout(r, 20));
    enqueue('first');

    // Silence well past what any small idleTimeout would tolerate.
    await new Promise(r => setTimeout(r, 300));
    expect(ctrl.state).to.equal('streaming');
    expect(errored).to.be.false;

    close();
    await connectPromise;
    expect(ctrl.state).to.equal('complete');
  });

  it('a paused stream does not trip idleTimeout', async () => {
    const host = createMockHost();
    let errored = false;
    const ctrl = new StreamingController(host, {
      onError: () => {
        errored = true;
      },
    });

    let enqueue!: (v: string) => void;
    let close!: () => void;
    const stream = new ReadableStream<string>({
      start(controller) {
        enqueue = v => controller.enqueue(v);
        close = () => controller.close();
      },
    });

    const connectPromise = ctrl.connect(stream, { idleTimeout: 120 });
    await new Promise(r => setTimeout(r, 20));
    enqueue('A');
    await new Promise(r => setTimeout(r, 20));

    ctrl.pause();
    expect(ctrl.state).to.equal('paused');

    // Silence for well longer than idleTimeout while paused — must not trip.
    await new Promise(r => setTimeout(r, 300));
    expect(ctrl.state).to.equal('paused');
    expect(errored).to.be.false;

    ctrl.resume();
    enqueue('B');
    close();
    await connectPromise;

    expect(ctrl.state).to.equal('complete');
    expect(ctrl.text).to.equal('AB');
    expect(errored).to.be.false;
  });

  // === connect()'s own default (bare `connect(stream)`, no options) ===

  it('connect() called with no options arms no idle timer at all — every pre-existing direct caller must see unchanged behavior', async () => {
    // `StreamingController` is a public export used directly by host
    // applications (per its own class doc). Before `streamIdleTimeout` was
    // added to `AgentController`, `connect()`'s only default was 60_000, so a
    // bare `connect(stream)` — every call that existed before that feature —
    // would silently start arming a 60s idle abort it never had. `connect()`
    // must default to disabled (0); only `AgentController` opts into the
    // 60s default, and does so explicitly at its own call site.
    const host = createMockHost();
    const ctrl = new StreamingController(host);

    const realSetTimeout = globalThis.setTimeout;
    let timeoutCallCount = 0;
    (globalThis as unknown as { setTimeout: typeof setTimeout }).setTimeout = ((
      handler: TimerHandler,
      timeout?: number,
      ...args: unknown[]
    ) => {
      timeoutCallCount++;
      return (realSetTimeout as (...a: unknown[]) => ReturnType<typeof setTimeout>)(
        handler,
        timeout,
        ...args,
      );
    }) as typeof setTimeout;

    let enqueue!: (v: string) => void;
    let close!: () => void;
    const stream = new ReadableStream<string>({
      start(controller) {
        enqueue = v => controller.enqueue(v);
        close = () => controller.close();
      },
    });

    try {
      // No second argument at all — the exact shape of every call that
      // existed before `streamIdleTimeout`/`idleTimeout` were introduced.
      const connectPromise = ctrl.connect(stream);
      await new Promise(r => realSetTimeout(r, 20));
      enqueue('a');
      await new Promise(r => realSetTimeout(r, 20));
      close();
      await connectPromise;
    } finally {
      globalThis.setTimeout = realSetTimeout;
    }

    expect(ctrl.state).to.equal('complete');
    expect(
      timeoutCallCount,
      'connect() with no options must never call setTimeout for an idle timer',
    ).to.equal(0);
  });
});
