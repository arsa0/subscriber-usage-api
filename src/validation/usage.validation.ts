import { UsageInput } from '../types';

export type ValidationResult =
  | { ok: true; value: UsageInput }
  | { ok: false; errors: string[] };

export function validateUsage(body: unknown): ValidationResult {
  if (!isPlainObject(body)) {
    return { ok: false, errors: ['Request body must be a JSON object'] };
  }

  const { subscriberId, callMinutes, smsCount, dataUsageMB } = body;
  const errors: string[] = [];

  if (typeof subscriberId !== 'string' || subscriberId.trim() === '') {
    errors.push('subscriberId is required and must be a non-empty string');
  }

  const metrics = { callMinutes, smsCount, dataUsageMB };
  for (const [field, value] of Object.entries(metrics)) {
    if (!Number.isFinite(value) || (value as number) < 0) {
      errors.push(`${field} is required and must be a non-negative number`);
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      subscriberId: subscriberId as string,
      callMinutes: callMinutes as number,
      smsCount: smsCount as number,
      dataUsageMB: dataUsageMB as number,
    },
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}