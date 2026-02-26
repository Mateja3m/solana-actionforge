import { createHash, randomUUID } from 'node:crypto';

import { CHAIN_ERROR_CODES, ChainError } from './errors';

export interface ChainState {
  version: 1;
  idempotencyKey: string;
  step: number;
  maxSteps: number;
  createdAt: number;
  expiresAt: number;
  history: string[];
  meta?: Record<string, unknown>;
}

export interface CreateChainStateOptions {
  ttlMs?: number;
  maxSteps?: number;
  idempotencyKey?: string;
  now?: number;
  meta?: Record<string, unknown>;
}

export function createChainState(options: CreateChainStateOptions = {}): ChainState {
  const now = options.now ?? Date.now();
  const ttlMs = options.ttlMs ?? 5 * 60_000;

  return {
    version: 1,
    idempotencyKey: options.idempotencyKey ?? randomUUID(),
    step: 0,
    maxSteps: options.maxSteps ?? 5,
    createdAt: now,
    expiresAt: now + ttlMs,
    history: [],
    meta: options.meta,
  };
}

export function encodeState(state: ChainState): string {
  const normalized: ChainState = {
    version: 1,
    idempotencyKey: state.idempotencyKey,
    step: state.step,
    maxSteps: state.maxSteps,
    createdAt: state.createdAt,
    expiresAt: state.expiresAt,
    history: [...state.history],
    meta: state.meta,
  };

  return Buffer.from(JSON.stringify(normalized), 'utf8').toString('base64url');
}

export function decodeState(encoded: string): ChainState {
  try {
    const json = Buffer.from(encoded, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as ChainState;

    if (
      parsed.version !== 1 ||
      typeof parsed.idempotencyKey !== 'string' ||
      typeof parsed.step !== 'number' ||
      typeof parsed.maxSteps !== 'number' ||
      typeof parsed.createdAt !== 'number' ||
      typeof parsed.expiresAt !== 'number' ||
      !Array.isArray(parsed.history)
    ) {
      throw new ChainError(CHAIN_ERROR_CODES.INVALID_STATE, 'Malformed chain state.');
    }

    return parsed;
  } catch (error) {
    if (error instanceof ChainError) {
      throw error;
    }

    throw new ChainError(CHAIN_ERROR_CODES.INVALID_STATE, 'Unable to decode chain state.');
  }
}

export function idempotencyKeyFrom(parts: Array<string | number>): string {
  const input = parts.join('|');
  return createHash('sha256').update(input).digest('hex');
}

export function isReplay(idempotencyKey: string, seenKeys: Set<string>): boolean {
  if (seenKeys.has(idempotencyKey)) {
    return true;
  }

  seenKeys.add(idempotencyKey);
  return false;
}
