import fs from 'node:fs/promises';
import path from 'node:path';

export type FixtureType = 'payload' | 'endpoint' | 'chain' | 'replay';

export interface HarnessFixture {
  id: string;
  description: string;
  type: FixtureType;
  mode?: 'validate' | 'lint';
  payload?: unknown;
  request?: {
    method: 'GET' | 'POST';
    path: string;
    body?: unknown;
  };
  chain?: {
    encodedState?: string;
    ttlMs?: number;
    maxSteps?: number;
    now?: number;
    currentTime?: number;
    advanceWith?: unknown;
  };
  replay?: {
    key: string;
  };
  expect: {
    pass: boolean;
    minWarnings?: number;
  };
}

export async function loadFixtures(fixturesDir: string): Promise<HarnessFixture[]> {
  const absolute = path.resolve(process.cwd(), fixturesDir);
  const files = await fs.readdir(absolute);
  const jsonFiles = files.filter((f) => f.endsWith('.json')).sort();

  const loaded = await Promise.all(
    jsonFiles.map(async (file) => {
      const raw = await fs.readFile(path.join(absolute, file), 'utf8');
      return JSON.parse(raw) as HarnessFixture;
    }),
  );

  return loaded;
}
