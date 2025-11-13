import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Outlet } from "@/types/outlet";
import * as outletApi from "@/lib/api/outlets";

interface OutletState {
  outlets: Outlet[];
  currentOutlet: Outlet | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOutlets: () => Promise<void>;
  fetchCurrentOutlet: () => Promise<void>;
  setCurrentOutlet: (outlet: Outlet | null) => void;
  selectOutlet: (outletId: string) => Promise<void>;
  createOutlet: (data: any) => Promise<Outlet>;
  updateOutlet: (id: string, data: any) => Promise<Outlet>;
  deleteOutlet: (id: string) => Promise<void>;
  uploadLogo: (id: string, file: File) => Promise<Outlet>;
  deleteLogo: (id: string) => Promise<Outlet>;
  clearError: () => void;
}

export const useOutletStore = create<OutletState>()(
  persist(
    (set, get) => ({
      outlets: [],
      currentOutlet: null,
      isLoading: false,
      error: null,

      fetchOutlets: async () => {
        set({ isLoading: true, error: null });
        try {
          const outlets = await outletApi.getAllOutlets();
          set({ outlets, isLoading: false });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.error?.message || "Failed to fetch outlets",
            isLoading: false,
          });
        }
      },

      fetchCurrentOutlet: async () => {
        set({ isLoading: true, error: null });
        try {
          const outlet = await outletApi.getCurrentOutlet();
          set({ currentOutlet: outlet, isLoading: false });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.error?.message ||
              "Failed to fetch current outlet",
            isLoading: false,
          });
        }
      },

      setCurrentOutlet: (outlet) => {
        set({ currentOutlet: outlet });
      },

      selectOutlet: async (outletId: string) => {
        set({ isLoading: true, error: null });
        try {
          const outlet = await outletApi.selectOutlet(outletId);
          set({ currentOutlet: outlet, isLoading: false });

          // Refresh outlets list
          await get().fetchOutlets();
        } catch (error: any) {
          set({
            error:
              error.response?.data?.error?.message || "Failed to select outlet",
            isLoading: false,
          });
          throw error;
        }
      },

      createOutlet: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const outlet = await outletApi.createOutlet(data);

          // Add to outlets list
          set((state) => ({
            outlets: [...state.outlets, outlet],
            isLoading: false,
          }));

          // If this is the first outlet, set it as current
          if (get().outlets.length === 1) {
            set({ currentOutlet: outlet });
          }

          return outlet;
        } catch (error: any) {
          set({
            error:
              error.response?.data?.error?.message || "Failed to create outlet",
            isLoading: false,
          });
          throw error;
        }
      },

      updateOutlet: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const updatedOutlet = await outletApi.updateOutlet(id, data);

          // Update in outlets list
          set((state) => ({
            outlets: state.outlets.map((outlet) =>
              outlet._id === id ? updatedOutlet : outlet
            ),
            // Update current outlet if it's the one being updated
            currentOutlet:
              state.currentOutlet?._id === id
                ? updatedOutlet
                : state.currentOutlet,
            isLoading: false,
          }));

          return updatedOutlet;
        } catch (error: any) {
          set({
            error:
              error.response?.data?.error?.message || "Failed to update outlet",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteOutlet: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await outletApi.deleteOutlet(id);

          // Remove from outlets list
          set((state) => {
            const newOutlets = state.outlets.filter(
              (outlet) => outlet._id !== id
            );

            // If deleted outlet was current, set first available outlet as current
            let newCurrentOutlet = state.currentOutlet;
            if (state.currentOutlet?._id === id) {
              newCurrentOutlet = newOutlets.length > 0 ? newOutlets[0] : null;
            }

            return {
              outlets: newOutlets,
              currentOutlet: newCurrentOutlet,
              isLoading: false,
            };
          });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.error?.message || "Failed to delete outlet",
            isLoading: false,
          });
          throw error;
        }
      },

      uploadLogo: async (id, file) => {
        set({ isLoading: true, error: null });
        try {
          const updatedOutlet = await outletApi.uploadOutletLogo(id, file);

          // Update in outlets list
          set((state) => ({
            outlets: state.outlets.map((outlet) =>
              outlet._id === id ? updatedOutlet : outlet
            ),
            // Update current outlet if it's the one being updated
            currentOutlet:
              state.currentOutlet?._id === id
                ? updatedOutlet
                : state.currentOutlet,
            isLoading: false,
          }));

          return updatedOutlet;
        } catch (error: any) {
          set({
            error:
              error.response?.data?.error?.message || "Failed to upload logo",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteLogo: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const updatedOutlet = await outletApi.deleteOutletLogo(id);

          // Update in outlets list
          set((state) => ({
            outlets: state.outlets.map((outlet) =>
              outlet._id === id ? updatedOutlet : outlet
            ),
            // Update current outlet if it's the one being updated
            currentOutlet:
              state.currentOutlet?._id === id
                ? updatedOutlet
                : state.currentOutlet,
            isLoading: false,
          }));

          return updatedOutlet;
        } catch (error: any) {
          set({
            error:
              error.response?.data?.error?.message || "Failed to delete logo",
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "outlet-storage",
      partialize: (state) => ({
        currentOutlet: state.currentOutlet,
      }),
    }
  )
);
