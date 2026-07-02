import type { SubscriptionStatus } from "../types";

// NOTE: this mapping must eventually be mirrored server-side.
// The backend must reject POST/PATCH/DELETE when status is not ACTIVE.
// This frontend layer is UX-only — it is not a security boundary.

export type SubscriptionAccessLevel = "full" | "readonly" | "processing" | "blocked";

export function getSubscriptionAccess(
  status: SubscriptionStatus | null | undefined,
): SubscriptionAccessLevel {
  switch (status) {
    case "ACTIVE":
    case "TRIAL": // trials share full access with ACTIVE
      return "full";
    case "PAST_DUE":
    case "PAUSED":
    case "CANCELED":
    case "EXPIRED":
    case "INCOMPLETE":
      return "readonly";
    case "PROCESSING":
      return "processing";
    default: // null / undefined / unknown future status
      return "blocked";
  }
}
