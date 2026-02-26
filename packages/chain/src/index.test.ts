import { describe, expect, it } from 'vitest';

import {
  createChainState,
  decodeState,
  encodeState,
  enforceExpiry,
  enforceMaxSteps,
  nextStep,
} from './index';

describe('chain', () => {
  it('encodes and decodes state', () => {
    const state = createChainState({ now: 1000, ttlMs: 1000 });
    const encoded = encodeState(state);
    const decoded = decodeState(encoded);

    expect(decoded.idempotencyKey).toBe(state.idempotencyKey);
  });

  it('advances step deterministically', () => {
    const state = createChainState({ now: Date.now(), ttlMs: 10000, maxSteps: 3 });
    const advanced = nextStep(state, { ok: true });
    expect(advanced.step).toBe(1);
    expect(advanced.history).toHaveLength(1);
  });

  it('enforces max steps', () => {
    const state = { ...createChainState({ maxSteps: 1 }), step: 1 };
    expect(() => enforceMaxSteps(state)).toThrowError();
  });

  it('enforces expiry', () => {
    const state = createChainState({ now: 1000, ttlMs: 10 });
    expect(() => enforceExpiry(state, 2000)).toThrowError();
  });
});
