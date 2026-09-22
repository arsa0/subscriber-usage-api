import { UsageInput, UsageRecord } from '../types';

// In-memory store. Contents are lost when the process restarts.
const records: UsageRecord[] = [];

export function createUsage(_input: UsageInput): UsageRecord {
  // TODO
  throw new Error('Not implemented');
}

export function listUsage(_filter?: { subscriberId?: string }): UsageRecord[] {
  // TODO
  throw new Error('Not implemented');
}

// Test helper: clears the store between tests.
export function resetStore(): void {
  records.length = 0;
}
