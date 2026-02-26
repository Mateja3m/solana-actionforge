import {
  createChainState,
  decodeState,
  encodeState,
  enforceExpiry,
  enforceMaxSteps,
  isReplay,
  nextStep,
} from '@idoa/actionforge-chain';
import { lintActionResponse, validateActionResponse } from '@idoa/actionforge-validator';

import { HarnessFixture, loadFixtures } from './fixtures';
import { FixtureResult, HarnessReport } from './report';

export interface RunHarnessOptions {
  endpoint: string;
  fixturesDir: string;
}

async function executeFixture(
  fixture: HarnessFixture,
  endpoint: string,
  seenReplayKeys: Set<string>,
): Promise<FixtureResult> {
  const issues: string[] = [];
  let actualPass = false;
  let warningsCount = 0;

  if (fixture.type === 'payload') {
    if (fixture.mode === 'lint') {
      const lint = lintActionResponse(fixture.payload);
      actualPass = lint.errors.length === 0;
      if ((fixture.expect.minWarnings ?? 0) > lint.warnings.length) {
        issues.push(
          `Expected at least ${fixture.expect.minWarnings} warnings, got ${lint.warnings.length}.`,
        );
        actualPass = false;
      }
      warningsCount += lint.warnings.length;
      lint.errors.forEach((e) => issues.push(`${e.code} ${e.path} ${e.message}`));
      lint.warnings.forEach((w) => issues.push(`${w.code} ${w.path} ${w.message}`));
    } else {
      const validation = validateActionResponse(fixture.payload);
      actualPass = validation.ok;
      validation.issues.forEach((e) => issues.push(`${e.code} ${e.path} ${e.message}`));
    }
  }

  if (fixture.type === 'endpoint') {
    const request = fixture.request ?? { method: 'GET' as const, path: '/' };
    const url = `${endpoint.replace(/\/$/, '')}${request.path}`;
    const response = await fetch(url, {
      method: request.method,
      headers: { 'content-type': 'application/json' },
      body: request.body ? JSON.stringify(request.body) : undefined,
    });

    const payload = await response.json();
    const validation = validateActionResponse(payload);
    actualPass = response.ok && validation.ok;
    if (!response.ok) {
      issues.push(`Endpoint returned status ${response.status}`);
    }
    validation.issues.forEach((e) => issues.push(`${e.code} ${e.path} ${e.message}`));
  }

  if (fixture.type === 'chain') {
    const now = fixture.chain?.now ?? Date.now();
    const state = fixture.chain?.encodedState
      ? decodeState(fixture.chain.encodedState)
      : createChainState({
          ttlMs: fixture.chain?.ttlMs,
          maxSteps: fixture.chain?.maxSteps,
          now,
        });

    try {
      enforceExpiry(state, fixture.chain?.currentTime ?? now);
      enforceMaxSteps(state);
      const updated = nextStep(state, fixture.chain?.advanceWith ?? { ok: true });
      const encoded = encodeState(updated);
      decodeState(encoded);
      actualPass = true;
    } catch (error) {
      issues.push(error instanceof Error ? error.message : 'Unknown chain error');
      actualPass = false;
    }
  }

  if (fixture.type === 'replay') {
    const key = fixture.replay?.key ?? 'default-key';
    const first = isReplay(key, seenReplayKeys);
    const second = isReplay(key, seenReplayKeys);
    actualPass = !first && second;
    if (!actualPass) {
      issues.push('Replay simulation did not behave as expected.');
    }
  }

  const pass = actualPass === fixture.expect.pass;
  if (!pass) {
    issues.push(`Expected pass=${fixture.expect.pass}, got pass=${actualPass}`);
  }

  const expected = fixture.expect.pass ? 'PASS' : 'FAIL';
  const actual = actualPass ? 'PASS' : 'FAIL';

  return {
    id: fixture.id,
    description: fixture.description,
    pass,
    issues,
    expected,
    actual,
    warningsCount,
  };
}

export async function runHarness(options: RunHarnessOptions): Promise<HarnessReport> {
  const startedAt = new Date().toISOString();
  const fixtures = await loadFixtures(options.fixturesDir);
  const seenReplayKeys = new Set<string>();
  const results: FixtureResult[] = [];

  for (const fixture of fixtures) {
    results.push(await executeFixture(fixture, options.endpoint, seenReplayKeys));
  }

  const passed = results.filter((result) => result.pass).length;
  const failed = results.length - passed;
  const warningsCount = results.reduce((acc, result) => acc + (result.warningsCount ?? 0), 0);

  return {
    endpoint: options.endpoint,
    startedAt,
    finishedAt: new Date().toISOString(),
    total: results.length,
    passed,
    failed,
    summary: {
      total: results.length,
      passed,
      failed,
      warningsCount,
    },
    results,
  };
}
