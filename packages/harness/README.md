# @idoa/actionforge-harness

**Conformance harness CLI and programmatic runner for testing [Solana Actions/Blinks](https://solana.com/docs/advanced/actions) endpoints.**

Runs a suite of deterministic JSON fixtures against a live endpoint (or static payloads) and produces a structured pass/fail report. Designed for use locally and in CI pipelines.

---

## Installation

```bash
# Global (for CLI use)
npm install -g @idoa/actionforge-harness

# Local dev dependency
npm install --save-dev @idoa/actionforge-harness
```

Requires **Node.js ≥ 18**.

---

## Quick Start

```bash
# Start your action server, then:
actionforge-harness run \
  --endpoint http://localhost:3001 \
  --fixtures ./fixtures \
  --out ./reports/actionforge-report.json
```

You'll see a per-fixture pass/fail summary in the console and a full JSON report written to the `--out` path.

---

## CLI Reference

```
actionforge-harness run [options]

Options:
  --endpoint  <url>      Base URL of the action server to test (required)
  --fixtures  <dir>      Directory containing fixture JSON files (required)
  --out       <path>     Output path for the JSON report (optional)
```

### Example

```bash
actionforge-harness run \
  --endpoint https://my-action-server.example.com \
  --fixtures ./packages/harness/fixtures \
  --out ./reports/report.json
```

Exit codes: `0` = all fixtures passed, `1` = one or more failures.

---

## Fixture Format

Each fixture is a `.json` file in the fixtures directory. Fixtures are run in filename order.

### `payload` — validate a static JSON payload

```json
{
  "id": "valid-response",
  "type": "payload",
  "description": "A well-formed action response passes validation",
  "mode": "validate",
  "payload": {
    "title": "Stake SOL",
    "description": "Stake your SOL",
    "icon": "https://example.com/icon.png",
    "links": {
      "actions": [{ "label": "Stake", "href": "https://example.com/api/stake" }]
    }
  },
  "expect": { "pass": true }
}
```

Set `"mode": "lint"` to run `lintActionResponse` instead of `validateActionResponse`. Use `"expect": { "minWarnings": 1 }` to assert warning counts.

---

### `endpoint` — call a live endpoint and validate its response

```json
{
  "id": "endpoint-valid",
  "type": "endpoint",
  "description": "GET / returns a valid action response",
  "request": { "method": "GET", "path": "/" },
  "expect": { "pass": true }
}
```

Supports `GET` and `POST`. For `POST`, include a `"body"` field.

---

### `chain` — verify chain state encode/decode and policy enforcement

```json
{
  "id": "expiry-check",
  "type": "chain",
  "description": "Expired chain state is rejected",
  "chain": {
    "ttlMs": 1000,
    "maxSteps": 5,
    "now": 1000000000000,
    "currentTime": 1000000060000
  },
  "expect": { "pass": false }
}
```

---

### `replay` — verify idempotency replay detection

```json
{
  "id": "replay-sim",
  "type": "replay",
  "description": "Same key on second call is detected as replay",
  "replay": { "key": "unique-idempotency-key-abc" },
  "expect": { "pass": true }
}
```

---

## Report Output

The JSON report written to `--out` has the following shape:

```ts
{
  endpoint: string;
  startedAt: string;  // ISO 8601
  finishedAt: string;
  total: number;
  passed: number;
  failed: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warningsCount: number;
  };
  results: Array<{
    id: string;
    description: string;
    pass: boolean;
    expected: 'PASS' | 'FAIL';
    actual: 'PASS' | 'FAIL';
    issues: string[];
    warningsCount: number;
  }>;
}
```

---

## Programmatic API

```ts
import { runHarness } from '@idoa/actionforge-harness';

const report = await runHarness({
  endpoint: 'http://localhost:3001',
  fixturesDir: './fixtures',
});

console.log(`${report.passed}/${report.total} passed`);
```

---

## Included Fixtures

The package ships with **10 reference fixtures** covering:

| # | Fixture | Coverage |
|---|---------|----------|
| 01 | `valid-response` | Well-formed action response |
| 02 | `invalid-schema` | Missing required fields |
| 03 | `missing-fields` | Incomplete payload |
| 04 | `wrong-types` | Type mismatches |
| 05 | `extra-fields-lint` | Unexpected fields (lint warning) |
| 06 | `chain-encode-decode` | State encode/decode round-trip |
| 07 | `expiry-enforcement` | Expired chain state rejection |
| 08 | `max-steps-enforcement` | Step limit exceeded |
| 09 | `idempotency-replay` | Replay detection |
| 10 | `endpoint-valid` | Live endpoint validation |

---

## CI Integration

A ready-to-use GitHub Actions workflow is bundled at [`templates/ci-example.yml`](./templates/ci-example.yml).

```yaml
- name: Run ActionForge harness
  run: |
    npm run build
    actionforge-harness run \
      --endpoint http://localhost:3001 \
      --fixtures packages/harness/fixtures \
      --out reports/actionforge-report.json
```

---

## Related Packages

- [`@idoa/actionforge-validator`](https://www.npmjs.com/package/@idoa/actionforge-validator) — Schema validation and linting
- [`@idoa/actionforge-chain`](https://www.npmjs.com/package/@idoa/actionforge-chain) — Multi-step chaining state helpers

---

## License

MIT © Milan Matejic
