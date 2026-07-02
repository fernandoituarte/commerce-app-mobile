import { apiClient } from "../../../core/api/client";
import { ORDER_ENDPOINTS } from "./endpoints";
import { logger } from "../../../core/config/logger";
import {
  CreatePosOrderDto,
  CreateOrderDto,
  CreateOrderItemDto,
  UpdateOrderDto,
  UpdateOrderItemFullDto,
  OrderParams,
  Orders,
  Order,
} from "../types";

// ─── Orders Service ─────────────────────────────────────────────────

export const ordersService = {
  async getOrders(pagination: OrderParams): Promise<Orders> {
    logger.log("ORDERS", "Fetch orders started");
    const res = await apiClient.get<Orders>(ORDER_ENDPOINTS.FIND_ALL, {
      params: pagination,
      // NestJS expects repeated params for arrays: ?status=PENDING&status=IN_PROGRESS
      // Axios 1.x default serializes arrays as indexed brackets (status[0]=…), which
      // Express does not map to an array on the DTO. This serializer normalises all
      // arrays to repeated keys using URLSearchParams.
      paramsSerializer: (params) => {
        const sp = new URLSearchParams();
        for (const [key, val] of Object.entries(params)) {
          if (val === undefined || val === null || val === "") continue;
          if (Array.isArray(val)) {
            if (val.length === 0) continue;
            val.forEach((v) => {
              if (v !== undefined && v !== null) sp.append(key, String(v));
            });
          } else {
            sp.append(key, String(val));
          }
        }
        return sp.toString();
      },
    });
    logger.log("ORDERS", "Fetch orders success");
    return res.data;
  },

  async getOrderDetails(orderId: string): Promise<Order> {
    logger.log("ORDERS", `Fetch order ${orderId} started`);
    const res = await apiClient.get<Order>(
      ORDER_ENDPOINTS.FIND_ONE(orderId),
    );
    logger.log("ORDERS", `Fetch order ${orderId} success`);
    return res.data;
  },

  async createPosOrder(data: CreatePosOrderDto): Promise<Order> {
    logger.log("ORDERS", "Create POS order started");
    const res = await apiClient.post<Order>(ORDER_ENDPOINTS.CREATE_POS, data);
    logger.log("ORDERS", "Create POS order success");
    return res.data;
  },

  async createOrder(data: CreateOrderDto): Promise<Order> {
    logger.log("ORDERS", "Create order started");
    const res = await apiClient.post<Order>(ORDER_ENDPOINTS.CREATE, data);
    logger.log("ORDERS", "Create order success");
    return res.data;
  },

  async updateOrder(orderId: string, data: UpdateOrderDto): Promise<Order> {
    logger.log("ORDERS", `Update order ${orderId} started`);
    const res = await apiClient.patch<Order>(
      ORDER_ENDPOINTS.UPDATE(orderId),
      data,
    );
    logger.log("ORDERS", `Update order ${orderId} success`);
    return res.data;
  },

  async updateItem(orderId: string, itemId: string, dto: UpdateOrderItemFullDto): Promise<Order> {
    logger.log("ORDERS", `Update item ${itemId} in order ${orderId}`);
    const res = await apiClient.patch<Order>(
      ORDER_ENDPOINTS.UPDATE_ITEM(orderId, itemId),
      dto,
    );
    return res.data;
  },

  async updateItemQuantity(orderId: string, itemId: string, quantity: number): Promise<Order> {
    logger.log("ORDERS", `Update item ${itemId} quantity in order ${orderId}`);
    const res = await apiClient.patch<Order>(
      ORDER_ENDPOINTS.UPDATE_ITEM(orderId, itemId),
      { quantity },
    );
    return res.data;
  },

  async removeItem(orderId: string, itemId: string): Promise<Order> {
    logger.log("ORDERS", `Remove item ${itemId} from order ${orderId}`);
    const res = await apiClient.delete<Order>(
      ORDER_ENDPOINTS.DELETE_ITEM(orderId, itemId),
    );
    return res.data;
  },

  async addItem(orderId: string, item: CreateOrderItemDto): Promise<Order> {
    logger.log("ORDERS", `Add item ${item.productId} to order ${orderId} started`);
    const res = await apiClient.post<Order>(ORDER_ENDPOINTS.ADD_ITEM(orderId),
      item
    );
    logger.log("ORDERS", `Add item ${item.productId} to order ${orderId} success`);
    return res.data;
  },

  async sendToKitchen(orderId: string): Promise<Order> {
    logger.log("ORDERS", `Send to kitchen order ${orderId}`);
    const res = await apiClient.patch<Order>(ORDER_ENDPOINTS.SEND_TO_KITCHEN(orderId));
    return res.data;
  },

  async markItemPrepared(orderId: string, itemId: string): Promise<Order> {
    logger.log("ORDERS", `Mark item ${itemId} prepared in order ${orderId}`);
    const res = await apiClient.patch<Order>(ORDER_ENDPOINTS.MARK_ITEM_PREPARED(orderId, itemId));
    return res.data;
  },
};