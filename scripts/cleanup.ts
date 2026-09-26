import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";

const TARGET_DIR = join(__dirname, '..', 'snapshots');
const MAX_AGE_DAYS = 30;

async function cleanupSnapshots() {
    try {
        const files = await readdir(TARGET_DIR);
        const now = new Date();

        let removedCount = 0;
        let keptCount = 0;

        const deleteFiles = files.map(async (file) => {
            if (!file.startsWith('usage_') || !file.endsWith('.csv')) return;

            const fullPath = join(TARGET_DIR, file);

            try {
                const parts = file.split('_');

                const datePart = parts[1];
                const timeWithExt = parts[2].replace('.csv', '');

                const timePart = timeWithExt.substring(0, 8);
                const formattedTime = timePart.replaceAll('-', ':');

                const fileDate = new Date(`${datePart}T${formattedTime}`);
                if (Number.isNaN(fileDate.getTime())) return;

                const ageInMs = now.getTime() - fileDate.getTime();
                const ageInDays = ageInMs / (1000 * 60 * 60 * 24);

                if (ageInDays > MAX_AGE_DAYS) {
                    await unlink(fullPath);
                    removedCount++;
                } else keptCount++;
            } catch (error) {
                console.error('Delete files failed:', error instanceof Error ? error.message : error);
            }
        })

        await Promise.all(deleteFiles);

        console.log(`Cleanup complete: ${removedCount} files removed. ${keptCount} kept.`);
    } catch (error) {
        console.error('Cleanup failed:', error instanceof Error ? error.message : error);
    }
}

cleanupSnapshots();