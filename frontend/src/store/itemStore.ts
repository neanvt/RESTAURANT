import { create } from "zustand";
import { Item, CreateItemDTO, UpdateItemDTO, ItemFilters } from "@/types/item";
import { itemsApi } from "@/lib/api/items";
import { cacheItems, getCachedItems } from "@/lib/db";
import { cacheDataForOffline } from "@/lib/pwa";

interface ItemState {
  items: Item[];
  selectedItem: Item | null;
  isLoading: boolean;
  error: string | null;
  filters: ItemFilters;

  // Actions
  fetchItems: (filters?: ItemFilters) => Promise<void>;
  fetchItemsWithPopularity: (filters?: ItemFilters) => Promise<void>;
  getItemById: (id: string) => Promise<Item>;
  createItem: (data: CreateItemDTO) => Promise<Item>;
  updateItem: (id: string, data: UpdateItemDTO) => Promise<Item>;
  deleteItem: (id: string) => Promise<void>;
  uploadImage: (id: string, file: File) => Promise<Item>;
  generateImage: (
    id: string,
    prompt?: string,
    async?: boolean
  ) => Promise<Item>;
  toggleFavourite: (id: string) => Promise<Item>;
  toggleAvailability: (id: string) => Promise<Item>;
  updateStock: (id: string, quantity: number) => Promise<Item>;
  setFilters: (filters: ItemFilters) => void;
  setSelectedItem: (item: Item | null) => void;
  clearError: () => void;
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchItems: async (filters) => {
    set({ isLoading: true, error: null });
    if (filters) {
      set({ filters });
    }
    try {
      const currentFilters = filters || get().filters;
      // Ensure we have required fields for the backend
      const enhancedFilters = {
        ...currentFilters,
        isAvailable: currentFilters.isAvailable !== undefined ? currentFilters.isAvailable : true
      };
      
      const rawItems = await itemsApi.getAll(enhancedFilters);
      
      // Normalize items for consistent id field
      const normalizedItems = rawItems.map(item => ({
        ...item,
        id: item.id || item._id,
        _id: undefined
      })).filter(item => item.id);
      
      set({ items: normalizedItems, isLoading: false });

      // Cache normalized items for offline use
      await cacheItems(normalizedItems);
      await cacheDataForOffline("items", normalizedItems);
    } catch (error: any) {
      // Try to load from cache if offline
      const cachedItems = await getCachedItems();
      if (cachedItems.length > 0) {
        set({ items: cachedItems, isLoading: false });
        console.log("📦 Loaded items from cache (offline)");
      } else {
        set({
          error:
            error.response?.data?.error?.message || "Failed to fetch items",
          isLoading: false,
        });
      }
    }
  },

  fetchItemsWithPopularity: async (filters) => {
    set({ isLoading: true, error: null });
    if (filters) {
      set({ filters });
    }
    try {
      const currentFilters = filters || get().filters;
      // Ensure we have required fields for the backend
      const enhancedFilters = {
        ...currentFilters,
        isAvailable: currentFilters.isAvailable !== undefined ? currentFilters.isAvailable : true
      };
      
      const rawItems = await itemsApi.getAllWithPopularity(enhancedFilters);
      
      // Normalize items to ensure consistent id field for both state and cache
      const normalizedItems = rawItems.map(item => ({
        ...item,
        id: item.id || item._id, // Ensure id field exists
        _id: undefined // Remove _id to avoid confusion
      })).filter(item => item.id); // Only include items with valid ids
      
      set({ items: normalizedItems, isLoading: false });

      // Cache normalized items for offline use
      await cacheItems(normalizedItems);
      await cacheDataForOffline("items", normalizedItems);
    } catch (error: any) {
      console.error("Popularity sort failed:", error);
      console.log("Error details:", error.response?.data);
      console.log("Popularity sort failed, falling back to regular fetch");
      // Fallback to regular fetch if popularity sorting fails
      try {
        const currentFilters = filters || get().filters;
        const enhancedFilters = {
          ...currentFilters,
          isAvailable: currentFilters.isAvailable !== undefined ? currentFilters.isAvailable : true
        };
        const rawItems = await itemsApi.getAll(enhancedFilters);
        
        // Normalize items for consistent id field
        const normalizedItems = rawItems.map(item => ({
          ...item,
          id: item.id || item._id,
          _id: undefined
        })).filter(item => item.id);
        
        set({ items: normalizedItems, isLoading: false });
        await cacheItems(normalizedItems);
        await cacheDataForOffline("items", normalizedItems);
      } catch (fallbackError: any) {
        // Try to load from cache if offline
        const cachedItems = await getCachedItems();
        if (cachedItems.length > 0) {
          set({ items: cachedItems, isLoading: false });
          console.log("📦 Loaded items from cache (offline)");
        } else {
          set({
            error:
              fallbackError.response?.data?.error?.message || "Failed to fetch items",
            isLoading: false,
          });
        }
      }
    }
  },

  getItemById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const item = await itemsApi.getById(id);
      set({ selectedItem: item, isLoading: false });
      return item;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to fetch item",
        isLoading: false,
      });
      throw error;
    }
  },

  createItem: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newItem = await itemsApi.create(data);
      set((state) => ({
        items: [...state.items, newItem],
        isLoading: false,
      }));
      return newItem;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to create item",
        isLoading: false,
      });
      throw error;
    }
  },

  updateItem: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItem = await itemsApi.update(id, data);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updatedItem : item)),
        selectedItem:
          state.selectedItem?.id === id ? updatedItem : state.selectedItem,
        isLoading: false,
      }));
      return updatedItem;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to update item",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await itemsApi.delete(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to delete item",
        isLoading: false,
      });
      throw error;
    }
  },

  uploadImage: async (id, file) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItem = await itemsApi.uploadImage(id, file);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updatedItem : item)),
        selectedItem:
          state.selectedItem?.id === id ? updatedItem : state.selectedItem,
        isLoading: false,
      }));
      return updatedItem;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to upload image",
        isLoading: false,
      });
      throw error;
    }
  },

  generateImage: async (id, prompt, async) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItem = await itemsApi.generateImage(id, prompt, async);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updatedItem : item)),
        selectedItem:
          state.selectedItem?.id === id ? updatedItem : state.selectedItem,
        isLoading: false,
      }));
      return updatedItem;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to generate image",
        isLoading: false,
      });
      throw error;
    }
  },

  toggleFavourite: async (id) => {
    try {
      const updatedItem = await itemsApi.toggleFavourite(id);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updatedItem : item)),
        selectedItem:
          state.selectedItem?.id === id ? updatedItem : state.selectedItem,
      }));
      return updatedItem;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to toggle favourite",
      });
      throw error;
    }
  },

  toggleAvailability: async (id) => {
    try {
      const updatedItem = await itemsApi.toggleAvailability(id);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updatedItem : item)),
        selectedItem:
          state.selectedItem?.id === id ? updatedItem : state.selectedItem,
      }));
      return updatedItem;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message ||
          "Failed to toggle availability",
      });
      throw error;
    }
  },

  updateStock: async (id, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItem = await itemsApi.updateStock(id, quantity);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updatedItem : item)),
        selectedItem:
          state.selectedItem?.id === id ? updatedItem : state.selectedItem,
        isLoading: false,
      }));
      return updatedItem;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to update stock",
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchItems(filters);
  },

  setSelectedItem: (item) => {
    set({ selectedItem: item });
  },

  clearError: () => {
    set({ error: null });
  },
}));
