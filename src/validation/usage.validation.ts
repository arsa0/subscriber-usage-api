import { UsageInput } from '../types';

export type ValidationResult =
  | { ok: true; value: UsageInput }
  | { ok: false; errors: string[] };

export function validateUsage(_body: unknown): ValidationResult {
  // TODO: required fields, types, non-negative numbers
  throw new Error('Not implemented');
}
