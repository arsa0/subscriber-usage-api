export interface UsageRecord {
  subscriberId: string;
  callMinutes: number;
  smsCount: number;
  dataUsageMB: number;
  timestamp: string;
}

export const USAGE_FIELDS = [
  { name: 'subscriberId', label: 'Subscriber ID', type: 'text' },
  { name: 'callMinutes', label: 'Call minutes', type: 'number' },
  { name: 'smsCount', label: 'SMS count', type: 'number' },
  { name: 'dataUsageMB', label: 'Data usage (MB)', type: 'number' },
] as const;

export type UsageField = (typeof USAGE_FIELDS)[number]['name'];

export type UsageFormValues = Record<UsageField, string>;

export const EMPTY_FORM: UsageFormValues = {
  subscriberId: '',
  callMinutes: '',
  smsCount: '',
  dataUsageMB: '',
};
