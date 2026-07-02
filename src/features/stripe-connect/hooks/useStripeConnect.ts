import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";

import type { StripeConnectResponse } from "../types";
import { stripeConnectService } from "../api/stripe-connect.service";

const DEEP_LINK_SUCCESS = "commerce-app://stripe/success";

export function useStripeConnect() {
  const queryClient = useQueryClient();

  return useMutation<StripeConnectResponse, Error, void>({
    mutationFn: () => stripeConnectService.connectAccount(),
    onSuccess: async (data) => {
      if (data.onboardingUrl) {
        // Abre el onboarding de Stripe en un browser in-app
        // Cuando Stripe redirija a commerce-app://stripe/success,
        // el browser se cierra automáticamente
        const result = await WebBrowser.openAuthSessionAsync(
          data.onboardingUrl,
          DEEP_LINK_SUCCESS,
        );

        // Refrescar la organización al volver — ya sea éxito o cancelación
        if (result.type === "success" || result.type === "cancel") {
          queryClient.invalidateQueries({
            queryKey: ["organization", "details"],
          });
        }
      } else if (data.status === "complete") {
        // Ya estaba conectado — refrescar por si el webhook actualizó algo
        queryClient.invalidateQueries({
          queryKey: ["organization", "details"],
        });
      }
    },
  });
}