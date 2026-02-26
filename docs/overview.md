# ActionForge Overview

ActionForge is a deterministic toolkit for Solana Actions/Blinks teams that need repeatable conformance checks.

## Scope

- Strict schema validation + linting via `@idoa/actionforge-validator`
- Safe chaining primitives via `@idoa/actionforge-chain`
- Conformance harness + fixtures + CI template via `@idoa/actionforge-harness`

## Explicit boundaries

ActionForge does not modify or replace protocols/specifications. It ships validators, helpers, and harness tooling for existing Actions/Blinks specs.

## Version strategy

- `v0.1.0`: first public baseline for validator + chain + harness + fixtures
- `v0.1.x`: patch-only bug fixes and deterministic behavior improvements without API breaks
- `v0.2.0+`: minor updates for additive features only after compatibility review
