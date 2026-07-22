import { expect } from '@open-wc/testing';
import { safeHttpUrl } from './safe-url.js';

describe('safeHttpUrl', () => {
  it('passes http:// through', () => {
    expect(safeHttpUrl('http://example.com/')).to.equal('http://example.com/');
  });

  it('passes https:// through', () => {
    expect(safeHttpUrl('https://example.com/path?q=1#x')).to.equal(
      'https://example.com/path?q=1#x',
    );
  });

  it('rejects javascript: scheme', () => {
    expect(safeHttpUrl('javascript:alert(1)')).to.be.null;
  });

  it('rejects data: scheme (including image/svg+xml)', () => {
    expect(safeHttpUrl('data:text/html,<script>alert(1)</script>')).to.be.null;
    expect(safeHttpUrl('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=')).to.be.null;
  });

  it('rejects blob:, file:, mailto:, ftp:', () => {
    expect(safeHttpUrl('blob:https://example.com/abc')).to.be.null;
    expect(safeHttpUrl('file:///etc/passwd')).to.be.null;
    expect(safeHttpUrl('mailto:foo@example.com')).to.be.null;
    expect(safeHttpUrl('ftp://files.example.com/')).to.be.null;
  });

  it('rejects empty / whitespace / non-string', () => {
    expect(safeHttpUrl('')).to.be.null;
    expect(safeHttpUrl('   ')).to.be.null;
    expect(safeHttpUrl(null)).to.be.null;
    expect(safeHttpUrl(undefined)).to.be.null;
    expect(safeHttpUrl(42)).to.be.null;
    expect(safeHttpUrl({})).to.be.null;
  });

  it('rejects garbage strings without a base', () => {
    expect(safeHttpUrl('not a url')).to.be.null;
    expect(safeHttpUrl('/relative/path')).to.be.null;
  });

  it('preserves percent-encoding and query strings', () => {
    expect(safeHttpUrl('https://example.com/path?q=hello%20world')).to.equal(
      'https://example.com/path?q=hello%20world',
    );
  });
});
