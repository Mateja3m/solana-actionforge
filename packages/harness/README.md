# @idoa/actionforge-harness

Conformance harness CLI for testing Action endpoints with deterministic fixtures.

## CLI

```bash
actionforge-harness run --endpoint <url> --fixtures ./fixtures --out ./reports/actionforge-report.json
```

Outputs:

- Console summary (pass/fail by fixture)
- JSON report file

## CI usage

Use [`templates/ci-example.yml`](./templates/ci-example.yml) to run the harness in CI.

## Fixture coverage

Included fixtures cover valid/invalid payloads, missing/wrong fields, lint warnings, chain state checks, expiry checks, and replay simulation.
