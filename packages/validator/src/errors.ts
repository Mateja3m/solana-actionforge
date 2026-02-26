export type IssueLevel = 'error' | 'warning';

export const VALIDATOR_ERROR_CODES = {
  INVALID_JSON: 'AFV1000',
  INVALID_REQUEST_SCHEMA: 'AFV1001',
  INVALID_RESPONSE_SCHEMA: 'AFV1002',
  MISSING_REQUIRED_FIELD: 'AFV1003',
  INVALID_FIELD_TYPE: 'AFV1004',
  EXTRA_FIELD: 'AFV2001',
  NON_HTTPS_LINK: 'AFV2002',
  EMPTY_ACTIONS: 'AFV2003',
} as const;

export type ValidatorErrorCode =
  (typeof VALIDATOR_ERROR_CODES)[keyof typeof VALIDATOR_ERROR_CODES];

export interface ValidationIssue {
  code: ValidatorErrorCode;
  level: IssueLevel;
  path: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}

export interface LintResult {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  issues: ValidationIssue[];
}
