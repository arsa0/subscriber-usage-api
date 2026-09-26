import { USAGE_FIELDS } from './types';
import type { UsageField, UsageFormValues, UsageRecord } from './types';

const BASE = '/usage';

export type CreateResult =
  | { ok: true; record: UsageRecord }
  | { ok: false; errors: string[] };

export async function createUsage(values: UsageFormValues): Promise<CreateResult> {
  const response = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(values)),
  });

  if (response.status === 201) {
    return { ok: true, record: (await response.json()) as UsageRecord };
  }

  if (response.status === 400) {
    const body = (await response.json()) as { errors?: string[] };
    return { ok: false, errors: body.errors ?? ['Request was rejected'] };
  }

  throw new Error(`POST ${BASE} failed with ${response.status}`);
}

export async function listUsage(subscriberId?: string): Promise<UsageRecord[]> {
  const url = subscriberId ? `${BASE}?subscriberId=${encodeURIComponent(subscriberId)}` : BASE;
  const response = await fetch(url);

  if (!response.ok) throw new Error(`GET ${url} failed with ${response.status}`);

  return (await response.json()) as UsageRecord[];
}

function toPayload(values: UsageFormValues): Record<UsageField, string | number> {
  return {
    subscriberId: values.subscriberId,
    callMinutes: toMetric(values.callMinutes),
    smsCount: toMetric(values.smsCount),
    dataUsageMB: toMetric(values.dataUsageMB),
  };
}

function toMetric(value: string): string | number {
  const trimmed = value.trim();
  if (trimmed === '') return '';

  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? trimmed : parsed;
}

export function errorsFor(errors: string[], field: UsageField): string[] {
  return errors.filter((error) => error.startsWith(`${field} `));
}

export function unmappedErrors(errors: string[]): string[] {
  return errors.filter(
    (error) => !USAGE_FIELDS.some(({ name }) => error.startsWith(`${name} `)),
  );
}

export async function loadUsage(
  subscriberId: string,
): Promise<{ all: UsageRecord[]; rows: UsageRecord[] }> {
  const [all, filtered] = await Promise.all([
    listUsage(),
    subscriberId ? listUsage(subscriberId) : Promise.resolve(null),
  ]);

  return { all, rows: filtered ?? all };
}
