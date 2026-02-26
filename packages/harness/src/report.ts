import fs from 'node:fs/promises';
import path from 'node:path';

export interface FixtureResult {
  id: string;
  description: string;
  pass: boolean;
  issues: string[];
  expected?: 'PASS' | 'FAIL';
  actual?: 'PASS' | 'FAIL';
  warningsCount?: number;
}

export interface HarnessSummary {
  total: number;
  passed: number;
  failed: number;
  warningsCount: number;
}

export interface HarnessReport {
  endpoint: string;
  startedAt: string;
  finishedAt: string;
  total: number;
  passed: number;
  failed: number;
  summary?: HarnessSummary;
  results: FixtureResult[];
}

export async function writeReport(report: HarnessReport, outFile: string): Promise<string> {
  const absolute = path.resolve(process.cwd(), outFile);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, JSON.stringify(report, null, 2), 'utf8');
  return absolute;
}

export function printConsoleReport(report: HarnessReport, reportPath?: string): void {
  console.log('ActionForge Harness Report');
  console.log(`Endpoint: ${report.endpoint}`);
  console.log(`Started: ${report.startedAt}`);
  console.log(`Finished: ${report.finishedAt}`);
  const warningsCount = report.summary?.warningsCount ?? 0;
  console.log(
    `Summary: total=${report.total} passed=${report.passed} failed=${report.failed} warningsCount=${warningsCount}${reportPath ? ` reportPath=${reportPath}` : ''}`,
  );

  for (const result of report.results) {
    const expected = result.expected ?? (result.pass ? 'PASS' : 'FAIL');
    const actual = result.actual ?? (result.pass ? 'PASS' : 'FAIL');
    console.log(`- ${result.pass ? 'PASS' : 'FAIL'} ${result.id} (expected ${expected}, got ${actual})`);
    if (result.issues.length > 0) {
      for (const issue of result.issues) {
        console.log(`  * ${issue}`);
      }
    }
  }
}
