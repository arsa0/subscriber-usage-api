import { UsageInput, UsageRecord } from '../types';

const records: UsageRecord[] = [];

export function createUsage(input: UsageInput): Readonly<UsageRecord> {
  const record = Object.freeze({
    ...input, timestamp: new Date().toISOString()
  });
  records.push(record);

  return record;
}

export function listUsage(filter?: { subscriberId?: string }): UsageRecord[] {
  if (filter?.subscriberId) return records.filter(record => record.subscriberId === filter.subscriberId);
  return [...records];
}

export function resetStore(): void {
  records.length = 0;
}
