// ─── Payment Method Types ─────────────────────────────────────────

export interface PaymentMethodsResponse {
  items:       PaymentMethod[];
  totalItems:  number;
  totalPages:  number;
  currentPage: number;
  hasMore:     boolean;
}

export interface PaymentMethod {
  id:             string;
  organizationId: string;
  name:           string;
  description?:   string;
  isActive:       boolean;
  isDefault:      boolean;
  isSystem:       boolean;
  sortOrder:      number;
  deletedAt:      Date | null;
  createdAt:      Date;
  updatedAt:      Date;
}

export interface CreatePaymentMethodDto {
  name:         string;
  description?: string;
  isActive?:    boolean;
  isDefault?:   boolean;
  sortOrder?:   number;
}

export interface UpdatePaymentMethodDto {
  name?:        string;
  description?: string;
  isActive?:    boolean;
  isDefault?:   boolean;
  sortOrder?:   number;
}

export interface PaymentMethodsFilters {
  offset?:      number;
  limit?:       number;
  search?:      string;
  withDeleted?: boolean;
}