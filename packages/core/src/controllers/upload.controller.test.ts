import { expect } from '@open-wc/testing';
import type { ReactiveControllerHost } from 'lit';
import { UploadController } from './upload.controller.js';
import type { UploadProvider, UploadResult, UploadOptions } from '../providers/upload-provider.js';
import type { Attachment } from '../types/index.js';

// === Test helpers ===

function createMockHost(): ReactiveControllerHost {
  return {
    addController() {},
    removeController() {},
    requestUpdate() {},
    updateComplete: Promise.resolve(true),
  };
}

function createAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    id: `att-${Math.random().toString(36).slice(2, 8)}`,
    filename: 'test.png',
    filetype: 'image/png',
    size: 1024,
    status: 'pending',
    file: new File(['test-data'], 'test.png', { type: 'image/png' }),
    ...overrides,
  };
}

/**
 * Mock provider that resolves after a configurable delay.
 * Allows controlling behavior per-upload for testing.
 */
class MockProvider implements UploadProvider {
  readonly name = 'mock';
  uploadCalls: Array<{ file: File; options: UploadOptions }> = [];
  uploadDelay = 10;
  uploadError: Error | null = null;
  uploadResult: Partial<UploadResult> = {};
  validateFn: ((file: File) => string | undefined) | null = null;

  async upload(file: File, options: UploadOptions): Promise<UploadResult> {
    this.uploadCalls.push({ file, options });

    // Report progress in steps
    options.onProgress?.(0);

    await new Promise(r => setTimeout(r, this.uploadDelay));

    // Check abort
    if (options.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    if (this.uploadError) {
      throw this.uploadError;
    }

    options.onProgress?.(100);

    return {
      url: 'https://cdn.example.com/test.png',
      assetId: 'asset-123',
      ...this.uploadResult,
    };
  }

  validate(file: File): string | undefined {
    return this.validateFn?.(file);
  }
}

/** Wait for all pending microtasks and timers */
function wait(ms = 50): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// === Tests ===

describe('UploadController', () => {
  it('initializes in idle state', () => {
    const host = createMockHost();
    const provider = new MockProvider();
    const ctrl = new UploadController(host, provider);

    expect(ctrl.state).to.equal('idle');
    expect(ctrl.activeCount).to.equal(0);
    expect(ctrl.queuedCount).to.equal(0);
    expect(ctrl.results.size).to.equal(0);
  });

  it('uploads a single file successfully', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    let completed: { attachment: Attachment; result: UploadResult } | null = null;

    const ctrl = new UploadController(host, provider, {
      onUploadComplete: (att, res) => {
        completed = { attachment: att, result: res };
      },
    });

    const att = createAttachment();
    ctrl.add([att]);

    await wait(100);

    expect(ctrl.state).to.equal('complete');
    expect(completed).to.not.be.null;
    expect(completed!.result.url).to.equal('https://cdn.example.com/test.png');
    expect(ctrl.results.size).to.equal(1);
    expect(ctrl.results.get(att.id)?.url).to.equal('https://cdn.example.com/test.png');
  });

  it('reports progress during upload', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    const progressValues: number[] = [];

    const ctrl = new UploadController(host, provider, {
      onAttachmentUpdate: att => {
        if (att.progress !== undefined) {
          progressValues.push(att.progress);
        }
      },
    });

    ctrl.add([createAttachment()]);
    await wait(100);

    expect(progressValues).to.include(0);
    expect(progressValues).to.include(100);
  });

  it('tracks state changes through lifecycle', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    const states: string[] = [];

    const ctrl = new UploadController(host, provider, {
      onStateChange: state => {
        states.push(state);
      },
    });

    ctrl.add([createAttachment()]);
    await wait(100);

    expect(states).to.include('uploading');
    expect(states).to.include('complete');
  });

  it('validates files before queueing', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.validateFn = file => (file.size > 500 ? 'Too large' : undefined);

    let errorAttachment: Attachment | null = null;
    const ctrl = new UploadController(host, provider, {
      onUploadError: att => {
        errorAttachment = att;
      },
    });

    const largeFile = new File(['x'.repeat(1000)], 'big.png', { type: 'image/png' });
    const att = createAttachment({ file: largeFile, size: 1000 });
    ctrl.add([att]);

    // Validation is synchronous — error should be immediate
    expect(errorAttachment).to.not.be.null;
    expect(errorAttachment!.status).to.equal('error');
    expect(errorAttachment!.error).to.equal('Too large');

    // Should not have called upload
    expect(provider.uploadCalls.length).to.equal(0);
  });

  it('handles files without a File object', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    let errorAttachment: Attachment | null = null;

    const ctrl = new UploadController(host, provider, {
      onUploadError: att => {
        errorAttachment = att;
      },
    });

    const att = createAttachment({ file: undefined });
    ctrl.add([att]);

    expect(errorAttachment).to.not.be.null;
    expect(errorAttachment!.error).to.equal('No file provided');
  });

  it('respects concurrency limit', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.uploadDelay = 100;

    const ctrl = new UploadController(host, provider, { concurrency: 2 });

    ctrl.add([createAttachment(), createAttachment(), createAttachment()]);

    // Small wait for async start
    await wait(20);

    // Only 2 should be active, 1 queued
    expect(ctrl.activeCount).to.equal(2);
    expect(ctrl.queuedCount).to.equal(1);

    // Wait for all to complete
    await wait(300);
    expect(ctrl.state).to.equal('complete');
    expect(ctrl.results.size).to.equal(3);
  });

  it('retries failed uploads', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    let callCount = 0;
    const originalUpload = provider.upload.bind(provider);

    provider.upload = async (file: File, options: UploadOptions) => {
      callCount++;
      if (callCount <= 2) {
        throw new Error('Transient error');
      }
      return originalUpload(file, options);
    };

    const ctrl = new UploadController(host, provider, {
      maxRetries: 2,
      retryDelay: 50,
    });

    ctrl.add([createAttachment()]);
    await wait(500);

    expect(callCount).to.equal(3); // 1 initial + 2 retries
    expect(ctrl.state).to.equal('complete');
  });

  it('reports error after all retries exhausted', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.uploadError = new Error('Permanent failure');

    let errorMsg = '';
    const ctrl = new UploadController(host, provider, {
      maxRetries: 1,
      retryDelay: 20,
      onUploadError: (_, err) => {
        errorMsg = err.message;
      },
    });

    ctrl.add([createAttachment()]);
    await wait(300);

    expect(errorMsg).to.equal('Permanent failure');
    expect(ctrl.state).to.equal('error');
  });

  it('cancels a specific upload', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.uploadDelay = 200;

    const ctrl = new UploadController(host, provider);

    const att1 = createAttachment();
    const att2 = createAttachment();
    ctrl.add([att1, att2]);

    await wait(20);

    // Cancel first upload
    ctrl.cancel(att1.id);

    await wait(300);

    // Second should still complete
    expect(ctrl.results.has(att2.id)).to.be.true;
  });

  it('abortAll cancels everything', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.uploadDelay = 200;

    const ctrl = new UploadController(host, provider, { concurrency: 1 });

    ctrl.add([createAttachment(), createAttachment()]);
    await wait(20);

    ctrl.abortAll();

    expect(ctrl.activeCount).to.equal(0);
    expect(ctrl.queuedCount).to.equal(0);
  });

  it('reset clears everything and returns to idle', async () => {
    const host = createMockHost();
    const provider = new MockProvider();

    const ctrl = new UploadController(host, provider);
    ctrl.add([createAttachment()]);
    await wait(100);

    expect(ctrl.results.size).to.equal(1);

    ctrl.reset();

    expect(ctrl.state).to.equal('idle');
    expect(ctrl.results.size).to.equal(0);
    expect(ctrl.activeCount).to.equal(0);
    expect(ctrl.queuedCount).to.equal(0);
  });

  it('setProvider aborts active uploads and swaps provider', async () => {
    const host = createMockHost();
    const provider1 = new MockProvider();
    provider1.uploadDelay = 200;

    const ctrl = new UploadController(host, provider1);
    ctrl.add([createAttachment()]);
    await wait(20);

    expect(ctrl.activeCount).to.equal(1);

    const provider2 = new MockProvider();
    ctrl.setProvider(provider2);

    expect(ctrl.activeCount).to.equal(0);

    // New uploads should use provider2
    ctrl.add([createAttachment()]);
    await wait(100);

    expect(provider2.uploadCalls.length).to.be.greaterThan(0);
  });

  it('validates URL from provider result (rejects non-HTTPS)', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.uploadResult = { url: 'http://insecure.example.com/file.png' };

    let errorMsg = '';
    const ctrl = new UploadController(host, provider, {
      maxRetries: 0,
      onUploadError: (_, err) => {
        errorMsg = err.message;
      },
    });

    ctrl.add([createAttachment()]);
    await wait(100);

    expect(errorMsg).to.include('HTTPS');
    expect(ctrl.state).to.equal('error');
  });

  it('validates URL from provider result (rejects malformed URL)', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.uploadResult = { url: 'not-a-url' };

    let errorMsg = '';
    const ctrl = new UploadController(host, provider, {
      maxRetries: 0,
      onUploadError: (_, err) => {
        errorMsg = err.message;
      },
    });

    ctrl.add([createAttachment()]);
    await wait(100);

    expect(errorMsg).to.include('Invalid upload URL');
  });

  it('calls onAllComplete when queue is fully drained', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    let allResults: ReadonlyMap<string, UploadResult> | null = null;

    const ctrl = new UploadController(host, provider, {
      onAllComplete: results => {
        allResults = results;
      },
    });

    const att1 = createAttachment();
    const att2 = createAttachment();
    ctrl.add([att1, att2]);

    await wait(200);

    expect(allResults).to.not.be.null;
    expect(allResults!.size).to.equal(2);
  });

  it('add while queue is draining processes new items', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.uploadDelay = 50;

    const ctrl = new UploadController(host, provider);

    ctrl.add([createAttachment()]);
    await wait(20);

    // Add more while first is in-flight
    ctrl.add([createAttachment()]);

    await wait(200);

    expect(ctrl.results.size).to.equal(2);
    expect(ctrl.state).to.equal('complete');
  });

  it('reset while uploading aborts and clears', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.uploadDelay = 200;

    const ctrl = new UploadController(host, provider);
    ctrl.add([createAttachment()]);
    await wait(20);

    expect(ctrl.state).to.equal('uploading');

    ctrl.reset();

    expect(ctrl.state).to.equal('idle');
    expect(ctrl.activeCount).to.equal(0);
    expect(ctrl.results.size).to.equal(0);
  });

  it('hostDisconnected aborts active uploads', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.uploadDelay = 200;

    const ctrl = new UploadController(host, provider);
    ctrl.add([createAttachment()]);
    await wait(20);

    expect(ctrl.activeCount).to.equal(1);

    ctrl.hostDisconnected();

    expect(ctrl.activeCount).to.equal(0);
  });

  it('manual retry re-queues a failed attachment', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    let callCount = 0;

    provider.upload = async (file: File, options: UploadOptions) => {
      callCount++;
      if (callCount === 1) {
        throw new Error('First attempt fails');
      }
      options.onProgress?.(100);
      return { url: 'https://cdn.example.com/retry.png', assetId: 'asset-retry' };
    };

    let failedId = '';
    const ctrl = new UploadController(host, provider, {
      maxRetries: 0,
      onUploadError: att => {
        failedId = att.id;
      },
    });

    const att = createAttachment();
    ctrl.add([att]);
    await wait(100);

    expect(failedId).to.equal(att.id);
    expect(ctrl.state).to.equal('error');

    // Manual retry
    ctrl.retry(att.id);
    await wait(100);

    expect(ctrl.state).to.equal('complete');
    expect(ctrl.results.get(att.id)?.url).to.equal('https://cdn.example.com/retry.png');
  });

  it('retry throws for unknown attachment ID', () => {
    const host = createMockHost();
    const provider = new MockProvider();
    const ctrl = new UploadController(host, provider);

    try {
      ctrl.retry('unknown-id');
      expect.fail('Should have thrown');
    } catch (e) {
      expect((e as Error).message).to.include('cannot retry unknown attachment');
    }
  });

  it('cancel clears pending retry timer for the attachment', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    let callCount = 0;

    provider.upload = async () => {
      callCount++;
      throw new Error('Always fails');
    };

    const ctrl = new UploadController(host, provider, {
      maxRetries: 3,
      retryDelay: 200,
    });

    const att = createAttachment();
    ctrl.add([att]);
    await wait(50);

    // First attempt failed, retry timer should be pending
    expect(callCount).to.equal(1);

    // Cancel before retry fires
    ctrl.cancel(att.id);

    // Wait longer than retryDelay to confirm the retry never fires
    await wait(400);
    expect(callCount).to.equal(1); // Still just the initial attempt
  });

  it('cancel of active upload drains queued items at concurrency=1', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.uploadDelay = 200;

    const ctrl = new UploadController(host, provider, { concurrency: 1 });

    const att1 = createAttachment();
    const att2 = createAttachment();
    ctrl.add([att1, att2]);

    await wait(20);

    // att1 should be active, att2 queued
    expect(ctrl.activeCount).to.equal(1);
    expect(ctrl.queuedCount).to.equal(1);

    // Cancel the active upload — should drain and start att2
    ctrl.cancel(att1.id);

    await wait(300);

    // att2 should have completed
    expect(ctrl.results.has(att2.id)).to.be.true;
    expect(ctrl.state).to.equal('complete');
  });

  it('validates concurrency >= 1', () => {
    const host = createMockHost();
    const provider = new MockProvider();

    // concurrency: 0 should be clamped to 1
    const ctrl = new UploadController(host, provider, { concurrency: 0 });
    const att = createAttachment();
    ctrl.add([att]);

    // Should not deadlock — at least 1 active
    expect(ctrl.activeCount).to.be.greaterThan(0);
  });

  it('onAllComplete is NOT called when there are errors', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    let allCompleteCalled = false;

    // First file succeeds, second fails
    let callCount = 0;
    provider.upload = async (file: File, options: UploadOptions) => {
      callCount++;
      if (callCount === 2) {
        throw new Error('Second file fails');
      }
      options.onProgress?.(100);
      return { url: 'https://cdn.example.com/ok.png' };
    };

    const ctrl = new UploadController(host, provider, {
      maxRetries: 0,
      onAllComplete: () => {
        allCompleteCalled = true;
      },
    });

    ctrl.add([createAttachment(), createAttachment()]);
    await wait(200);

    expect(allCompleteCalled).to.be.false;
    expect(ctrl.state).to.equal('error');
  });

  it('handles NaN/undefined option values gracefully', () => {
    const host = createMockHost();
    const provider = new MockProvider();

    // NaN values should fall back to defaults
    const ctrl = new UploadController(host, provider, {
      concurrency: NaN,
      maxRetries: undefined,
      uploadTimeout: Infinity,
    });

    // Should not deadlock — concurrency falls back to default (3)
    const att = createAttachment();
    ctrl.add([att]);
    expect(ctrl.activeCount).to.be.greaterThan(0);
  });

  it('retry is no-op for non-errored (completed) attachment', async () => {
    const host = createMockHost();
    const provider = new MockProvider();

    const ctrl = new UploadController(host, provider);

    const att = createAttachment();
    ctrl.add([att]);
    await wait(100);

    expect(ctrl.state).to.equal('complete');
    expect(ctrl.results.size).to.equal(1);
    expect(provider.uploadCalls.length).to.equal(1);

    // Retry on completed attachment — should be no-op
    ctrl.retry(att.id);
    await wait(100);

    // Upload should NOT have been called again
    expect(provider.uploadCalls.length).to.equal(1);
  });

  it('retry is no-op for active attachment', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.uploadDelay = 200;

    const ctrl = new UploadController(host, provider);

    const att = createAttachment();
    ctrl.add([att]);
    await wait(20);

    expect(ctrl.activeCount).to.equal(1);

    // Retry on active attachment — should be no-op
    ctrl.retry(att.id);

    // Should still have only 1 active upload (no duplicate)
    expect(ctrl.activeCount).to.equal(1);
    expect(ctrl.queuedCount).to.equal(0);

    // Cleanup
    ctrl.abortAll();
  });

  it('retry is no-op for file-less errored attachment', async () => {
    const host = createMockHost();
    const provider = new MockProvider();

    const ctrl = new UploadController(host, provider, { maxRetries: 0 });

    // Add attachment without a file — immediately errors
    const att = createAttachment({ file: undefined });
    ctrl.add([att]);

    expect(ctrl.state).to.equal('error');

    // Retry — should be no-op because there's no file
    ctrl.retry(att.id);
    await wait(50);

    // Upload should never have been called
    expect(provider.uploadCalls.length).to.equal(0);
    expect(ctrl.state).to.equal('error');
  });

  it('retry is no-op for validation-error attachment', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.validateFn = () => 'File too large';

    const ctrl = new UploadController(host, provider, { maxRetries: 0 });

    const att = createAttachment();
    ctrl.add([att]);

    expect(ctrl.state).to.equal('error');

    // Retry — should re-validate and fail again
    ctrl.retry(att.id);
    await wait(50);

    // Upload should never have been called
    expect(provider.uploadCalls.length).to.equal(0);
    expect(ctrl.state).to.equal('error');
  });

  it('fractional concurrency is floored to integer', () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.uploadDelay = 200;

    // concurrency: 1.9 should be floored to 1
    const ctrl = new UploadController(host, provider, { concurrency: 1.9 });

    ctrl.add([createAttachment(), createAttachment()]);

    // Should have exactly 1 active (floored from 1.9), 1 queued
    expect(ctrl.activeCount).to.equal(1);
    expect(ctrl.queuedCount).to.equal(1);

    ctrl.abortAll();
  });

  // === Codex-found fix tests ===

  it('cancel during upload prevents stale completion callback (1.9)', async () => {
    const host = createMockHost();
    const provider = new MockProvider();
    provider.uploadDelay = 100;

    const completedIds: string[] = [];
    const updatedStatuses: string[] = [];

    const ctrl = new UploadController(host, provider, {
      onUploadComplete: att => {
        completedIds.push(att.id);
      },
      onAttachmentUpdate: att => {
        updatedStatuses.push(`${att.id}:${att.status}`);
      },
    });

    const att = createAttachment();
    ctrl.add([att]);

    // Wait for upload to start but not finish
    await wait(30);
    expect(ctrl.activeCount).to.equal(1);

    // Cancel while upload is in-flight
    ctrl.cancel(att.id);

    // Wait long enough for the upload to have completed internally
    await wait(200);

    // The completion callback should NOT have been called
    expect(completedIds).to.not.include(att.id);

    // Verify attachment is not in results (results is a Map)
    expect(ctrl.results.has(att.id)).to.be.false;

    // Verify no status update to 'complete' occurred
    const completeStatuses = updatedStatuses.filter(s => s === `${att.id}:complete`);
    expect(completeStatuses).to.have.length(0);
  });
});
