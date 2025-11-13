import { create } from "zustand";
import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "@/types/category";
import { categoriesApi } from "@/lib/api/categories";

interface CategoryState {
  categories: Category[];
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryDTO) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryDTO) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categoryIds: string[]) => Promise<void>;
  selectCategory: (categoryId: string | null) => void;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoriesApi.getAll();
      set({ categories, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to fetch categories",
        isLoading: false,
      });
    }
  },

  createCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await categoriesApi.create(data);
      set((state) => ({
        categories: [...state.categories, newCategory],
        isLoading: false,
      }));
      return newCategory;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to create category",
        isLoading: false,
      });
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCategory = await categoriesApi.update(id, data);
      set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === id ? updatedCategory : cat
        ),
        isLoading: false,
      }));
      return updatedCategory;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to update category",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await categoriesApi.delete(id);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
        selectedCategory:
          state.selectedCategory === id ? null : state.selectedCategory,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to delete category",
        isLoading: false,
      });
      throw error;
    }
  },

  reorderCategories: async (categoryIds) => {
    set({ isLoading: true, error: null });
    try {
      const reorderedCategories = await categoriesApi.reorder(categoryIds);
      set({ categories: reorderedCategories, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message ||
          "Failed to reorder categories",
        isLoading: false,
      });
      throw error;
    }
  },

  selectCategory: (categoryId) => {
    set({ selectedCategory: categoryId });
  },

  clearError: () => {
    set({ error: null });
  },
}));
