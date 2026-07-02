import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";
import { PaymentStatus } from "../types";

type Tone = "warning" | "success" | "danger" | "neutral";

const STATUS_TONES: Record<PaymentStatus, Tone> = {
  [PaymentStatus.PENDING]:    "warning",
  [PaymentStatus.PROCESSING]: "warning",
  [PaymentStatus.COMPLETED]:  "success",
  [PaymentStatus.PAID]:       "success",
  [PaymentStatus.FAILED]:     "danger",
  [PaymentStatus.REFUNDED]:   "neutral",
  [PaymentStatus.EXPIRED]:    "neutral",
  [PaymentStatus.CANCELLED]:  "neutral",
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const { t } = useTranslation();
  const tone = STATUS_TONES[status] ?? "neutral";
  return (
    <Badge
      label={t(`org.paymentsPage.status.${status}`, { defaultValue: status })}
      tone={tone}
    />
  );
}
