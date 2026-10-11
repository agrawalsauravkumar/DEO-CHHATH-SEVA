import { MapFacility, OfficialAnnouncement } from '../types';

const DATABASE_NAME = 'deo-chhath-seva-offline-v4';
const DATABASE_VERSION = 2;
const FACILITIES_STORE = 'verified-facilities';
const METADATA_STORE = 'metadata';
const ACTIONS_STORE = 'pending-actions';
const ANNOUNCEMENTS_STORE = 'verified-announcements';
const PRIVATE_DATA_STORE = 'private-user-data';

export interface CachedAnnouncement extends OfficialAnnouncement {
  expiresAt: string;
}

export interface OfflineAnnouncementSnapshot {
  announcements: CachedAnnouncement[];
  version: string;
  syncedAt: number;
}

export interface OfflineFacilitySnapshot {
  facilities: MapFacility[];
  version: string;
  syncedAt: number;
}

export interface QueuedOfflineAction {
  id: string;
  type: string;
  payload: unknown;
  createdAt: number;
  attempts: number;
  nextAttemptAt: number;
}

let databasePromise: Promise<IDBDatabase> | null = null;

const openDatabase = (): Promise<IDBDatabase> => {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('इस ब्राउज़र में स्थानीय IndexedDB उपलब्ध नहीं है।'));
  }
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(FACILITIES_STORE)) {
        database.createObjectStore(FACILITIES_STORE, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(METADATA_STORE)) {
        database.createObjectStore(METADATA_STORE, { keyPath: 'key' });
      }
      if (!database.objectStoreNames.contains(ACTIONS_STORE)) {
        database.createObjectStore(ACTIONS_STORE, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(ANNOUNCEMENTS_STORE)) {
        database.createObjectStore(ANNOUNCEMENTS_STORE, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(PRIVATE_DATA_STORE)) {
        database.createObjectStore(PRIVATE_DATA_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      databasePromise = null;
      reject(request.error || new Error('स्थानीय डेटा संग्रहण नहीं खुल सका।'));
    };
    request.onblocked = () => {
      databasePromise = null;
      reject(new Error('स्थानीय डेटा अपडेट रुका हुआ है। अन्य खुले ऐप टैब बंद करके पुनः प्रयास करें।'));
    };
  });
  return databasePromise;
};

const transactionDone = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error('स्थानीय डेटा लिखना रद्द हुआ।'));
    transaction.onerror = () => reject(transaction.error || new Error('स्थानीय डेटा लिखना विफल हुआ।'));
  });

const readRequest = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('स्थानीय डेटा पढ़ा नहीं जा सका।'));
  });

export const OfflineDataService = {
  async saveVerifiedFacilities(
    facilities: MapFacility[],
    version = '1'
  ): Promise<OfflineFacilitySnapshot> {
    const database = await openDatabase();
    const transaction = database.transaction([FACILITIES_STORE, METADATA_STORE], 'readwrite');
    const done = transactionDone(transaction);
    const facilityStore = transaction.objectStore(FACILITIES_STORE);
    facilityStore.clear();
    facilities.forEach((facility) => facilityStore.put(facility));
    const snapshot: OfflineFacilitySnapshot = {
      facilities,
      version,
      syncedAt: Date.now(),
    };
    transaction.objectStore(METADATA_STORE).put({
      key: 'facility-snapshot',
      version: snapshot.version,
      syncedAt: snapshot.syncedAt,
    });
    await done;
    return snapshot;
  },

  async getVerifiedFacilities(): Promise<OfflineFacilitySnapshot | null> {
    const database = await openDatabase();
    const transaction = database.transaction([FACILITIES_STORE, METADATA_STORE], 'readonly');
    const done = transactionDone(transaction);
    const facilitiesRequest = transaction.objectStore(FACILITIES_STORE).getAll() as IDBRequest<MapFacility[]>;
    const metadataRequest = transaction.objectStore(METADATA_STORE).get('facility-snapshot');
    const [facilities, metadata] = await Promise.all([
      readRequest(facilitiesRequest),
      readRequest<{ version: string; syncedAt: number } | undefined>(metadataRequest),
    ]);
    await done;
    if (!metadata) return null;
    return {
      facilities,
      version: metadata.version,
      syncedAt: metadata.syncedAt,
    };
  },

  async saveVerifiedAnnouncements(
    announcements: CachedAnnouncement[],
    version: string
  ): Promise<OfflineAnnouncementSnapshot> {
    const database = await openDatabase();
    const transaction = database.transaction([ANNOUNCEMENTS_STORE, METADATA_STORE], 'readwrite');
    const done = transactionDone(transaction);
    const store = transaction.objectStore(ANNOUNCEMENTS_STORE);
    store.clear();
    announcements.forEach((announcement) => store.put(announcement));
    const snapshot: OfflineAnnouncementSnapshot = {
      announcements,
      version,
      syncedAt: Date.now(),
    };
    transaction.objectStore(METADATA_STORE).put({
      key: 'announcement-snapshot',
      version,
      syncedAt: snapshot.syncedAt,
    });
    await done;
    return snapshot;
  },

  async getVerifiedAnnouncements(): Promise<OfflineAnnouncementSnapshot | null> {
    const database = await openDatabase();
    const transaction = database.transaction([ANNOUNCEMENTS_STORE, METADATA_STORE], 'readonly');
    const done = transactionDone(transaction);
    const announcementsRequest = transaction.objectStore(ANNOUNCEMENTS_STORE).getAll() as IDBRequest<CachedAnnouncement[]>;
    const metadataRequest = transaction.objectStore(METADATA_STORE).get('announcement-snapshot');
    const [announcements, metadata] = await Promise.all([
      readRequest(announcementsRequest),
      readRequest<{ version: string; syncedAt: number } | undefined>(metadataRequest),
    ]);
    await done;
    if (!metadata) return null;
    return {
      announcements: announcements.filter((item) => Date.parse(item.expiresAt) > Date.now()),
      version: metadata.version,
      syncedAt: metadata.syncedAt,
    };
  },

  async recordSuccessfulSync(version: string): Promise<number> {
    const database = await openDatabase();
    const transaction = database.transaction(METADATA_STORE, 'readwrite');
    const done = transactionDone(transaction);
    const syncedAt = Date.now();
    transaction.objectStore(METADATA_STORE).put({
      key: 'last-successful-sync',
      version,
      syncedAt,
    });
    await done;
    return syncedAt;
  },

  async getLastSuccessfulSync(): Promise<number | null> {
    const database = await openDatabase();
    const transaction = database.transaction(METADATA_STORE, 'readonly');
    const done = transactionDone(transaction);
    const metadata = await readRequest<{ syncedAt?: number } | undefined>(
      transaction.objectStore(METADATA_STORE).get('last-successful-sync')
    );
    await done;
    return typeof metadata?.syncedAt === 'number' ? metadata.syncedAt : null;
  },

  async enqueueAction(action: Omit<QueuedOfflineAction, 'createdAt' | 'attempts' | 'nextAttemptAt'>): Promise<void> {
    const database = await openDatabase();
    const transaction = database.transaction(ACTIONS_STORE, 'readwrite');
    const store = transaction.objectStore(ACTIONS_STORE);
    const done = transactionDone(transaction);
    await new Promise<void>((resolve, reject) => {
      const request = store.get(action.id);
      request.onsuccess = () => {
        if (!request.result) {
          store.add({
            ...action,
            createdAt: Date.now(),
            attempts: 0,
            nextAttemptAt: Date.now(),
          } satisfies QueuedOfflineAction);
        }
        resolve();
      };
      request.onerror = () => reject(request.error || new Error('ऑफ़लाइन अनुरोध कतार में नहीं जुड़ा।'));
    });
    await done;
  },

  async getPendingActions(): Promise<QueuedOfflineAction[]> {
    const database = await openDatabase();
    const transaction = database.transaction(ACTIONS_STORE, 'readonly');
    const done = transactionDone(transaction);
    const actions = await readRequest(
      transaction.objectStore(ACTIONS_STORE).getAll() as IDBRequest<QueuedOfflineAction[]>
    );
    await done;
    return actions.sort((a, b) => a.createdAt - b.createdAt);
  },

  async updateActionRetry(id: string, attempts: number, nextAttemptAt: number): Promise<void> {
    const database = await openDatabase();
    const transaction = database.transaction(ACTIONS_STORE, 'readwrite');
    const done = transactionDone(transaction);
    const store = transaction.objectStore(ACTIONS_STORE);
    const action = await readRequest<QueuedOfflineAction | undefined>(store.get(id));
    if (action) store.put({ ...action, attempts, nextAttemptAt });
    await done;
  },

  async removePendingAction(id: string): Promise<void> {
    const database = await openDatabase();
    const transaction = database.transaction(ACTIONS_STORE, 'readwrite');
    const done = transactionDone(transaction);
    transaction.objectStore(ACTIONS_STORE).delete(id);
    await done;
  },

  async savePrivateValue<T>(key: string, value: T): Promise<void> {
    const database = await openDatabase();
    const transaction = database.transaction(PRIVATE_DATA_STORE, 'readwrite');
    const done = transactionDone(transaction);
    transaction.objectStore(PRIVATE_DATA_STORE).put({ key, value });
    await done;
  },

  async getPrivateValue<T>(key: string): Promise<T | null> {
    const database = await openDatabase();
    const transaction = database.transaction(PRIVATE_DATA_STORE, 'readonly');
    const done = transactionDone(transaction);
    const record = await readRequest<{ value: T } | undefined>(
      transaction.objectStore(PRIVATE_DATA_STORE).get(key)
    );
    await done;
    return record?.value ?? null;
  },

  async deletePrivateValue(key: string): Promise<void> {
    const database = await openDatabase();
    const transaction = database.transaction(PRIVATE_DATA_STORE, 'readwrite');
    const done = transactionDone(transaction);
    transaction.objectStore(PRIVATE_DATA_STORE).delete(key);
    await done;
  },
};
