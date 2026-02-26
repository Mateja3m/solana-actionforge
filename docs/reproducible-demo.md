# Reproducible Demo

## Prerequisites

- Node.js 18+
- npm 9+

## Steps

1. Install dependencies:

```bash
npm install
```

2. Build all packages and examples:

```bash
npm run build
```

3. Start the basic example endpoint:

```bash
node examples/basic-action-endpoint/dist/server.js
```

4. In a second terminal, validate a known payload fixture:

```bash
npm exec -- actionforge-validator validate examples/basic-action-endpoint/valid-response.json
```

5. Run the harness against the local endpoint:

```bash
npm exec -- actionforge-harness run --endpoint http://127.0.0.1:3001 --fixtures packages/harness/fixtures --out reports/actionforge-report.json
```

6. Inspect JSON report:

```bash
cat reports/actionforge-report.json
```
