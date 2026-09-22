import { expect } from '@open-wc/testing';
import { createHttpAgentProvider, HttpAgentError } from './index.js';
import { fakeFetch, sseBody, textBody, ndjsonBody, readAll, userMessage } from './test-helpers.js';

describe('sse transport', () => {
  it('concatenates data payloads', async () => {
    const { fetch } = fakeFetch(sseBody('Hel', 'lo', '[DONE]'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('Hello');
  });

  it('passes a JSON payload through raw, without parsing it', async () => {
    // The default SSE parser returns the `data:` payload verbatim — unlike
    // ndjson, it never tries to extract a `text`/`content`/`delta` field. A
    // backend that sends `data: {"text":"Hi"}` gets the literal JSON string
    // out the other end; it is up to the caller to supply a `parse` hook if
    // they want it decoded.
    const { fetch } = fakeFetch(sseBody('{"text":"Hi"}', '[DONE]'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('{"text":"Hi"}');
  });

  it('stops at [DONE] and ignores anything after it', async () => {
    const { fetch } = fakeFetch(sseBody('one', '[DONE]', 'two'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('one');
  });

  it('survives a payload split across two network chunks', async () => {
    const { fetch } = fakeFetch(
      new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode('data: par'));
          controller.enqueue(encoder.encode('tial\n\ndata: [DONE]\n\n'));
          controller.close();
        },
      }),
    );
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('partial');
  });

  it('joins several data lines in one frame', async () => {
    const { fetch } = fakeFetch(textBody('data: a\ndata: b\n\n'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('a\nb');
  });

  it('ignores event, id and comment lines', async () => {
    const { fetch } = fakeFetch(textBody(': keepalive\n\nevent: message\nid: 7\ndata: hi\n\n'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('hi');
  });

  it('accepts CRLF framing', async () => {
    const { fetch } = fakeFetch(textBody('data: a\r\n\r\ndata: [DONE]\r\n\r\n'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('a');
  });

  it('emits the last frame when the body ends without a separator', async () => {
    const { fetch } = fakeFetch(textBody('data: a\n\ndata: b'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('ab');
  });

  it('gives every response a distinct id', async () => {
    // Two sends through one provider, so the body has to be a factory: each call
    // needs its own stream.
    const { fetch } = fakeFetch(() => sseBody('[DONE]'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const first = await provider.send([userMessage('a')], {});
    const second = await provider.send([userMessage('b')], {});

    expect(first.id).to.be.a('string').and.not.equal(second.id);
  });
});

describe('ndjson transport', () => {
  it('takes the text field from each line', async () => {
    const { fetch } = fakeFetch(ndjsonBody({ text: 'one ' }, { text: 'two' }));
    const provider = createHttpAgentProvider({ url: '/api/chat', transport: 'ndjson', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('one two');
  });

  it('skips a line that carries no text', async () => {
    const { fetch } = fakeFetch(ndjsonBody({ text: 'kept' }, { usage: { tokens: 12 } }));
    const provider = createHttpAgentProvider({ url: '/api/chat', transport: 'ndjson', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('kept');
  });

  it('emits the last line when the body ends without a newline', async () => {
    const { fetch } = fakeFetch(textBody('{"text":"a"}\n{"text":"b"}'));
    const provider = createHttpAgentProvider({ url: '/api/chat', transport: 'ndjson', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('ab');
  });

  it('skips a malformed line rather than failing the stream', async () => {
    const { fetch } = fakeFetch(textBody('{"text":"good"}\nnot json\n{"text":"also good"}\n'));
    const provider = createHttpAgentProvider({ url: '/api/chat', transport: 'ndjson', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('goodalso good');
  });
});

describe('text transport', () => {
  it('passes the body through unchanged', async () => {
    const { fetch } = fakeFetch(textBody('raw ', 'text'));
    const provider = createHttpAgentProvider({ url: '/api/chat', transport: 'text', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('raw text');
  });

  it('does not treat [DONE] as a sentinel — it is ordinary content', async () => {
    // Unlike sse/ndjson, a caller choosing `text` asked for the bytes exactly
    // as sent. `[DONE]` must pass through like anything else and must not
    // terminate the stream early.
    const { fetch } = fakeFetch(textBody('before ', '[DONE]', ' after'));
    const provider = createHttpAgentProvider({ url: '/api/chat', transport: 'text', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('before [DONE] after');
  });

  it('runs each chunk through a parse hook when one is given', async () => {
    const { fetch } = fakeFetch(textBody('raw1', 'raw2'));
    const provider = createHttpAgentProvider({
      url: '/api/chat',
      transport: 'text',
      fetch,
      parse: chunk => chunk.toUpperCase(),
    });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('RAW1RAW2');
  });

  it('skips a chunk when the parse hook returns null', async () => {
    const { fetch } = fakeFetch(textBody('keep', 'DROP', 'keep2'));
    const provider = createHttpAgentProvider({
      url: '/api/chat',
      transport: 'text',
      fetch,
      parse: chunk => (chunk === 'DROP' ? null : chunk),
    });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('keepkeep2');
  });
});

describe('transport mismatch', () => {
  it('errors with the real response status, not a fabricated one', async () => {
    // A mismatch is a permanent client-side configuration mistake, not an
    // upstream failure — the response itself said 200. Fabricating a 5xx
    // would make `if (err.status >= 500) retry()` retry forever on something
    // a retry can never fix.
    const { fetch } = fakeFetch(textBody('plain text response, no SSE framing at all'), {
      status: 200,
      headers: { 'content-type': 'text/plain' },
    });
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    let caught: unknown;
    try {
      await readAll(response.stream);
    } catch (error) {
      caught = error;
    }

    expect(caught).to.be.instanceOf(HttpAgentError);
    expect((caught as HttpAgentError).status).to.equal(200);
    expect((caught as HttpAgentError).message).to.contain('200');
  });

  it('errors instead of a blank message when a text/plain body is read as sse', async () => {
    const { fetch } = fakeFetch(textBody('plain text response, no SSE framing at all'), {
      headers: { 'content-type': 'text/plain' },
    });
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    let caught: unknown;
    try {
      await readAll(response.stream);
    } catch (error) {
      caught = error;
    }

    expect(caught).to.be.instanceOf(HttpAgentError);
    expect((caught as HttpAgentError).message).to.contain('sse');
    expect((caught as HttpAgentError).message).to.contain('text/plain');
  });

  it('errors instead of a blank message when SSE frames are read as ndjson', async () => {
    const { fetch } = fakeFetch(sseBody('hello', '[DONE]'), {
      headers: { 'content-type': 'text/event-stream' },
    });
    const provider = createHttpAgentProvider({ url: '/api/chat', transport: 'ndjson', fetch });

    const response = await provider.send([userMessage('hi')], {});

    let caught: unknown;
    try {
      await readAll(response.stream);
    } catch (error) {
      caught = error;
    }

    expect(caught).to.be.instanceOf(HttpAgentError);
    expect((caught as HttpAgentError).message).to.contain('ndjson');
  });

  it('errors instead of a blank message on a 200 whose body is a bare JSON error object', async () => {
    // A backend that reports failure with a 200 status is common, and the
    // default sse parser finds no `data:` line in a bare JSON object, so this
    // would otherwise close as a silent, content-free stream.
    const { fetch } = fakeFetch(textBody('{"error":"rate limited"}'), {
      headers: { 'content-type': 'application/json' },
    });
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    let caught: unknown;
    try {
      await readAll(response.stream);
    } catch (error) {
      caught = error;
    }

    expect(caught).to.be.instanceOf(HttpAgentError);
  });

  it('does not error on a genuinely empty body', async () => {
    const { fetch } = fakeFetch(textBody());
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('');
  });

  it('does not error when a parse hook filters every chunk out', async () => {
    // Filtering out tool-call/metadata/heartbeat frames and keeping only
    // prose is a normal use of `parse`. A turn where the model only emitted
    // a tool call legitimately produces zero text, and that is the
    // consumer's own decision — not evidence the transport is misconfigured.
    const { fetch } = fakeFetch(sseBody('{"type":"tool_call"}'));
    const provider = createHttpAgentProvider({
      url: '/api/chat',
      fetch,
      parse: () => null,
    });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('');
  });

  it('does not error on a content-free [DONE] with no trailing separator', async () => {
    // A server that closes right after `data: [DONE]`, with no blank line
    // ever completing the frame and no content beforehand, must still close
    // cleanly: the sentinel proves the default sse framing matched, so this
    // is reached only through the end-of-stream flush path, not the mid-loop
    // frame-by-frame path that normally recognizes [DONE].
    const { fetch } = fakeFetch(textBody('data: [DONE]'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('');
  });

  // "Produced no chunk" is not itself evidence of a mismatch: these four are
  // all correctly-framed, default-parsed responses that legitimately carry no
  // text. Recognizing the frame shape (a `data:`/`event:`/`id:`/`retry:`/`:`
  // line for sse, valid JSON for ndjson) is what must keep them clean.

  it('does not error on an sse body of only keep-alive comment frames', async () => {
    const { fetch } = fakeFetch(textBody(': keepalive\n\n: keepalive\n\n'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('');
  });

  it('does not error on an ndjson body of only metadata objects', async () => {
    const { fetch } = fakeFetch(ndjsonBody({ type: 'tool_use' }, { type: 'ping' }));
    const provider = createHttpAgentProvider({ url: '/api/chat', transport: 'ndjson', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('');
  });

  it('does not error on an ndjson body of only { text: null }', async () => {
    const { fetch } = fakeFetch(ndjsonBody({ text: null }));
    const provider = createHttpAgentProvider({ url: '/api/chat', transport: 'ndjson', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('');
  });

  it('does not error on an ndjson body of only blank lines', async () => {
    const { fetch } = fakeFetch(textBody('\n\n\n'));
    const provider = createHttpAgentProvider({ url: '/api/chat', transport: 'ndjson', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('');
  });

  it('errors on an ndjson body of only malformed JSON — a fair diagnosis', async () => {
    // Unlike the four cases above, no line here is recognizable as JSON at
    // all, so this is genuinely evidence of a framing mismatch rather than a
    // turn that happened to carry no text.
    const { fetch } = fakeFetch(textBody('not json\nalso not json\n'), {
      headers: { 'content-type': 'application/x-ndjson' },
    });
    const provider = createHttpAgentProvider({ url: '/api/chat', transport: 'ndjson', fetch });

    const response = await provider.send([userMessage('hi')], {});

    let caught: unknown;
    try {
      await readAll(response.stream);
    } catch (error) {
      caught = error;
    }

    expect(caught).to.be.instanceOf(HttpAgentError);
    expect((caught as HttpAgentError).message).to.contain('ndjson');
  });
});
