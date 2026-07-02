// ─── Enums ────────────────────────────────────────────────────────

// Full enum matching payments-ms PaymentStatus (two-L "CANCELLED").
// The gateway enum spells it "CANCELED" (one L) but the database
// (payments-ms side) stores "CANCELLED" — wire to the ms value.
export enum PaymentStatus {
  PENDING    = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED  = 'COMPLETED',
  PAID       = 'PAID',
  FAILED     = 'FAILED',
  REFUNDED   = 'REFUNDED',
  EXPIRED    = 'EXPIRED',
  CANCELLED  = 'CANCELLED',
}

// Statuses that count toward amountPaid for an order.
// Manual POS payments are always created as PENDING and stay that way;
// session-based Stripe payments can reach COMPLETED or PAID.
// Exclude terminal-failure statuses: FAILED, REFUNDED, EXPIRED, CANCELLED.
export const COUNTABLE_PAYMENT_STATUSES: ReadonlySet<string> = new Set([
  PaymentStatus.PENDING,
  PaymentStatus.PROCESSING,
  PaymentStatus.COMPLETED,
  PaymentStatus.PAID,
]);

export enum PaymentProvider {
  STRIPE = 'stripe',
  CASH   = 'CASH',
  CARD   = 'CARD',
  CHECK  = 'CHECK',
}

// Aligned with payments-ms FailureReason enum. Values not in the backend enum
// will 400 on the cancel endpoint — use only the values below.
export enum FailureReason {
  // Automatic reasons set by backend events:
  ORDER_CANCELLED          = 'ORDER_CANCELLED',
  // Stripe-originated reasons (do not use for manual POS cancels):
  CHECKOUT_SESSION_EXPIRED = 'CHECKOUT_SESSION_EXPIRED',
  PAYMENT_FAILED           = 'PAYMENT_FAILED',
  PAYMENT_CANCELED         = 'PAYMENT_CANCELED',
  // Staff-originated reasons (use these for POS cancel):
  WRONG_AMOUNT         = 'WRONG_AMOUNT',
  WRONG_PAYMENT_METHOD = 'WRONG_PAYMENT_METHOD',
  CUSTOMER_CANCELLED   = 'CUSTOMER_CANCELLED',
  DUPLICATE_PAYMENT    = 'DUPLICATE_PAYMENT',
}

export enum Currency {
  USD = 'usd',
  EUR = 'eur',
  UYU = 'uyu',
  MXN = 'mxn',
}

// ─── Payment Types ────────────────────────────────────────────────

export interface PaymentsResponse {
  items:       Payment[];
  totalItems:  number;
  totalPages:  number;
  currentPage: number;
  hasMore:     boolean;
}

export interface Payment {
  id:                 string;
  orderId:            string | null;
  subscriptionId:     string | null;
  userId:             string | null;
  /** Amount in CENTS as stored in the database. Divide by 100 for display. */
  amount:             number;
  currency:           string;
  status:             PaymentStatus;
  provider:           PaymentProvider | null;
  paymentMethodId?:   string | null;
  paymentMethodName?: string | null;
  failureReason?:     FailureReason | null;
  cancelledAt?:       Date | null;
  paidAt:             Date | null;
  createdAt:          Date;
}

export interface PaymentDetails extends Payment {
  checkoutUrl?:        string | null;
  externalPaymentId?:  string | null;
  externalSessionId?:  string | null;
}

// ─── DTOs ────────────────────────────────────────────────────────

export interface CreateManualPaymentDto {
  orderId:           string;
  /** Amount in DOLLARS. The client-gateway multiplies × 100 before forwarding. */
  amount:            number;
  currency:          Currency;
  paymentMethodId:   string;
  paymentMethodName: string;
}

export interface CancelPaymentDto {
  failureReason: FailureReason;
}

// ─── Filters ─────────────────────────────────────────────────────

export interface PaymentsFilters {
  offset?:  number;
  limit?:   number;
  search?:  string;
  status?:  PaymentStatus;
  orderId?: string;
  userId?:  string;
}
