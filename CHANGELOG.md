# Changelog

All notable changes to this project will be documented in this file.

## [0.1.2] - 2026-02-27

### Changed

- Updated `@idoa/actionforge-harness` to depend on `@idoa/actionforge-validator@0.1.1` and `@idoa/actionforge-chain@0.1.1`.
- Added an automated endpoint smoke test covering the basic example endpoint startup path and endpoint fixture flow.
- Enabled a working root lint workflow for repository-wide checks.

## [0.1.1] - 2026-02-27

### Added

- Published npm packages for validator, chain, and harness under the `@idoa` scope.
- Added root-level demo scripts for local server and harness testing.
- Added root README status, limitations, and proof-of-use sections.

### Changed

- Improved harness CLI output with explicit expected vs actual statuses.
- Added report summary metadata and expected/actual fields in harness JSON output.
- Normalized README text to plain ASCII punctuation for cleaner npm rendering.
- Updated chain conformance fixture to pass deterministically.

### Fixed

- Corrected `@idoa/actionforge-harness` package entrypoints for independent npm usage.
- Added package-local `LICENSE` files so published tarballs include license text.

## [0.1.0] - 2026-02-26

### Added

- Initial public beta for `@idoa/actionforge-validator`.
- Initial public beta for `@idoa/actionforge-chain`.
- Initial public beta for `@idoa/actionforge-harness`.
- Example endpoints, fixtures, CI template, and reproducible demo docs.
