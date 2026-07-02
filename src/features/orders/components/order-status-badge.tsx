import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";

type Tone = "warning" | "primary" | "success" | "danger" | "neutral";

const ORDER_STATUS_TONES: Record<string, Tone> = {
  PENDING: "warning",
  IN_PROGRESS: "primary",
  READY: "success",
  COMPLETED: "success",
  CANCELLED: "danger",
  REOPENED: "warning",
};

const PAYMENT_STATUS_TONES: Record<string, Tone> = {
  PENDING: "warning",
  PROCESSING: "primary",
  COMPLETED: "success",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "neutral",
  EXPIRED: "neutral",
  CANCELED: "danger",
};

interface OrderStatusBadgeProps {
  status: string;
  type?: "order" | "payment";
}

export function OrderStatusBadge({ status, type = "order" }: OrderStatusBadgeProps) {
  const { t } = useTranslation();
  const tones = type === "order" ? ORDER_STATUS_TONES : PAYMENT_STATUS_TONES;
  const tone: Tone = tones[status] ?? "neutral";
  const ns = type === "order" ? "org.orders.status" : "org.orders.paymentStatus";
  return <Badge label={t(`${ns}.${status}`, { defaultValue: status })} tone={tone} />;
}
