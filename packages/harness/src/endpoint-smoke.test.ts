import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type http from 'node:http';

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  basicActionPayload,
  createBasicActionServer,
  startBasicActionServer,
} from '../../../examples/basic-action-endpoint/src/server';
import { loadFixtures } from './fixtures';
import { runHarness } from './runner';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('harness endpoint smoke', () => {
  it('starts the basic example endpoint and passes endpoint fixtures', async () => {
    const server = createBasicActionServer();
    const port = 3001;
    const address = { address: '127.0.0.1', family: 'IPv4', port };

    vi.spyOn(server, 'listen').mockImplementation(
      ((...args: unknown[]) => {
        const callback = [...args].reverse().find((arg) => typeof arg === 'function') as
          | (() => void)
          | undefined;
        callback?.();
        return server;
      }) as typeof server.listen,
    );
    vi.spyOn(server, 'address').mockReturnValue(address);
    vi.spyOn(server, 'close').mockImplementation(
      ((callback?: () => void) => {
        callback?.();
        return server;
      }) as http.Server['close'],
    );

    await startBasicActionServer(port, server);

    const fixtures = await loadFixtures(path.join(__dirname, '..', 'fixtures'));
    const endpointFixtures = fixtures.filter((fixture) => fixture.type === 'endpoint');
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'actionforge-endpoint-fixtures-'));

    await Promise.all(
      endpointFixtures.map((fixture, index) =>
        fs.writeFile(
          path.join(tmpDir, `${String(index + 1).padStart(2, '0')}-${fixture.id}.json`),
          JSON.stringify(fixture, null, 2),
          'utf8',
        ),
      ),
    );

    global.fetch = vi.fn(async (input, init) => {
      const url = typeof input === 'string' ? input : input.toString();
      const parsed = new URL(url);

      if (parsed.origin !== `http://127.0.0.1:${port}` || parsed.pathname !== '/') {
        throw new Error(`Unexpected request URL in smoke test: ${url}`);
      }

      if (init?.method && init.method !== 'GET') {
        throw new Error(`Unexpected request method in smoke test: ${init.method}`);
      }

      return new Response(JSON.stringify(basicActionPayload), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }) as typeof fetch;

    try {
      const report = await runHarness({
        endpoint: `http://127.0.0.1:${port}`,
        fixturesDir: tmpDir,
      });

      expect(report.total).toBe(endpointFixtures.length);
      expect(report.failed).toBe(0);
      expect(report.passed).toBe(endpointFixtures.length);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }
  });
});
