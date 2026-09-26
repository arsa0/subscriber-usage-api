// Shape of a usage record as described in the brief.
export interface UsageInput {
  subscriberId: string;
  callMinutes: number;
  smsCount: number;
  dataUsageMB: number;
}

// A stored record. Q3 assumes the usage table carries a timestamp,
// so the API should attach one when a record is created.
export interface UsageRecord extends UsageInput {
  timestamp: string; // ISO 8601
}
