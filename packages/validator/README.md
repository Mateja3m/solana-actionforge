# @idoa/actionforge-validator

Strict validation and linting helpers for Solana Actions/Blinks payloads.

## API

- `validateActionResponse(payload): ValidationResult`
- `validateActionRequest(payload): ValidationResult`
- `lintActionResponse(payload): LintResult`

## CLI

```bash
actionforge-validator validate <fileOrUrl>
actionforge-validator lint <fileOrUrl>
```

Both commands accept a local JSON file path or URL.

## Notes

ActionForge does not modify protocols/specs. This package provides deterministic conformance checks and linting for common payload structure.
