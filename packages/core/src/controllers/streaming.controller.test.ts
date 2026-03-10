import { expect } from '@open-wc/testing';
import type { ReactiveControllerHost } from 'lit';
import { StreamingController } from './streaming.controller.js';

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
});
