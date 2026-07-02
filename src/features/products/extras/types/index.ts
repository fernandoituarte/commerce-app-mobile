import { PaginationParams } from "@/shared/types/api";

export interface Extras {
  items:       Extra[];
  totalItems:  number;
  totalPages:  number;
  currentPage: number;
  hasMore:     boolean;
}

export interface Extra {
  id:           string;
  name:         string;
  price:        number;
  isActive:     boolean;
  deletedAt:    Date | null;
}

export interface ExtrasFilters extends PaginationParams {}
