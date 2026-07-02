import { PaginationParams } from "@/shared/types/api";

export interface Ingredients {
  items:       Ingredient[];
  totalItems:  number;
  totalPages:  number;
  currentPage: number;
  hasMore:     boolean;
}

export interface Ingredient {
  id:        string;
  name:      string;
  isActive:  boolean;
  deletedAt: Date | null;
}

export interface IngredientsFilters extends PaginationParams {}
