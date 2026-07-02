import { PaginationParams } from "@/shared/types";

// ─── Order Types ─────────────────────────────────────────────────

export interface Orders {
  items: Order[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

export enum VoidReason {
  CUSTOMER_REQUEST = "CUSTOMER_REQUEST",
  KITCHEN_ERROR    = "KITCHEN_ERROR",
  OUT_OF_STOCK     = "OUT_OF_STOCK",
  DUPLICATE        = "DUPLICATE",
  OTHER            = "OTHER",
}

export interface Order {
  id: string;
  organizationId: string;
  userId?: string;
  status: string;
  currency: string;
  subtotal: number;
  total: number;
  customerName?: string;
  orderNumber: number;
  paymentStatus: string;
  voidReason?: VoidReason | null;
  voidReasonDetails?: string | null;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
  status: OrderItemStatus;
  extras: OrderItemExtra[];
  removedIngredients: OrderItemRemovedIngredient[];
}

export interface OrderItemExtra {
  id:       string;
  /** The originating product extra's UUID — exposed once the backend adds extraId to mapOrderResponse */
  extraId:  string;
  name:     string;
  price:    number;
  quantity: number;
  total:    number;
}

export interface OrderItemRemovedIngredient {
  id:           string;
  /** The originating product ingredient's UUID — exposed once the backend adds ingredientId to mapOrderResponse */
  ingredientId: string;
  name:         string;
}

export interface CreatePosOrderDto {
  customerName?: string;
}

export interface CreateOrderDto {
  customerName?: string;
  items: CreateOrderItemDto[];
}

export interface CreateOrderItemDto {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  extras?: CreateOrderItemExtraDto[];
  removedIngredients?: CreateOrderItemRemovedIngredientDto[];
}

export interface CreateOrderItemExtraDto {
  extraId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CreateOrderItemRemovedIngredientDto {
  ingredientId: string;
  ingredientName: string;
}

export interface UpdateOrderDto {
  status?: string;
  customerName?: string;
  voidReason?: VoidReason;
  voidReasonDetails?: string;
}

export interface UpdateOrderItemQuantityDto {
  quantity: number;
}

export interface UpdateOrderItemFullDto {
  quantity?: number;
  extras?: CreateOrderItemExtraDto[];
  removedIngredients?: CreateOrderItemRemovedIngredientDto[];
}

export enum Currency {
  Eur = "eur",
  Usd = "usd",
  Uyu = "uyu",
  Mxn = "mxn",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum OrderItemStatus {
  NEW = "NEW",
  SENT_TO_KITCHEN = "SENT_TO_KITCHEN",
  PREPARED = "PREPARED",
}

export enum OrderStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  READY = "READY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REOPENED = "REOPENED",
}

// The four statuses that represent live, actionable work in the POS.
// COMPLETED and CANCELLED are intentionally excluded — they belong in the
// organization dashboard view only.
export const POS_ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.IN_PROGRESS,
  OrderStatus.READY,
  OrderStatus.REOPENED,
];

// The default status filter for the organization dashboard ("all" selection).
// Currently undefined so the backend returns every status for the org.
// When the ARCHIVED status is added (cash-register close), replace undefined
// with an explicit array of all non-archived statuses so that archived orders
// are excluded from the dashboard default and routed to their own view.
export const DASHBOARD_DEFAULT_ORDER_STATUSES: OrderStatus[] | undefined = undefined;

export interface OrderParams extends PaginationParams {
  userId?: string;
  status?: OrderStatus | OrderStatus[];
}
