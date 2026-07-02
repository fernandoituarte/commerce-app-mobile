export interface Customers {
  customers:   Customer[];
  totalItems:  number;
  totalPages:  number;
  currentPage: number;
  hasMore:     boolean;
}

export interface Customer {
  id:             string;
  email:          string;
  name:           string;
  emailVerified?: boolean;
  createdAt:      Date;
  deletedAt?:     Date | null;
}


export interface GetCustomersParams {
  organizationId?: string;
  offset?: number;
  limit?: number;
  withDeleted?: boolean;
  search?: string;
}

export interface UpdateCustomerDto {
  name?:  string;
  email?: string;
}

export interface CreateCustomerDto {
  name:  string;
  email: string;
}