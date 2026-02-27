# @idoa/actionforge-chain

**Safe-by-default state and chaining primitives for multi-step [Solana Actions/Blinks](https://solana.com/docs/advanced/actions) handlers.**

Provides encode/decode, expiry enforcement, step counting, idempotency keys, and replay protection for stateful action chains. State is passed between steps as a compact base64url token - no database required.

> This package does **not** modify any Solana protocol or spec. It provides generic, framework-agnostic state safety helpers.

---

## Installation

```bash
npm install @idoa/actionforge-chain
```

Requires **Node.js >= 18**.

---

## How It Works

Solana Actions can be chained across multiple HTTP requests. `actionforge-chain` lets you encode a small state object into a URL-safe string and pass it through each step. On every request:

1. **Decode** the token from the incoming request
2. **Enforce** expiry and step limits
3. **Advance** to the next step
4. **Encode** the new state and embed it in the next action's `href`

---

## Quick Start

```ts
import {
  createChainState,
  encodeState,
  decodeState,
  enforceExpiry,
  enforceMaxSteps,
  nextStep,
} from '@idoa/actionforge-chain';

// Step 1 - create initial state (e.g. on first action request)
const initial = createChainState({ ttlMs: 5 * 60_000, maxSteps: 3 });
const token = encodeState(initial);
// Pass `token` to next step via href query param

// Step 2 - receive state at next step
const state = decodeState(token);
enforceExpiry(state);      // throws ChainError if expired
enforceMaxSteps(state);    // throws ChainError if step limit reached

const updated = nextStep(state, { tx: 'abc123...' });
const nextToken = encodeState(updated);
// Embed `nextToken` in the next action's href
```

---

## API Reference

### `createChainState(options?): ChainState`

Creates a new chain state. Call this at the **start** of a multi-step flow.

```ts
const state = createChainState({
  ttlMs: 300_000,      // TTL in milliseconds (default: 5 min)
  maxSteps: 5,          // Maximum allowed steps (default: 5)
  idempotencyKey: '...',  // Optional - auto-generated UUID if omitted
  meta: { userId: 42 }, // Optional custom metadata
});
```

---

### `encodeState(state: ChainState): string`

Serializes a `ChainState` to a compact **base64url** string safe for use in URLs.

```ts
const token = encodeState(state);
// e.g. "eyJ2ZXJzaW9uIjoxLCJpZGVtcG90..."
```

---

### `decodeState(encoded: string): ChainState`

Deserializes a base64url token back to a `ChainState`. Throws `ChainError` (`AFC1001`) if the token is malformed or fields are missing.

```ts
const state = decodeState(token);
```

---

### `enforceExpiry(state: ChainState, now?: number): ChainState`

Throws `ChainError` (`AFC1002`) if the chain state has expired. Optionally pass `now` (ms) for deterministic testing.

```ts
enforceExpiry(state);             // uses Date.now()
enforceExpiry(state, Date.now()); // explicit
```

---

### `enforceMaxSteps(state: ChainState): ChainState`

Throws `ChainError` (`AFC1003`) if `state.step >= state.maxSteps`.

```ts
enforceMaxSteps(state);
```

---

### `nextStep(currentState: ChainState, actionResult: unknown): ChainState`

Validates expiry and step limits, then returns a **new** `ChainState` with `step` incremented and `actionResult` fingerprinted into `history`. Does not mutate the input.

```ts
const updated = nextStep(state, { tx: 'signature123' });
```

---

### `idempotencyKeyFrom(parts: Array<string | number>): string`

Deterministically generates a SHA-256 idempotency key from an array of values. Useful for building keys from user pubkey + step + nonce.

```ts
const key = idempotencyKeyFrom(['userPubkey', 2, 'nonce42']);
```

---

### `isReplay(idempotencyKey: string, seenKeys: Set<string>): boolean`

Returns `true` if this key has been seen before (i.e. replay). Adds the key to `seenKeys` on first call.

```ts
const seen = new Set<string>();
isReplay(key, seen); // false - first time
isReplay(key, seen); // true  - replay detected
```

---

## Type Reference

### `ChainState`

```ts
interface ChainState {
  version: 1;
  idempotencyKey: string;
  step: number;
  maxSteps: number;
  createdAt: number;  // Unix ms
  expiresAt: number;  // Unix ms
  history: string[];  // SHA-256 fingerprints of past results
  meta?: Record<string, unknown>;
}
```

### `CreateChainStateOptions`

```ts
interface CreateChainStateOptions {
  ttlMs?: number;          // default: 300_000 (5 min)
  maxSteps?: number;       // default: 5
  idempotencyKey?: string; // default: random UUID
  now?: number;            // override for testing
  meta?: Record<string, unknown>;
}
```

### `ChainError`

Thrown by `enforceExpiry`, `enforceMaxSteps`, `decodeState`, and `nextStep`.

```ts
class ChainError extends Error {
  code: ChainErrorCode; // 'AFC1001' | 'AFC1002' | 'AFC1003' | 'AFC1004'
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `AFC1001` | Invalid or malformed chain state token |
| `AFC1002` | Chain state has expired |
| `AFC1003` | Maximum steps exceeded |
| `AFC1004` | Replay detected |

---

## Related Packages

- [`@idoa/actionforge-validator`](https://www.npmjs.com/package/@idoa/actionforge-validator) - Schema validation and linting
- [`@idoa/actionforge-harness`](https://www.npmjs.com/package/@idoa/actionforge-harness) - Conformance harness CLI for endpoint testing

---

## License

MIT (c) Milan Matejic
