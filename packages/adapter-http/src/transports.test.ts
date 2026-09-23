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

  it('rejects a parse hook at construction — text chunk boundaries follow TCP segmentation', () => {
    // Measured against a real server writing `TOK`, `EN:hi\n`, `TOKEN:there\n`:
    // a hook stripping a `TOKEN:` prefix saw three fragments and produced
    // "TOKEN:hi\nthere\n"; the identical body sent in one chunk produced
    // "hi\nthere\n". Correctness depends on network timing, not on anything
    // the caller or this library controls, so this is rejected outright
    // rather than merely documented — loosening the restriction later would
    // not be a breaking change, but changing established per-chunk semantics
    // to per-body semantics later would be.
    expect(() =>
      createHttpAgentProvider({
        url: '/api/chat',
        transport: 'text',
        parse: chunk => chunk,
      }),
    ).to.throw(/text.*parse|parse.*text/i);
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

  it('errors instead of a blank message on a 200 whose body is a bare JSON error object (sse only)', async () => {
    // A backend that reports failure with a 200 status is common, and the
    // default sse parser finds no `data:` line in a bare JSON object, so this
    // would otherwise close as a silent, content-free stream. This is an
    // sse-specific diagnosis — see the ndjson test right below, where the
    // identical body is well-formed JSON and is therefore NOT caught.
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
    expect((caught as HttpAgentError).code).to.equal('transport_mismatch');
  });

  it('does NOT catch a bare JSON error object under ndjson — an accepted, documented gap', async () => {
    // Under ndjson, `{"error":"rate limited"}` is well-formed JSON, so it is
    // *recognized* rather than flagged, and the stream closes blank instead of
    // erroring. Catching this would need a heuristic that treats any top-level
    // `error` field as a failure — already tried and reverted upstream because
    // it false-positived on legitimate responses with their own per-item
    // `error` field, so it is deliberately not reintroduced here.
    const { fetch } = fakeFetch(ndjsonBody({ error: 'rate limited' }));
    const provider = createHttpAgentProvider({ url: '/api/chat', transport: 'ndjson', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('');
  });

  it('names the real cause when a redirect, not the transport, produced the mismatch', async () => {
    // A 301 that turns the original POST into a GET, landing on an HTML login
    // page a framework happily serves as 200, looks identical to a transport
    // mismatch from the decoder's point of view — but the transport option was
    // never wrong.
    const { fetch } = fakeFetch(textBody('<html><body>Please log in</body></html>'), {
      headers: { 'content-type': 'text/html' },
      redirected: true,
      url: 'https://example.com/login',
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
    expect((caught as HttpAgentError).message).to.contain('redirected');
    expect((caught as HttpAgentError).message).to.contain('https://example.com/login');
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

describe('parse frame metadata', () => {
  it('passes the SSE event: name to the parse hook, alongside the payload', async () => {
    // Measured: `event: error\ndata: {"message":"overloaded"}` followed by
    // `event: message\ndata: {"text":"hello"}`, with a hook returning
    // `j.message ?? j.text`, yields ["overloaded","hello"] — a server error
    // rendered as assistant prose, indistinguishable from real content.
    // LangServe (and others) put the discriminator only in `event:`.
    const { fetch } = fakeFetch(
      textBody(
        'event: error\ndata: {"message":"overloaded"}\n\n',
        'event: message\ndata: {"text":"hello"}\n\n',
      ),
    );
    const seen: Array<string | undefined> = [];
    const provider = createHttpAgentProvider({
      url: '/api/chat',
      fetch,
      parse: (payload, frame) => {
        seen.push(frame?.event);
        if (frame?.event === 'error') return null;
        const parsed = JSON.parse(payload) as { text?: string };
        return parsed.text ?? null;
      },
    });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('hello');
    expect(seen).to.deep.equal(['error', 'message']);
  });

  it('leaves frame undefined for ndjson', async () => {
    const { fetch } = fakeFetch(ndjsonBody({ text: 'hi' }));
    let frameSeen: unknown = 'not called';
    const provider = createHttpAgentProvider({
      url: '/api/chat',
      transport: 'ndjson',
      fetch,
      parse: (payload, frame) => {
        frameSeen = frame;
        return (JSON.parse(payload) as { text: string }).text;
      },
    });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('hi');
    expect(frameSeen).to.equal(undefined);
  });

  it('never runs the hook on a [DONE] frame, even one a hook would otherwise see', async () => {
    let calls = 0;
    const { fetch } = fakeFetch(sseBody('first', '[DONE]'));
    const provider = createHttpAgentProvider({
      url: '/api/chat',
      fetch,
      parse: payload => {
        calls += 1;
        return payload;
      },
    });

    const response = await provider.send([userMessage('hi')], {});
    await readAll(response.stream);

    // "first" runs the hook once; [DONE] is intercepted before parse ever runs.
    expect(calls).to.equal(1);
  });
});

describe('[DONE] with trailing whitespace', () => {
  it('treats "[DONE] " (trailing space) as the sentinel, not as content', async () => {
    // Measured: `data: [DONE] ` with trailing whitespace neither stopped the
    // stream nor was suppressed — it leaked into the chat as content, and
    // whatever followed kept streaming.
    const { fetch } = fakeFetch(sseBody('hello', '[DONE] ', 'should not appear'));
    const provider = createHttpAgentProvider({ url: '/api/chat', fetch });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('hello');
  });
});

describe('non-string parse hook return', () => {
  it('coerces a non-string, non-null return value with String(...) rather than enqueuing it as-is', async () => {
    // Measured: `parse: () => 42` enqueues the number 42 as-is into a
    // ReadableStream<string>, which breaks any consumer that assumes string
    // chunks. We coerce rather than drop: the hook clearly meant to emit
    // something, so treating that as silently-dropped text would hide the bug
    // rather than surface it.
    const { fetch } = fakeFetch(sseBody('anything'));
    const provider = createHttpAgentProvider({
      url: '/api/chat',
      fetch,
      parse: (() => 42) as unknown as (chunk: string) => string | null,
    });

    const response = await provider.send([userMessage('hi')], {});

    expect(await readAll(response.stream)).to.equal('42');
  });
});
