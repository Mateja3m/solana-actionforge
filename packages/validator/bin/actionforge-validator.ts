#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { lintActionResponse, validateActionRequest, validateActionResponse } from '../src/index';

interface CliResult {
  ok: boolean;
  issues: Array<{ code: string; level: string; path: string; message: string }>;
}

function isUrl(input: string): boolean {
  return /^https?:\/\//.test(input);
}

async function loadJson(fileOrUrl: string): Promise<unknown> {
  const raw = isUrl(fileOrUrl)
    ? await (await fetch(fileOrUrl)).text()
    : await readFile(resolve(process.cwd(), fileOrUrl), 'utf8');

  return JSON.parse(raw);
}

function printResult(mode: 'validate' | 'lint', result: CliResult): void {
  if (mode === 'lint') {
    const errors = result.issues.filter((i) => i.level === 'error').length;
    const warnings = result.issues.filter((i) => i.level === 'warning').length;
    console.log(`Lint ${result.ok ? 'PASS' : 'FAIL'} | errors=${errors} warnings=${warnings}`);
  } else {
    console.log(`Validation ${result.ok ? 'PASS' : 'FAIL'} | issues=${result.issues.length}`);
  }

  for (const issue of result.issues) {
    console.log(`- [${issue.level}] ${issue.code} @ ${issue.path}: ${issue.message}`);
  }
}

async function main(): Promise<void> {
  const [command, fileOrUrl] = process.argv.slice(2);
  if (!command || !fileOrUrl || !['validate', 'lint'].includes(command)) {
    console.error('Usage: actionforge-validator <validate|lint> <fileOrUrl>');
    process.exit(1);
  }

  try {
    const payload = await loadJson(fileOrUrl);

    if (command === 'validate') {
      const responseCheck = validateActionResponse(payload);
      const requestCheck = validateActionRequest(payload);

      const result = responseCheck.ok || requestCheck.ok ? { ok: true, issues: [] } : responseCheck;
      printResult('validate', result);
      process.exit(result.ok ? 0 : 1);
    }

    const lint = lintActionResponse(payload);
    printResult('lint', { ok: lint.errors.length === 0, issues: lint.issues });
    process.exit(lint.errors.length === 0 ? 0 : 1);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Validation FAIL | issues=1`);
    console.error(`- [error] AFV1000 @ $: ${message}`);
    process.exit(1);
  }
}

void main();
