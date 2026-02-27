# @idoa/actionforge-validator

**Strict schema validation and lint helpers for [Solana Actions/Blinks](https://solana.com/docs/advanced/actions) payloads.**

Deterministically validates request and response objects against the Solana Actions spec and reports structured issues with error codes, field paths, and severity levels. Works as a library or a CLI tool.

> This package does **not** modify any Solana protocol or spec. It is a read-only conformance checker.

---

## Installation

```bash
npm install @idoa/actionforge-validator
```

Requires **Node.js >= 18**.

---

## Programmatic API

```ts
import {
  validateActionResponse,
  validateActionRequest,
  lintActionResponse,
} from '@idoa/actionforge-validator';
```

### `validateActionResponse(payload): ValidationResult`

Strictly validates a Solana Actions **response** payload against the spec schema. Any unrecognized fields or type mismatches will produce errors.

```ts
const result = validateActionResponse({
  title: 'Stake SOL',
  description: 'Stake your SOL with one click.',
  icon: 'https://example.com/icon.png',
  links: {
    actions: [{ label: 'Stake', href: 'https://example.com/api/stake' }],
  },
});

if (!result.ok) {
  console.error(result.issues);
  // [{ code: 'AFV1003', level: 'error', path: 'title', message: '...' }]
}
```

---

### `validateActionRequest(payload): ValidationResult`

Strictly validates a Solana Actions **request** payload (e.g. a POST body with `account`).

```ts
const result = validateActionRequest({ account: 'AxjDsasdXyz...' });

if (result.ok) {
  console.log('Request is valid');
}
```

---

### `lintActionResponse(payload): LintResult`

Non-strict analysis of an action response. Accepts valid payloads but surfaces **warnings** for common issues like non-HTTPS URLs, unexpected extra fields, or empty action lists.

```ts
const lint = lintActionResponse({
  title: 'My Action',
  description: 'Does something',
  icon: 'http://example.com/icon.png', // <- non-HTTPS, will warn
  links: { actions: [] },              // <- empty actions, will warn
});

console.log(lint.warnings);
// [
//   { code: 'AFV2002', level: 'warning', path: 'icon', message: 'Icon URL should use HTTPS.' },
//   { code: 'AFV2003', level: 'warning', path: 'links.actions', message: 'No action links were provided.' },
// ]
```

---

## Type Reference

### `ValidationResult`

```ts
interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}
```

### `LintResult`

```ts
interface LintResult {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  issues: ValidationIssue[]; // errors + warnings combined
}
```

### `ValidationIssue`

```ts
interface ValidationIssue {
  code: ValidatorErrorCode; // e.g. 'AFV1003'
  level: 'error' | 'warning';
  path: string;             // dot-notation field path, e.g. 'links.actions.0.href'
  message: string;
}
```

### Error Codes

| Code | Severity | Description |
|------|----------|-------------|
| `AFV1000` | error | Invalid JSON |
| `AFV1001` | error | Invalid request schema |
| `AFV1002` | error | Invalid response schema |
| `AFV1003` | error | Missing required field |
| `AFV1004` | error | Wrong field type |
| `AFV2001` | warning | Unexpected extra field |
| `AFV2002` | warning | Non-HTTPS URL detected |
| `AFV2003` | warning | No action links provided |

---

## CLI

Install globally or use via `npx`:

```bash
# Validate a local JSON file
actionforge-validator validate ./my-action-response.json

# Validate a live endpoint
actionforge-validator validate https://example.com/api/action

# Lint a local JSON file (warnings + errors)
actionforge-validator lint ./my-action-response.json

# Lint a live endpoint
actionforge-validator lint https://example.com/api/action
```

Exit codes: `0` = pass, `1` = validation errors found.

---

## Related Packages

- [`@idoa/actionforge-chain`](https://www.npmjs.com/package/@idoa/actionforge-chain) - Multi-step chaining state helpers
- [`@idoa/actionforge-harness`](https://www.npmjs.com/package/@idoa/actionforge-harness) - Conformance harness CLI for endpoint testing

---

## License

MIT (c) Milan Matejic
