import { openDB } from 'idb';

const DB_NAME = 'prospera-share';
const STORE_NAME = 'shared-files';
const KEY = 'latest-share';

async function getDb() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
}

export const checkPendingShare = async (): Promise<File | null> => {
    try {
        const db = await getDb();
        const file = await db.get(STORE_NAME, KEY);

        if (file) {
            // Clear after reading so we don't process it again
            await db.delete(STORE_NAME, KEY);
            return file;
        }
    } catch (error) {
        // Silently fail if IndexedDB is not available
    }
    return null;
};
