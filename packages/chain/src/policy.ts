import { CHAIN_ERROR_CODES, ChainError } from './errors';
import { ChainState } from './state';

export function enforceExpiry(state: ChainState, now = Date.now()): ChainState {
  if (now > state.expiresAt) {
    throw new ChainError(CHAIN_ERROR_CODES.EXPIRED_STATE, 'Chain state expired.');
  }

  return state;
}

export function enforceMaxSteps(state: ChainState): ChainState {
  if (state.step >= state.maxSteps) {
    throw new ChainError(CHAIN_ERROR_CODES.MAX_STEPS_EXCEEDED, 'Chain max steps exceeded.');
  }

  return state;
}
