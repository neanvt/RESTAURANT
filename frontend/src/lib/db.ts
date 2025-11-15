/**
 * IndexedDB utility for offline PWA functionality
 * Stores items, orders, expenses locally and syncs when online
 */

const DB_NAME = "test";
const DB_VERSION = 1;

interface DBStores {
  items: "id";
  categories: "id";
  orders: "id";
  expenses: "id";
  outlets: "id";
  syncQueue: "id";
}

interface SyncQueueItem {
  id: string;
  type: "order" | "expense";
  action: "create" | "update";
  data: any;
  timestamp: number;
  synced: boolean;
}

class Database {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains("items")) {
          db.createObjectStore("items", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("categories")) {
          db.createObjectStore("categories", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("orders")) {
          const orderStore = db.createObjectStore("orders", { keyPath: "id" });
          orderStore.createIndex("createdAt", "createdAt", { unique: false });
        }
        if (!db.objectStoreNames.contains("expenses")) {
          const expenseStore = db.createObjectStore("expenses", {
            keyPath: "id",
          });
          expenseStore.createIndex("createdAt", "createdAt", { unique: false });
        }
        if (!db.objectStoreNames.contains("outlets")) {
          db.createObjectStore("outlets", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("syncQueue")) {
          const syncStore = db.createObjectStore("syncQueue", {
            keyPath: "id",
          });
          syncStore.createIndex("synced", "synced", { unique: false });
        }
      };
    });
  }

  // Generic CRUD operations
  async add<T>(storeName: keyof DBStores, data: T): Promise<void> {
    await this.init();
    const tx = this.db!.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    await store.add(data);
  }

  async put<T>(storeName: keyof DBStores, data: T): Promise<void> {
    await this.init();
    const tx = this.db!.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    await store.put(data);
  }

  async get<T>(storeName: keyof DBStores, id: string): Promise<T | undefined> {
    await this.init();
    const tx = this.db!.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: keyof DBStores): Promise<T[]> {
    await this.init();
    const tx = this.db!.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: keyof DBStores, id: string): Promise<void> {
    await this.init();
    const tx = this.db!.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    await store.delete(id);
  }

  async clear(storeName: keyof DBStores): Promise<void> {
    await this.init();
    const tx = this.db!.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    await store.clear();
  }

  // Bulk operations for syncing
  async bulkPut<T>(storeName: keyof DBStores, items: T[]): Promise<void> {
    await this.init();
    const tx = this.db!.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    for (const item of items) {
      await store.put(item);
    }
  }

  // Sync queue operations
  async addToSyncQueue(
    item: Omit<SyncQueueItem, "id" | "timestamp" | "synced">
  ): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: `${item.type}_${Date.now()}_${Math.random()}`,
      ...item,
      timestamp: Date.now(),
      synced: false,
    };
    await this.put("syncQueue", queueItem);
  }

  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    await this.init();
    const tx = this.db!.transaction("syncQueue", "readonly");
    const store = tx.objectStore("syncQueue");
    const index = store.index("synced");

    return new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.only(false));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markSynced(id: string): Promise<void> {
    const item = await this.get<SyncQueueItem>("syncQueue", id);
    if (item) {
      item.synced = true;
      await this.put("syncQueue", item);
    }
  }

  async clearSyncedItems(): Promise<void> {
    const items = await this.getAll<SyncQueueItem>("syncQueue");
    const tx = this.db!.transaction("syncQueue", "readwrite");
    const store = tx.objectStore("syncQueue");

    for (const item of items) {
      if (item.synced) {
        await store.delete(item.id);
      }
    }
  }
}

// Singleton instance
export const db = new Database();

// Helper functions for specific operations

/**
 * Cache items from API
 */
export async function cacheItems(items: any[]): Promise<void> {
  await db.bulkPut("items", items);
}

/**
 * Get cached items (for offline use)
 */
export async function getCachedItems(): Promise<any[]> {
  return db.getAll("items");
}

/**
 * Cache categories from API
 */
export async function cacheCategories(categories: any[]): Promise<void> {
  await db.bulkPut("categories", categories);
}

/**
 * Get cached categories (for offline use)
 */
export async function getCachedCategories(): Promise<any[]> {
  return db.getAll("categories");
}

/**
 * Save order offline (will sync when online)
 */
export async function saveOrderOffline(order: any): Promise<void> {
  const orderWithId = {
    ...order,
    id: order.id || `offline_${Date.now()}`,
    createdAt: order.createdAt || new Date().toISOString(),
    isOffline: true,
  };

  await db.put("orders", orderWithId);
  await db.addToSyncQueue({
    type: "order",
    action: "create",
    data: orderWithId,
  });
}

/**
 * Save expense offline (will sync when online)
 */
export async function saveExpenseOffline(expense: any): Promise<void> {
  const expenseWithId = {
    ...expense,
    id: expense.id || `offline_${Date.now()}`,
    createdAt: expense.createdAt || new Date().toISOString(),
    isOffline: true,
  };

  await db.put("expenses", expenseWithId);
  await db.addToSyncQueue({
    type: "expense",
    action: "create",
    data: expenseWithId,
  });
}

/**
 * Get all offline orders
 */
export async function getOfflineOrders(): Promise<any[]> {
  const orders = await db.getAll("orders");
  return orders.filter((o: any) => o.isOffline);
}

/**
 * Get all offline expenses
 */
export async function getOfflineExpenses(): Promise<any[]> {
  const expenses = await db.getAll("expenses");
  return expenses.filter((e: any) => e.isOffline);
}

/**
 * Sync pending items to server
 */
export async function syncToServer(apiClient: any): Promise<void> {
  const pending = await db.getPendingSyncItems();

  for (const item of pending) {
    try {
      if (item.type === "order") {
        await apiClient.post("/orders", item.data);
      } else if (item.type === "expense") {
        await apiClient.post("/expenses", item.data);
      }

      await db.markSynced(item.id);

      // Remove offline flag from local data
      const localData = await db.get(
        item.type === "order" ? "orders" : "expenses",
        item.data.id
      );
      if (localData) {
        delete (localData as any).isOffline;
        await db.put(item.type === "order" ? "orders" : "expenses", localData);
      }
    } catch (error) {
      console.error(`Failed to sync ${item.type}:`, error);
      // Will retry next time
    }
  }

  // Clean up synced items
  await db.clearSyncedItems();
}

/**
 * Check if app is online
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}

/**
 * Initialize offline support
 */
export async function initOfflineSupport(): Promise<void> {
  await db.init();

  // Listen for online event to trigger sync
  if (typeof window !== "undefined") {
    window.addEventListener("online", async () => {
      console.log("🌐 Back online - syncing data...");
      // Sync will be triggered by components using api client
    });

    window.addEventListener("offline", () => {
      console.log("📡 Offline mode - changes will sync when online");
    });
  }
}
