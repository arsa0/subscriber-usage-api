import { describe, expect, it } from 'vitest';
import { getTotalUsageMB } from '../q4/getTotalUsageMB';

describe('getTotalUsageMB', () => {
  it('handles an empty array', () => {
    expect(getTotalUsageMB([])).toBe(0)
  });

  it('handles a single record', () => {
    expect(getTotalUsageMB([{ dataUsageMB: 1500 }])).toBe(1500)
  });

  it('sums multiple records', () => {
    expect(getTotalUsageMB([
      { dataUsageMB: 1500 },
      { dataUsageMB: 1000 },
      { dataUsageMB: 2500 }
    ])).toBe(5000)
  });
});