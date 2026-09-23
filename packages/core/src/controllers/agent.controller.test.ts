import { expect } from '@open-wc/testing';
import type { ReactiveControllerHost } from 'lit';
import { AgentController } from './agent.controller.js';
import type {
  AgentProvider,
  AgentMessage,
  AgentSendOptions,
  AgentResponse,
} from '../providers/agent-provider.js';

// === Test helpers ===

function createMockHost(): ReactiveControllerHost {
  return {
    addController() {},
    removeController() {},
    requestUpdate() {},
    updateComplete: Promise.resolve(true),
  };
}

function createStream(chunks: string[], delayMs = 10): ReadableStream<string> {
  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
        await new Promise(r => setTimeout(r, delayMs));
      }
      controller.close();
    },
  });
}

/**
 * Mock provider that returns a configurable stream.
 */
class MockProvider implements AgentProvider {
  readonly name = 'mock-agent';
  sendCalls: Array<{ messages: AgentMessage[]; options: AgentSendOptions }> = [];
  responseChunks: string[] = ['Hello', ' ', 'World'];
  responseDelay = 10;
  sendDelay = 0;
  sendError: Error | null = null;

  async send(messages: AgentMessage[], options: AgentSendOptions): Promise<AgentResponse> {
    this.sendCalls.push({ messages: [...messages], options });

    if (this.sendDelay > 0) {
      await new Promise(r => setTimeout(r, this.sendDelay));
    }

    // Check abort after delay
    if (options.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    if (this.sendError) {
      throw this.sendError;
    }

    return {
      id: `resp-${Date.now()}`,
      stream: createStream(this.responseChunks, this.responseDelay),
      metadata: { model: 'mock-model' },
    };
  }
}

function wait(ms = 100): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * A stream whose chunks are driven by the test rather than a fixed schedule —
 * used to simulate silence (for idle-timeout tests) or pause interaction.
 */
function createControllableStream(): {
  stream: ReadableStream<string>;
  enqueue: (value: string) => void;
  close: () => void;
} {
  let enqueue!: (value: string) => void;
  let close!: () => void;
  const stream = new ReadableStream<string>({
    start(controller) {
      enqueue = (v: string) => controller.enqueue(v);
      close = () => controller.close();
    },
  });
  return { stream, enqueue, close };
}

/**
 * Mock provider whose send() never resolves on its own — it only settles when
 * the composed abort signal fires, exactly like a real fetch-based provider
 * that forwards the signal it's given. Used to test `sendTimeout`, since
 * `MockProvider` only checks `signal.aborted` after its own fixed delay.
 */
class HangingProvider implements AgentProvider {
  readonly name = 'hanging-agent';

  async send(_messages: AgentMessage[], options: AgentSendOptions): Promise<AgentResponse> {
    return new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => {
        reject(options.signal!.reason ?? new DOMException('Aborted', 'AbortError'));
      });
    });
  }
}

// === Tests ===

describe('AgentController', () => {
  it('initializes in idle state with empty messages', () => {
    const host = createMockHost();
    const provider = new MockProvider();
    const ctrl = new AgentController(host, provider);

    expect(ctrl.state).to.equal('idle');
    expect(ctrl.messages).to.have.lengthOf(0);
    expect(ctrl.currentResponseText).to.equal('');
    expect(ctrl.isStreaming).to.be.false;
  });

  it('sends a message and streams a response', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    let completedMsg: AgentMessage | null = null;

    const ctrl = new AgentController(host, provider, {
      onResponseComplete: msg => {
        completedMsg = msg;
      },
    });

    await ctrl.send('Hello');

    // Wait for stream to finish
    await wait(200);

    expect(ctrl.state).to.equal('complete');
    expect(ctrl.messages).to.have.lengthOf(2); // user + assistant
    expect(ctrl.messages[0].role).to.equal('user');
    expect(ctrl.messages[0].content).to.equal('Hello');
    expect(ctrl.messages[1].role).to.equal('assistant');
    expect(ctrl.messages[1].content).to.equal('Hello World');
    expect(completedMsg).to.not.be.null;
    expect(completedMsg!.content).to.equal('Hello World');
  });

  it('tracks state changes through send lifecycle', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    const states: string[] = [];

    const ctrl = new AgentController(host, provider, {
      onStateChange: state => {
        states.push(state);
      },
    });

    await ctrl.send('test');
    await wait(200);

    expect(states).to.include('sending');
    expect(states).to.include('streaming');
    expect(states).to.include('complete');
  });

  it('reports chunks via callback', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    const chunks: string[] = [];

    const ctrl = new AgentController(host, provider, {
      onResponseChunk: chunk => {
        chunks.push(chunk);
      },
    });

    await ctrl.send('test');
    await wait(200);

    expect(chunks).to.deep.equal(['Hello', ' ', 'World']);
  });

  it('calls onResponseStart when stream begins', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    let startId = '';

    const ctrl = new AgentController(host, provider, {
      onResponseStart: id => {
        startId = id;
      },
    });

    await ctrl.send('test');
    await wait(50);

    expect(startId).to.not.equal('');
  });

  it('calls onMessagesChange for user and assistant messages', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    const messageLengths: number[] = [];

    const ctrl = new AgentController(host, provider, {
      onMessagesChange: msgs => {
        messageLengths.push(msgs.length);
      },
    });

    await ctrl.send('test');
    await wait(200);

    // Should be called at least twice: once for user message, once for assistant message
    expect(messageLengths).to.include(1); // user message added
    expect(messageLengths).to.include(2); // assistant message added
  });

  it('sends model and params to provider', async () => {
    const host = createMockHost();
    const provider = new MockProvider();

    const ctrl = new AgentController(host, provider, {
      model: 'gpt-4',
      params: { temperature: 0.7 },
      systemPrompt: 'You are helpful.',
    });

    await ctrl.send('test');
    await wait(200);

    expect(provider.sendCalls.length).to.equal(1);
    expect(provider.sendCalls[0].options.model).to.equal('gpt-4');
    expect(provider.sendCalls[0].options.params).to.deep.equal({ temperature: 0.7 });
    expect(provider.sendCalls[0].options.systemPrompt).to.equal('You are helpful.');
  });

  it('throws if send() called while streaming', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.responseDelay = 100;

    const ctrl = new AgentController(host, provider);
    ctrl.send('first');

    await wait(50); // Let it start streaming

    try {
      await ctrl.send('second');
      expect.fail('Should have thrown');
    } catch (e) {
      expect((e as Error).message).to.include('cannot send()');
    }
  });

  it('enforces maxMessageLength', async () => {
    const host = createMockHost();
    const provider = new MockProvider();

    const ctrl = new AgentController(host, provider, { maxMessageLength: 10 });

    try {
      await ctrl.send('This is a very long message that exceeds the limit');
      expect.fail('Should have thrown');
    } catch (e) {
      expect((e as Error).message).to.include('maxMessageLength');
    }
  });

  it('enforces maxMessages', async () => {
    const host = createMockHost();
    const provider = new MockProvider();

    const ctrl = new AgentController(host, provider, { maxMessages: 2 });

    // Pre-fill 2 messages
    ctrl.setMessages([
      { id: '1', role: 'user', content: 'hi' },
      { id: '2', role: 'assistant', content: 'hello' },
    ]);

    try {
      await ctrl.send('third message');
      expect.fail('Should have thrown');
    } catch (e) {
      expect((e as Error).message).to.include('maxMessages');
    }
  });

  it('enforces maxMessages accounting for user + assistant (off-by-one)', async () => {
    const host = createMockHost();
    const provider = new MockProvider();

    // maxMessages: 4, pre-fill 3 messages. A send() adds user+assistant = 2 more → total 5 > 4
    const ctrl = new AgentController(host, provider, { maxMessages: 4 });

    ctrl.setMessages([
      { id: '1', role: 'user', content: 'hi' },
      { id: '2', role: 'assistant', content: 'hello' },
      { id: '3', role: 'user', content: 'how are you' },
    ]);

    try {
      await ctrl.send('fourth message');
      expect.fail('Should have thrown');
    } catch (e) {
      expect((e as Error).message).to.include('maxMessages');
    }
  });

  it('handles provider.send() errors', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.sendError = new Error('Auth failed');

    let errorMsg = '';
    const ctrl = new AgentController(host, provider, {
      onError: err => {
        errorMsg = err.message;
      },
    });

    await ctrl.send('test');
    await wait(50);

    expect(ctrl.state).to.equal('error');
    expect(errorMsg).to.equal('Auth failed');
    // User message should still be in history
    expect(ctrl.messages).to.have.lengthOf(1);
    expect(ctrl.messages[0].role).to.equal('user');
  });

  it('abort during sending cancels the request', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.sendDelay = 200;

    const ctrl = new AgentController(host, provider);
    const sendPromise = ctrl.send('test');

    await wait(50);
    expect(ctrl.state).to.equal('sending');

    ctrl.abort();

    await sendPromise;
    expect(ctrl.state).to.equal('idle');
    // User message was added, but no assistant message
    expect(ctrl.messages).to.have.lengthOf(1);
  });

  it('abort during streaming cancels the stream', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.responseDelay = 100; // Slow chunks

    const ctrl = new AgentController(host, provider);
    ctrl.send('test');

    await wait(50); // Let streaming start

    ctrl.abort();
    await wait(50);

    expect(ctrl.state).to.equal('idle');
    // Only user message — partial assistant response discarded
    expect(ctrl.messages).to.have.lengthOf(1);
  });

  it('double abort is a no-op', async () => {
    const host = createMockHost();
    const provider = new MockProvider();

    const ctrl = new AgentController(host, provider);
    await ctrl.send('test');
    await wait(200);

    expect(ctrl.state).to.equal('complete');

    // Double abort after complete — should be no-op
    ctrl.abort();
    ctrl.abort();

    expect(ctrl.state).to.equal('complete');
  });

  it('abort after complete is a no-op', async () => {
    const host = createMockHost();
    const provider = new MockProvider();

    const ctrl = new AgentController(host, provider);
    await ctrl.send('test');
    await wait(200);

    expect(ctrl.state).to.equal('complete');

    ctrl.abort();
    expect(ctrl.state).to.equal('complete');
    expect(ctrl.messages).to.have.lengthOf(2);
  });

  it('pause and resume work during streaming', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.responseChunks = ['A', 'B', 'C', 'D'];
    provider.responseDelay = 50;

    const states: string[] = [];
    const ctrl = new AgentController(host, provider, {
      onStateChange: state => {
        states.push(state);
      },
    });

    ctrl.send('test');
    await wait(80);

    ctrl.pause();
    expect(ctrl.state).to.equal('paused');

    ctrl.resume();
    expect(ctrl.state).to.equal('streaming');

    await wait(500);
    expect(ctrl.state).to.equal('complete');

    expect(states).to.include('paused');
  });

  it('reset clears messages and returns to idle', async () => {
    const host = createMockHost();
    const provider = new MockProvider();

    const ctrl = new AgentController(host, provider);
    await ctrl.send('test');
    await wait(200);

    expect(ctrl.messages).to.have.lengthOf(2);

    ctrl.reset();

    expect(ctrl.state).to.equal('idle');
    expect(ctrl.messages).to.have.lengthOf(0);
    expect(ctrl.currentResponseText).to.equal('');
  });

  it('reset while streaming aborts and clears', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.responseDelay = 100;

    const ctrl = new AgentController(host, provider);
    ctrl.send('test');
    await wait(50);

    ctrl.reset();

    expect(ctrl.state).to.equal('idle');
    expect(ctrl.messages).to.have.lengthOf(0);
  });

  it('setMessages restores conversation', () => {
    const host = createMockHost();
    const provider = new MockProvider();

    const ctrl = new AgentController(host, provider);
    const msgs: AgentMessage[] = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi!' },
    ];

    ctrl.setMessages(msgs);

    expect(ctrl.messages).to.have.lengthOf(2);
    expect(ctrl.messages[0].content).to.equal('Hello');
    expect(ctrl.messages[1].content).to.equal('Hi!');
  });

  it('setMessages throws if streaming', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.responseDelay = 200;

    const ctrl = new AgentController(host, provider);
    ctrl.send('test');
    await wait(50);

    try {
      ctrl.setMessages([]);
      expect.fail('Should have thrown');
    } catch (e) {
      expect((e as Error).message).to.include('cannot setMessages()');
    }

    ctrl.abort();
  });

  it('setProvider aborts and swaps provider', async () => {
    const host = createMockHost();
    const provider1 = new MockProvider();
    provider1.responseDelay = 200;

    const ctrl = new AgentController(host, provider1);
    ctrl.send('test');
    await wait(50);

    const provider2 = new MockProvider();
    provider2.responseChunks = ['New', 'Response'];

    ctrl.setProvider(provider2);
    expect(ctrl.state).to.equal('idle');

    // Send with new provider
    await ctrl.send('new message');
    await wait(200);

    expect(provider2.sendCalls.length).to.be.greaterThan(0);
    expect(ctrl.messages[ctrl.messages.length - 1].content).to.equal('NewResponse');
  });

  it('updateOptions changes model/params for future sends', async () => {
    const host = createMockHost();
    const provider = new MockProvider();

    const ctrl = new AgentController(host, provider, { model: 'model-a' });

    await ctrl.send('first');
    await wait(200);

    expect(provider.sendCalls[0].options.model).to.equal('model-a');

    ctrl.updateOptions({ model: 'model-b' });

    await ctrl.send('second');
    await wait(200);

    expect(provider.sendCalls[1].options.model).to.equal('model-b');
  });

  it('hostDisconnected aborts active request', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.responseDelay = 200;

    const ctrl = new AgentController(host, provider);
    ctrl.send('test');
    await wait(50);

    ctrl.hostDisconnected();

    expect(ctrl.state).to.equal('idle');
  });

  it('sends full conversation history to provider', async () => {
    const host = createMockHost();
    const provider = new MockProvider();

    const ctrl = new AgentController(host, provider);

    await ctrl.send('Hello');
    await wait(200);

    await ctrl.send('How are you?');
    await wait(200);

    // Second send should include all previous messages
    expect(provider.sendCalls[1].messages).to.have.lengthOf(3);
    expect(provider.sendCalls[1].messages[0].content).to.equal('Hello');
    expect(provider.sendCalls[1].messages[1].content).to.equal('Hello World');
    expect(provider.sendCalls[1].messages[2].content).to.equal('How are you?');
  });

  it('handles stream errors', async () => {
    const host = createMockHost();
    const provider = new MockProvider();

    // Override to return an erroring stream
    provider.send = async () => {
      return {
        id: 'resp-err',
        stream: new ReadableStream({
          start(controller) {
            controller.error(new Error('stream broke'));
          },
        }),
      };
    };

    let errorMsg = '';
    const ctrl = new AgentController(host, provider, {
      onError: err => {
        errorMsg = err.message;
      },
    });

    await ctrl.send('test');
    await wait(100);

    expect(ctrl.state).to.equal('error');
    expect(errorMsg).to.equal('stream broke');
  });

  it('supports attachments on messages', async () => {
    const host = createMockHost();
    const provider = new MockProvider();

    const ctrl = new AgentController(host, provider);

    await ctrl.send('Check this file', [
      { url: 'https://cdn.example.com/doc.pdf', mimeType: 'application/pdf', filename: 'doc.pdf' },
    ]);
    await wait(200);

    expect(ctrl.messages[0].attachments).to.have.lengthOf(1);
    expect(ctrl.messages[0].attachments![0].url).to.equal('https://cdn.example.com/doc.pdf');

    // Provider should receive the attachments
    expect(provider.sendCalls[0].messages[0].attachments).to.have.lengthOf(1);
  });

  // === sendTimeout / streamIdleTimeout ===

  it('a slow stream that outlives sendTimeout still completes (sendTimeout only bounds provider.send())', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    // provider.send() resolves immediately, but the stream itself takes far
    // longer than sendTimeout to finish — it must not be cut off.
    provider.responseChunks = ['tok0', 'tok1', 'tok2', 'tok3', 'tok4', 'tok5', 'tok6', 'tok7'];
    provider.responseDelay = 150; // ~1.2s total stream duration

    let errorMsg: Error | null = null;
    const ctrl = new AgentController(host, provider, {
      sendTimeout: 100,
      onError: err => {
        errorMsg = err;
      },
    });

    await ctrl.send('test');
    await wait(1400);

    expect(ctrl.state).to.equal('complete');
    expect(errorMsg).to.be.null;
    expect(ctrl.messages).to.have.lengthOf(2);
    expect(ctrl.messages[1].content).to.equal('tok0tok1tok2tok3tok4tok5tok6tok7');
  });

  it('a provider that never returns a stream times out via sendTimeout', async () => {
    const host = createMockHost();
    const provider = new HangingProvider();

    let errorName = '';
    const ctrl = new AgentController(host, provider, {
      sendTimeout: 100,
      onError: err => {
        errorName = err.name;
      },
    });

    await ctrl.send('test');
    await wait(50);

    expect(ctrl.state).to.equal('error');
    expect(errorName).to.equal('TimeoutError');
    // Only the user message — no assistant response was ever produced
    expect(ctrl.messages).to.have.lengthOf(1);
  });

  it('sendTimeout: 0 disables the send timeout', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.sendDelay = 250; // longer than a typical timeout would allow

    let errorMsg: Error | null = null;
    const ctrl = new AgentController(host, provider, {
      sendTimeout: 0,
      onError: err => {
        errorMsg = err;
      },
    });

    const sendPromise = ctrl.send('test');
    await wait(150);
    // Would already be in "error" if any timeout had fired by now
    expect(ctrl.state).to.equal('sending');

    await sendPromise;
    await wait(200);

    expect(ctrl.state).to.equal('complete');
    expect(errorMsg).to.be.null;
  });

  it('pathological sendTimeout values (negative/NaN/Infinity) disable it instead of throwing', async () => {
    for (const badValue of [-1, NaN, Infinity, -Infinity]) {
      const host = createMockHost();
      const provider = new MockProvider();
      provider.responseDelay = 5;

      let threw = false;
      let errorMsg: Error | null = null;
      const ctrl = new AgentController(host, provider, {
        sendTimeout: badValue,
        onError: err => {
          errorMsg = err;
        },
      });

      try {
        await ctrl.send('test');
      } catch {
        threw = true;
      }
      await wait(100);

      expect(threw, `sendTimeout=${badValue} should not throw`).to.be.false;
      expect(errorMsg, `sendTimeout=${badValue} should not error`).to.be.null;
      expect(ctrl.state, `sendTimeout=${badValue} should complete normally`).to.equal('complete');
    }
  });

  it('a stream that goes silent trips streamIdleTimeout', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    const { stream, enqueue } = createControllableStream();
    provider.send = async () => ({ id: 'resp-idle', stream });

    let errorName = '';
    const ctrl = new AgentController(host, provider, {
      streamIdleTimeout: 150,
      onError: err => {
        errorName = err.name;
      },
    });

    await ctrl.send('test');
    await wait(30);
    enqueue('partial');
    // ...then silence, well past streamIdleTimeout, and the stream never closes
    await wait(400);

    expect(ctrl.state).to.equal('error');
    expect(errorName).to.equal('TimeoutError');
    expect(ctrl.currentResponseText).to.equal('partial');
    // The partial response is never appended to messages
    expect(ctrl.messages).to.have.lengthOf(1);
  });

  it('a stream that keeps emitting does not trip streamIdleTimeout', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.responseChunks = ['a', 'b', 'c', 'd', 'e', 'f'];
    provider.responseDelay = 80; // each gap is well under streamIdleTimeout

    let errorMsg: Error | null = null;
    const ctrl = new AgentController(host, provider, {
      streamIdleTimeout: 200,
      onError: err => {
        errorMsg = err;
      },
    });

    await ctrl.send('test');
    await wait(700); // total stream duration (~480ms) plus margin

    expect(ctrl.state).to.equal('complete');
    expect(errorMsg).to.be.null;
    expect(ctrl.messages[1].content).to.equal('abcdef');
  });

  it('streamIdleTimeout: 0 disables idle detection', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    const { stream, enqueue, close } = createControllableStream();
    provider.send = async () => ({ id: 'resp-idle-disabled', stream });

    let errorMsg: Error | null = null;
    const ctrl = new AgentController(host, provider, {
      streamIdleTimeout: 0,
      onError: err => {
        errorMsg = err;
      },
    });

    await ctrl.send('test');
    await wait(30);
    enqueue('first');

    // Silence for longer than any reasonable idle window — must not error
    await wait(400);
    expect(ctrl.state).to.equal('streaming');
    expect(errorMsg).to.be.null;

    enqueue('second');
    close();
    await wait(50);

    expect(ctrl.state).to.equal('complete');
    expect(ctrl.messages[1].content).to.equal('firstsecond');
  });

  it('pathological streamIdleTimeout values (negative/NaN) disable it instead of throwing', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    const { stream, enqueue, close } = createControllableStream();
    provider.send = async () => ({ id: 'resp-idle-bad', stream });

    let errorMsg: Error | null = null;
    const ctrl = new AgentController(host, provider, {
      streamIdleTimeout: -1,
      onError: err => {
        errorMsg = err;
      },
    });

    await ctrl.send('test');
    await wait(30);
    enqueue('a');
    await wait(400); // silence well past what any positive timeout would allow
    expect(ctrl.state).to.equal('streaming');

    close();
    await wait(50);

    expect(ctrl.state).to.equal('complete');
    expect(errorMsg).to.be.null;
  });

  it('a paused stream does not trip streamIdleTimeout', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    const { stream, enqueue, close } = createControllableStream();
    provider.send = async () => ({ id: 'resp-pause', stream });

    let errorMsg: Error | null = null;
    const ctrl = new AgentController(host, provider, {
      streamIdleTimeout: 150,
      onError: err => {
        errorMsg = err;
      },
    });

    await ctrl.send('test');
    await wait(30);
    enqueue('A');
    await wait(30);

    ctrl.pause();
    expect(ctrl.state).to.equal('paused');

    // Silence for well longer than streamIdleTimeout while paused — must not trip
    await wait(400);
    expect(ctrl.state).to.equal('paused');
    expect(errorMsg).to.be.null;

    ctrl.resume();
    expect(ctrl.state).to.equal('streaming');

    enqueue('B');
    close();
    await wait(50);

    expect(ctrl.state).to.equal('complete');
    expect(errorMsg).to.be.null;
    expect(ctrl.messages[1].content).to.equal('AB');
  });
});
