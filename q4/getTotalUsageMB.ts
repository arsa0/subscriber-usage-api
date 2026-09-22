// Q4: original implementation, kept for reference.
//
// function getTotalUsageMB(records) {
//   return records.reduce((total, record) => {
//     total += record.dataUsageMB;
//   });
// }

import { UsageInput } from '../src/types';

export function getTotalUsageMB(_records: Pick<UsageInput, 'dataUsageMB'>[]): number {
  // TODO: fix
  throw new Error('Not implemented');
}
