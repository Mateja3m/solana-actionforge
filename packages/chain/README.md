# @idoa/actionforge-chain

Safe-by-default chaining primitives for Solana Actions/Blinks handlers.

## API

- `createChainState()`
- `encodeState()`
- `decodeState()`
- `enforceExpiry()`
- `enforceMaxSteps()`
- `idempotencyKeyFrom()`
- `isReplay()`
- `nextStep(currentState, actionResult)`

## Example

```ts
import {
  createChainState,
  encodeState,
  decodeState,
  nextStep,
  enforceExpiry,
  enforceMaxSteps,
} from '@idoa/actionforge-chain';

const initial = createChainState({ ttlMs: 60_000, maxSteps: 3 });
const encoded = encodeState(initial);
const decoded = decodeState(encoded);
enforceExpiry(decoded);
enforceMaxSteps(decoded);
const updated = nextStep(decoded, { tx: 'signature' });
```

This package does not define or modify any Solana protocol. It only provides generic state safety helpers.
