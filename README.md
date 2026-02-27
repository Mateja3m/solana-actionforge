# ActionForge - Blinks & Actions Validation + Chaining Toolkit

ActionForge does NOT modify protocols/specs; it validates and tests conformance to existing Actions/Blinks specifications.

ActionForge is an open-source monorepo toolkit for Solana Actions/Blinks with strict validation, safe chaining helpers, and a deterministic conformance harness.

## Status

- Published packages:
  - [@idoa/actionforge-validator](https://www.npmjs.com/package/@idoa/actionforge-validator)
  - [@idoa/actionforge-chain](https://www.npmjs.com/package/@idoa/actionforge-chain)
  - [@idoa/actionforge-harness](https://www.npmjs.com/package/@idoa/actionforge-harness)
- Current beta version: `0.1.1`
- Node.js support: `>=18`
- Implemented today:
  - strict schema validation and linting CLI
  - generic chaining/state helpers
  - conformance harness, fixtures, and CI template

## Packages

- `@idoa/actionforge-validator`: schema validation + linting + CLI
- `@idoa/actionforge-chain`: safe chain state helpers (expiry, max steps, idempotency, transitions)
- `@idoa/actionforge-harness`: fixture runner + conformance report + CI template

## Quickstart

```text
npm install
npm run build
npm test
```

Terminal 1:

```text
npm run demo:server
```

Terminal 2:

```text
npm run demo:test
```

## Workspace layout

- `packages/validator` -> [`@idoa/actionforge-validator`](https://github.com/Mateja3m/solana-actionforge/tree/main/packages/validator)
- `packages/chain` -> [`@idoa/actionforge-chain`](https://github.com/Mateja3m/solana-actionforge/tree/main/packages/chain)
- `packages/harness` -> [`@idoa/actionforge-harness`](https://github.com/Mateja3m/solana-actionforge/tree/main/packages/harness)
- Basic Action Endpoint (`examples/basic-action-endpoint`)
- Chained Action Endpoint (`examples/chained-action-endpoint`)
- [`docs/overview.md`](https://github.com/Mateja3m/solana-actionforge/blob/main/docs/overview.md)
- [`docs/reproducible-demo.md`](https://github.com/Mateja3m/solana-actionforge/blob/main/docs/reproducible-demo.md)

## Demo script

1. Start example endpoint:

```text
npm run demo:server
```

2. Run validator:

```text
npm exec -- actionforge-validator validate examples/basic-action-endpoint/valid-response.json
```

3. Run harness:

```text
npm run demo:test
```

4. Show report output:

```text
cat reports/actionforge-report.json
```

## Limitations

- focused on deterministic validation, chaining helpers, and conformance testing
- does not guarantee compatibility with every wallet or integration surface
- chaining helpers are generic utilities, not a protocol or spec extension

## Proof Of Use

- npm package: [@idoa/actionforge-validator](https://www.npmjs.com/package/@idoa/actionforge-validator)
- npm package: [@idoa/actionforge-chain](https://www.npmjs.com/package/@idoa/actionforge-chain)
- npm package: [@idoa/actionforge-harness](https://www.npmjs.com/package/@idoa/actionforge-harness)
- reproducible local demo: [docs/reproducible-demo.md](https://github.com/Mateja3m/solana-actionforge/blob/main/docs/reproducible-demo.md)
- CI workflow template: [packages/harness/templates/ci-example.yml](https://github.com/Mateja3m/solana-actionforge/blob/main/packages/harness/templates/ci-example.yml)

## Versioning notes

- `v0.1.0`: initial public release
- `v0.1.x`: patch line for bug fixes and deterministic behavior improvements only
