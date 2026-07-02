import React, { type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { store } from "../store";
import { queryClient } from "../config/queryClient";

// ─── Combined Provider ────────────────────────────────────────────

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>{children}</SafeAreaProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
