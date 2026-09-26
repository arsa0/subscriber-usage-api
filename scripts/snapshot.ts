import cron from 'node-cron';

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { UsageRecord } from '../src/types';

const PORT = process.env.PORT ?? 3000;
const API_URL = `http://localhost:${PORT}/usage`;
const SNAPSHOT_DIR = join(__dirname, '..', 'snapshots');
const COLUMNS = ['subscriberId', 'callMinutes', 'smsCount', 'dataUsageMB', 'timestamp'] as const;

function snapshotFilename(date = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `usage_${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
        `_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}.csv`;
}

function escapeCsv(value: string | number): string {
    const str = String(value);

    const needsQuoting =
        str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r');

    if (!needsQuoting) return str;

    return '"' + str.replaceAll('"', '""') + '"';
}

function toCsv(records: UsageRecord[]): string {
    const header = COLUMNS.join(',');
    const rows = records.map(r => COLUMNS.map(c => escapeCsv(r[c])).join(','));
    return [header, ...rows].join('\n');
}

async function takeSnapshot() {
    try {
        const res = await fetch(API_URL);

        if (!res.ok) {
            console.error(`Snapshot failed: API returned ${res.status}`);
            return;
        };
        const records = await res.json() as UsageRecord[];

        const csv = toCsv(records);
        const filename = snapshotFilename();

        await mkdir(SNAPSHOT_DIR, { recursive: true });
        await writeFile(join(SNAPSHOT_DIR, filename), csv, 'utf-8');

        console.log(`Snapshot written: ${filename} (${records.length} records)`);
    } catch (error) {
        console.error('Snapshot failed:', error instanceof Error ? error.message : error);
    }
}

const runOnce = process.argv.includes('--once');

if (runOnce) takeSnapshot();
else {
    cron.schedule('0 8,12,15 * * *', async () => {
        await takeSnapshot();
    }, {
        timezone: 'Asia/Jakarta',
    });
};