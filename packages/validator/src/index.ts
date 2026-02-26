import { ZodError } from 'zod';

import {
  LintResult,
  VALIDATOR_ERROR_CODES,
  ValidationIssue,
  ValidationResult,
} from './errors';
import { actionRequestSchema } from './schema/request';
import { actionResponseSchema } from './schema/response';

function mapZodError(error: ZodError, fallbackCode: string): ValidationIssue[] {
  return error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join('.') : '$';
    let code = fallbackCode as ValidationIssue['code'];

    if (issue.code === 'invalid_type') {
      code = VALIDATOR_ERROR_CODES.INVALID_FIELD_TYPE;
    } else if (issue.code === 'unrecognized_keys') {
      code = VALIDATOR_ERROR_CODES.EXTRA_FIELD;
    } else if (issue.code === 'too_small') {
      code = VALIDATOR_ERROR_CODES.MISSING_REQUIRED_FIELD;
    }

    return {
      code,
      level: 'error',
      path,
      message: issue.message,
    };
  });
}

export function validateActionResponse(payload: unknown): ValidationResult {
  const parsed = actionResponseSchema.safeParse(payload);
  if (parsed.success) {
    return { ok: true, issues: [] };
  }

  return {
    ok: false,
    issues: mapZodError(parsed.error, VALIDATOR_ERROR_CODES.INVALID_RESPONSE_SCHEMA),
  };
}

export function validateActionRequest(payload: unknown): ValidationResult {
  const parsed = actionRequestSchema.safeParse(payload);
  if (parsed.success) {
    return { ok: true, issues: [] };
  }

  return {
    ok: false,
    issues: mapZodError(parsed.error, VALIDATOR_ERROR_CODES.INVALID_REQUEST_SCHEMA),
  };
}

export function lintActionResponse(payload: unknown): LintResult {
  const relaxedResponseSchema = actionResponseSchema.passthrough();
  const parsed = relaxedResponseSchema.safeParse(payload);
  const warnings: ValidationIssue[] = [];

  if (!parsed.success) {
    const issues = mapZodError(parsed.error, VALIDATOR_ERROR_CODES.INVALID_RESPONSE_SCHEMA);
    return {
      ok: false,
      errors: issues,
      warnings,
      issues: [...issues],
    };
  }

  const response = payload as Record<string, unknown>;

  const knownTopKeys = new Set(['title', 'description', 'icon', 'links']);
  for (const key of Object.keys(response)) {
    if (!knownTopKeys.has(key)) {
      warnings.push({
        code: VALIDATOR_ERROR_CODES.EXTRA_FIELD,
        level: 'warning',
        path: key,
        message: `Unexpected top-level field: ${key}`,
      });
    }
  }

  const icon = String(response.icon ?? '');
  if (icon && !/^https:\/\//.test(icon)) {
    warnings.push({
      code: VALIDATOR_ERROR_CODES.NON_HTTPS_LINK,
      level: 'warning',
      path: 'icon',
      message: 'Icon URL should use HTTPS.',
    });
  }

  const actions = (response.links as { actions?: Array<{ href?: string }> }).actions;
  if (!actions || actions.length === 0) {
    warnings.push({
      code: VALIDATOR_ERROR_CODES.EMPTY_ACTIONS,
      level: 'warning',
      path: 'links.actions',
      message: 'No action links were provided.',
    });
  } else {
    actions.forEach((action, index) => {
      if (action.href && !/^https:\/\//.test(action.href) && !action.href.startsWith('/')) {
        warnings.push({
          code: VALIDATOR_ERROR_CODES.NON_HTTPS_LINK,
          level: 'warning',
          path: `links.actions.${index}.href`,
          message: 'Action href should use HTTPS or a relative path.',
        });
      }
    });
  }

  return {
    ok: true,
    errors: [],
    warnings,
    issues: warnings,
  };
}

export * from './errors';
