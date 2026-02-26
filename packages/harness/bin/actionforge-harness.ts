#!/usr/bin/env node

import { printConsoleReport, writeReport } from '../src/report';
import { runHarness } from '../src/runner';

interface CliArgs {
  endpoint: string;
  fixtures: string;
  out: string;
}

function parseArgs(argv: string[]): CliArgs {
  if (argv[0] !== 'run') {
    throw new Error('Usage: actionforge-harness run --endpoint <url> --fixtures <dir> [--out <file>]');
  }

  const endpointIndex = argv.indexOf('--endpoint');
  const fixturesIndex = argv.indexOf('--fixtures');
  const outIndex = argv.indexOf('--out');

  if (endpointIndex === -1 || fixturesIndex === -1) {
    throw new Error('Both --endpoint and --fixtures are required.');
  }

  return {
    endpoint: argv[endpointIndex + 1],
    fixtures: argv[fixturesIndex + 1],
    out: outIndex === -1 ? 'reports/actionforge-report.json' : argv[outIndex + 1],
  };
}

async function main(): Promise<void> {
  try {
    const args = parseArgs(process.argv.slice(2));
    const report = await runHarness({ endpoint: args.endpoint, fixturesDir: args.fixtures });
    const out = await writeReport(report, args.out);
    printConsoleReport(report, out);
    process.exit(report.failed === 0 ? 0 : 1);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(message);
    process.exit(1);
  }
}

void main();
