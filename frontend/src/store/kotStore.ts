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
