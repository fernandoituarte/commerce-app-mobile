// ─── API Types ────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  };
}

export interface PaginationParams {
  offset?: number;
  limit?: number;
  search?: string;
  withDeleted?: boolean;
}

