import { describe, expect, it } from 'vitest';

import { lintActionResponse, validateActionRequest, validateActionResponse } from './index';

describe('validator', () => {
  it('validates a valid response', () => {
    const result = validateActionResponse({
      title: 'Swap',
      description: 'Swap tokens',
      icon: 'https://example.com/icon.png',
      links: {
        actions: [{ label: 'Run', href: 'https://example.com/action', method: 'POST' }],
      },
    });

    expect(result.ok).toBe(true);
  });

  it('validates a valid request', () => {
    const result = validateActionRequest({
      account: 'wallet-address',
      idempotencyKey: 'abc',
    });

    expect(result.ok).toBe(true);
  });

  it('lints unexpected top-level fields as warning', () => {
    const result = lintActionResponse({
      title: 'Swap',
      description: 'Swap tokens',
      icon: 'http://example.com/icon.png',
      links: {
        actions: [{ label: 'Run', href: '/action', method: 'POST' }],
      },
      extra: true,
    });

    expect(result.ok).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
