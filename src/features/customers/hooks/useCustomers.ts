import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "../../../core/store/hooks";
import { customerService } from "../api/customers.service";
import { Customers, Customer, GetCustomersParams, UpdateCustomerDto, CreateCustomerDto } from "../types";

const CUSTOMERS_KEY = "customers";

// ─── useCreateCustomer ─────────────────────────────────────────

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerDto) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    },
  });
}

// ─── useCustomers ───────────────────────────────────────────────

export function useCustomers(params?: Partial<GetCustomersParams>) {
  const { currentOrganizationId } = useAppSelector((state) => state.organization);

  return useQuery<Customers, Error>({
    queryKey: [CUSTOMERS_KEY, currentOrganizationId, params],
    enabled: Boolean(currentOrganizationId),
    queryFn: async () => {
      if (!currentOrganizationId) throw new Error("Missing organization id");
      return customerService.getCustomers({
        ...params,
        organizationId: currentOrganizationId,
      });
    },
  });
}

// ─── useCustomer ────────────────────────────────────────────────

export function useCustomer(id: string) {
  return useQuery<Customer, Error>({
    queryKey: [CUSTOMERS_KEY, id],
    enabled: Boolean(id),
    queryFn: () => customerService.getCustomer(id),
  });
}

// ─── useUpdateCustomer ──────────────────────────────────────────

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerDto }) =>
      customerService.updateCustomer(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY, id] });
    },
  });
}

// ─── useSoftDeleteCustomer ──────────────────────────────────────

export function useSoftDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.softDeleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    },
  });
}

// ─── useRestoreCustomer ─────────────────────────────────────────

export function useRestoreCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.restoreDeletedCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    },
  });
}

// ─── useDeleteCustomer ──────────────────────────────────────────

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    },
  });
}