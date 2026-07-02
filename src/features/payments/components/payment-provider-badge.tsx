import React from "react";
import { Badge } from "@/shared/components/ui";

type Tone = "primary" | "success" | "neutral";

const PROVIDER_TONES: Record<string, Tone> = {
  stripe: "primary",
  CASH:   "success",
  CARD:   "primary",
  CHECK:  "neutral",
};

interface PaymentProviderBadgeProps {
  provider: string | null;
  methodName?: string | null;
}

export function PaymentProviderBadge({ provider, methodName }: PaymentProviderBadgeProps) {
  const resolved = provider ?? "";
  const tone = PROVIDER_TONES[resolved] ?? "neutral";
  const label = methodName || resolved || "—";
  return <Badge label={label} tone={tone} />;
}
