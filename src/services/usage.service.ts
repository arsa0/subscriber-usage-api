import { UsageInput, UsageRecord } from '../types';

// In-memory store. Contents are lost when the process restarts.
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

// Test helper: clears the store between tests.
export function resetStore(): void {
  records.length = 0;
}
