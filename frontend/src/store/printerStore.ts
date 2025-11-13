import { create } from "zustand";

export interface Printer {
  _id: string;
  name: string;
  ipAddress: string;
  port: number;
  type: "receipt" | "kot" | "label";
  paperSize: "58mm" | "80mm";
  isDefault: boolean;
  isOnline: boolean;
  outlet: string;
  createdAt: string;
  updatedAt: string;
}

interface PrinterState {
  printers: Printer[];
  isLoading: boolean;
  error: string | null;

  fetchPrinters: () => Promise<void>;
  createPrinter: (data: any) => Promise<Printer>;
  updatePrinter: (id: string, data: any) => Promise<Printer>;
  deletePrinter: (id: string) => Promise<void>;
  testPrinter: (id: string) => Promise<void>;
  clearError: () => void;
}

export const usePrinterStore = create<PrinterState>((set) => ({
  printers: [],
  isLoading: false,
  error: null,

  fetchPrinters: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      const mockPrinters: Printer[] = [
        {
          _id: "1",
          name: "Main Receipt Printer",
          ipAddress: "192.168.1.100",
          port: 9100,
          type: "receipt",
          paperSize: "80mm",
          isDefault: true,
          isOnline: true,
          outlet: "outlet1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      set({ printers: mockPrinters, isLoading: false });
    } catch (error: any) {
      set({ error: "Failed to fetch printers", isLoading: false });
    }
  },

  createPrinter: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newPrinter: Printer = {
        _id: Date.now().toString(),
        ...data,
        isOnline: false,
        outlet: "outlet1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({
        printers: [...state.printers, newPrinter],
        isLoading: false,
      }));
      return newPrinter;
    } catch (error: any) {
      set({ error: "Failed to create printer", isLoading: false });
      throw error;
    }
  },

  updatePrinter: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      set((state) => ({
        printers: state.printers.map((p) =>
          p._id === id
            ? { ...p, ...data, updatedAt: new Date().toISOString() }
            : p
        ),
        isLoading: false,
      }));
      return {} as Printer;
    } catch (error: any) {
      set({ error: "Failed to update printer", isLoading: false });
      throw error;
    }
  },

  deletePrinter: async (id) => {
    set({ isLoading: true, error: null });
    try {
      set((state) => ({
        printers: state.printers.filter((p) => p._id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: "Failed to delete printer", isLoading: false });
      throw error;
    }
  },

  testPrinter: async (id) => {
    try {
      // Simulate test print
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: any) {
      throw new Error("Failed to test printer");
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
