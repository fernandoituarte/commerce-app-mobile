export type SubscriptionPlan = "BASIC" | "PRO";

export type SubscriptionStatus =
  | "TRIAL" | "PROCESSING" | "ACTIVE" | "PAST_DUE"
  | "CANCELED" | "EXPIRED" | "INCOMPLETE" | "PAUSED";

// Suscripción solo factura por Stripe (no usar el PaymentProvider del módulo POS)
export type SubscriptionProvider = "stripe";

export type BillingInterval = "day" | "week" | "month" | "year";

// Item de la respuesta de GET /subscription/plans
export interface Plan {
  plan: SubscriptionPlan;
  priceId: string;
  amount: number | null; // centavos
  currency: string;
  interval: BillingInterval | null;
}

export interface CreateOnboardingSessionDto {
  priceId: string;
  provider: SubscriptionProvider;
}

export interface CreateOnboardingSessionResponse {
  subscriptionId?: string;
  alreadyActive?: boolean;
  paymentId?: string;
  checkoutUrl?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  priceAmount: number; // centavos
  currency: string;
  stripePriceId: string;
  status: SubscriptionStatus;
  stripeSubscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceHistoryItem {
  id: string;
  number: string | null;
  status: "draft" | "open" | "paid" | "void" | "uncollectible" | null;
  amountPaid: number; // cents
  amountDue: number;
  currency: string;
  created: number;     // ms
  periodStart: number;
  periodEnd: number;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}