export const CHAIN_ERROR_CODES = {
  INVALID_STATE: 'AFC1001',
  EXPIRED_STATE: 'AFC1002',
  MAX_STEPS_EXCEEDED: 'AFC1003',
  REPLAY_DETECTED: 'AFC1004',
} as const;

export type ChainErrorCode = (typeof CHAIN_ERROR_CODES)[keyof typeof CHAIN_ERROR_CODES];

export class ChainError extends Error {
  code: ChainErrorCode;

  constructor(code: ChainErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'ChainError';
  }
}
