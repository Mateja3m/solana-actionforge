import { createHash } from 'node:crypto';

import { enforceExpiry, enforceMaxSteps } from './policy';
import { ChainState } from './state';

function summarizeResult(result: unknown): string {
  const raw = JSON.stringify(result ?? null);
  return createHash('sha256').update(raw).digest('hex').slice(0, 12);
}

export function nextStep(currentState: ChainState, actionResult: unknown): ChainState {
  enforceExpiry(currentState);
  enforceMaxSteps(currentState);

  return {
    ...currentState,
    step: currentState.step + 1,
    history: [...currentState.history, summarizeResult(actionResult)],
  };
}
