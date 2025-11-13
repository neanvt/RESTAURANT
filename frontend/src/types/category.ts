export interface Category {
  id: string;
  outletId: string;
  name: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDTO {
  name: string;
  icon?: string;
  displayOrder?: number;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

export interface ReorderCategoryDTO {
  categoryId: string;
  newOrder: number;
}
