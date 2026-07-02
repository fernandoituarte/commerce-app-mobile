import { PaginationParams } from "@/shared/types/api";

export interface Tags {
  items:       Tag[];
  totalItems:  number;
  totalPages:  number;
  currentPage: number;
  hasMore:     boolean;
}

export interface Tag {
  id:        string;
  name:      string;
  isActive:  boolean;
  deletedAt: Date | null;
  ui?:       TagUI | null;
}
export interface TagUI {
  backgroundColor?: string;
  textColor?:       string;
  badge?:           string;
  highlight?:       boolean;
  sortOrder?:       number;
}

export interface TagsFilters extends PaginationParams {}
