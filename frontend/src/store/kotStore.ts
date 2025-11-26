import { create } from "zustand";
import { KOT, KOTFilters } from "@/types/kot";
import { kotsApi } from "@/lib/api/kots";

interface KOTState {
  kots: KOT[];
  currentKOT: KOT | null;
  isLoading: boolean;
  error: string | null;
  filters: KOTFilters;

  // Actions
  fetchKOTs: (filters?: KOTFilters) => Promise<void>;
  getKOTById: (id: string) => Promise<KOT>;
  updateKOTStatus: (id: string, status: string) => Promise<KOT>;
  updateKOTItemStatus: (
    id: string,
    itemId: string,
    status: string
  ) => Promise<KOT>;
  getKOTsByOrder: (orderId: string) => Promise<KOT[]>;
  cleanupOldKOTs: () => Promise<void>;
  setFilters: (filters: KOTFilters) => void;
  setCurrentKOT: (kot: KOT | null) => void;
  clearError: () => void;
}

export const useKOTStore = create<KOTState>((set, get) => ({
  kots: [],
  currentKOT: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchKOTs: async (filters) => {
    set({ isLoading: true, error: null });
    if (filters) {
      set({ filters });
    }
    try {
      const kots = await kotsApi.getAll(filters || get().filters);
      set({ kots, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to fetch KOTs",
        isLoading: false,
      });
    }
  },

  getKOTById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const kot = await kotsApi.getById(id);
      set({ currentKOT: kot, isLoading: false });
      return kot;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to fetch KOT",
        isLoading: false,
      });
      throw error;
    }
  },

  updateKOTStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const updatedKOT = await kotsApi.updateStatus(id, status);
      set((state) => ({
        kots: state.kots.map((kot) => {
          const kotId = kot.id || (kot as any)._id;
          return kotId === id ? updatedKOT : kot;
        }),
        currentKOT:
          (state.currentKOT?.id || (state.currentKOT as any)?._id) === id
            ? updatedKOT
            : state.currentKOT,
        isLoading: false,
      }));
      return updatedKOT;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to update KOT status",
        isLoading: false,
      });
      throw error;
    }
  },

  updateKOTItemStatus: async (id, itemId, status) => {
    try {
      const updatedKOT = await kotsApi.updateItemStatus(id, itemId, status);
      set((state) => ({
        kots: state.kots.map((kot) => {
          const kotId = kot.id || (kot as any)._id;
          return kotId === id ? updatedKOT : kot;
        }),
        currentKOT:
          (state.currentKOT?.id || (state.currentKOT as any)?._id) === id
            ? updatedKOT
            : state.currentKOT,
      }));
      return updatedKOT;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message ||
          "Failed to update item status",
      });
      throw error;
    }
  },

  getKOTsByOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const kots = await kotsApi.getByOrder(orderId);
      set({ isLoading: false });
      return kots;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to fetch KOTs",
        isLoading: false,
      });
      throw error;
    }
  },

  cleanupOldKOTs: async () => {
    const today = new Date();
    const todayDateStr = today.toISOString().split("T")[0]; // Get YYYY-MM-DD format

    // Get last cleanup date from localStorage
    const lastCleanupKey = "last_kot_cleanup_date";
    const lastCleanup =
      typeof window !== "undefined"
        ? localStorage.getItem(lastCleanupKey)
        : null;

    // Only cleanup if it's a new day
    if (lastCleanup !== todayDateStr) {
      try {
        // Filter out KOTs that are not from today
        set((state) => ({
          kots: state.kots.filter((kot) => {
            const kotDate = new Date(kot.createdAt).toISOString().split("T")[0];
            return kotDate === todayDateStr;
          }),
          currentKOT:
            state.currentKOT &&
            new Date(state.currentKOT.createdAt).toISOString().split("T")[0] ===
              todayDateStr
              ? state.currentKOT
              : null,
        }));

        // Update last cleanup date
        if (typeof window !== "undefined") {
          localStorage.setItem(lastCleanupKey, todayDateStr);
        }

        console.log(`🧹 Cleaned up old KOTs. Today: ${todayDateStr}`);
      } catch (error) {
        console.error("Error cleaning up old KOTs:", error);
      }
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchKOTs(filters);
  },

  setCurrentKOT: (kot) => {
    set({ currentKOT: kot });
  },

  clearError: () => {
    set({ error: null });
  },
}));
