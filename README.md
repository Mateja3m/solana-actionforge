# solana-actionforge

ActionForge does NOT modify protocols/specs; it validates and tests conformance to existing Actions/Blinks specifications.

ActionForge is an open-source monorepo toolkit for Solana Actions/Blinks with strict validation, safe chaining helpers, and a deterministic conformance harness.

## Packages

- `@idoa/actionforge-validator`: schema validation + linting + CLI
- `@idoa/actionforge-chain`: safe chain state helpers (expiry, max steps, idempotency, transitions)
- `@idoa/actionforge-harness`: fixture runner + conformance report + CI template

## Quickstart

```bash
npm install
npm run build
npm test
```

Terminal 1:

```bash
npm run demo:server
```

Terminal 2:

```bash
npm run demo:test
```

## Workspace layout

- `packages/validator` -> [`@idoa/actionforge-validator`](./packages/validator)
- `packages/chain` -> [`@idoa/actionforge-chain`](./packages/chain)
- `packages/harness` -> [`@idoa/actionforge-harness`](./packages/harness)
- `examples/basic-action-endpoint`
- `examples/chained-action-endpoint`
- `docs/overview.md`
- `docs/reproducible-demo.md`

## Demo script

1. Start example endpoint:

```bash
npm run demo:server
```

2. Run validator:

```bash
npm exec -- actionforge-validator validate examples/basic-action-endpoint/valid-response.json
```

3. Run harness:

```bash
npm run demo:test
```

4. Show report output:

```bash
cat reports/actionforge-report.json
```

## Versioning notes

- `v0.1.0`: initial public release
- `v0.1.x`: patch line for bug fixes and deterministic behavior improvements only
