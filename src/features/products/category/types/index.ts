import { PaginationParams } from "@/shared/types/api";

export interface Categories {
  items: Category[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

export interface Category {
  id:          string;
  name:        string;
  description?: string;
  isActive:    boolean;
  deletedAt:   Date | null;
  ui?:         UI | null;
}

export interface UI {
  backgroundColor?: string;
  textColor?:       string;
  badge?:           string;
  highlight?:       boolean;
  sortOrder?:       number;
}

export interface CategoriesFilters extends PaginationParams {}
