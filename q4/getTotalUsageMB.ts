// Q4: original implementation, kept for reference.
// function getTotalUsageMB(records) {
//   return records.reduce((total, record) => {
//     total += record.dataUsageMB;
//   });
// }

import { UsageInput } from '../src/types';

export function getTotalUsageMB(records: Pick<UsageInput, 'dataUsageMB'>[]): number {
  return records.reduce((total, record) => total + record.dataUsageMB, 0);
}