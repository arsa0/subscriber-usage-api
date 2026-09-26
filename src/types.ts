export interface UsageInput {
  subscriberId: string;
  callMinutes: number;
  smsCount: number;
  dataUsageMB: number;
}

export interface UsageRecord extends UsageInput {
  timestamp: string; // ISO 8601
}
