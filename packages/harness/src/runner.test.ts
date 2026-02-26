import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { loadFixtures } from './fixtures';
import { runHarness } from './runner';

describe('harness', () => {
  it('runs local payload and chain fixtures', async () => {
    const fixtures = await loadFixtures(path.join(__dirname, '..', 'fixtures'));
    const filtered = fixtures.filter((fixture) => fixture.type !== 'endpoint');
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'actionforge-fixtures-'));

    await Promise.all(
      filtered.map((fixture, index) =>
        fs.writeFile(
          path.join(tmpDir, `${String(index + 1).padStart(2, '0')}-${fixture.id}.json`),
          JSON.stringify(fixture, null, 2),
          'utf8',
        ),
      ),
    );

    const report = await runHarness({
      endpoint: 'http://127.0.0.1:9999',
      fixturesDir: tmpDir,
    });

    expect(report.total).toBeGreaterThanOrEqual(9);
    expect(report.passed).toBeGreaterThan(0);
  });
});
