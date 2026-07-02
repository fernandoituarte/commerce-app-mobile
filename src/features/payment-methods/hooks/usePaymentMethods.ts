import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/core/store/hooks";
import type {
  PaymentMethod,
  PaymentMethodsResponse,
  PaymentMethodsFilters,
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
} from "../types";
import { paymentMethodsService } from "../api/payment-methods.service";

const PAYMENT_METHODS_KEY = "payment-methods";

// ─── usePaymentMethods ───────────────────────────────────────────

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<PaymentMethod, Error, CreatePaymentMethodDto>({
    mutationFn: (data) => paymentMethodsService.createPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PAYMENT_METHODS_KEY, currentOrganizationId],
      });
    },
  });
}

export function useGetPaymentMethods(params: PaymentMethodsFilters) {
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useQuery<PaymentMethodsResponse, Error>({
    queryKey: [PAYMENT_METHODS_KEY, currentOrganizationId, params],
    enabled: Boolean(currentOrganizationId),
    queryFn: () => paymentMethodsService.getPaymentMethods(params),
  });
}

export function useGetPaymentMethodById(id: string) {
  return useQuery<PaymentMethod, Error>({
    queryKey: [PAYMENT_METHODS_KEY, id],
    enabled: Boolean(id),
    queryFn: () => paymentMethodsService.getPaymentMethodById(id),
  });
}

export function useUpdatePaymentMethod(id: string) {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<PaymentMethod, Error, UpdatePaymentMethodDto>({
    mutationFn: (data) => paymentMethodsService.updatePaymentMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PAYMENT_METHODS_KEY, id],
      });
      queryClient.invalidateQueries({
        queryKey: [PAYMENT_METHODS_KEY, currentOrganizationId],
      });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id: string) => paymentMethodsService.deletePaymentMethod(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({
        queryKey: [PAYMENT_METHODS_KEY, id],
      });
      queryClient.invalidateQueries({
        queryKey: [PAYMENT_METHODS_KEY, currentOrganizationId],
      });
    },
  });
}

export function useRestorePaymentMethod() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<PaymentMethod, Error, string>({
    mutationFn: (id: string) => paymentMethodsService.restorePaymentMethod(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({
        queryKey: [PAYMENT_METHODS_KEY, id],
      });
      queryClient.invalidateQueries({
        queryKey: [PAYMENT_METHODS_KEY, currentOrganizationId],
      });
    },
  });
}