import { apiClient } from "../../../core/api/client";
import { CUSTOMER_ENDPOINTS } from "./endpoints";
import { logger } from "../../../core/config/logger";
import {
  CreateCustomerDto,
  Customer,
  Customers,
  GetCustomersParams,
  UpdateCustomerDto,
} from "../types";

// ─── Customer Service ─────────────────────────────────────────────────

export const customerService = {
  async createCustomer(data: CreateCustomerDto): Promise<{ customer: Customer }> {
    logger.log("CUSTOMERS", `Creating customer`);
    const res = await apiClient.post<{ customer: Customer }>(CUSTOMER_ENDPOINTS.CREATE, data);
    logger.log("CUSTOMERS", `Customer created successfully`);
    return res.data;
  },

  async getCustomers(params: GetCustomersParams): Promise<Customers> {
    const { organizationId, ...rest } = params;
    logger.log(
      "CUSTOMERS",
      `Fetching customers [organizationId=${organizationId}]`,
    );
    const res = await apiClient.get<Customers>(CUSTOMER_ENDPOINTS.FIND_ALL, {
      params: rest,
    });
    logger.log(
      "CUSTOMERS",
      `Customers fetched successfully [organizationId=${organizationId}]`,
    );
    return res.data;
  },

  async getCustomer(id: string): Promise<Customer> {
    logger.log("CUSTOMERS", `Fetching customer [id=${id}]`);
    const res = await apiClient.get<Customer>(CUSTOMER_ENDPOINTS.FIND_ONE(id));
    logger.log("CUSTOMERS", `Customer fetched successfully [id=${id}]`);
    return res.data;
  },

  async updateCustomer(id: string, data: UpdateCustomerDto): Promise<Customer> {
    logger.log("CUSTOMERS", `Updating customer [id=${id}]`);
    const res = await apiClient.patch<Customer>(
      CUSTOMER_ENDPOINTS.UPDATE(id),
      data,
    );
    logger.log("CUSTOMERS", `Customer updated successfully [id=${id}]`);
    return res.data;
  },

  async softDeleteCustomer(id: string): Promise<{ message: string }> {
    logger.log("CUSTOMERS", `Soft deleting customer [id=${id}]`);
    const res = await apiClient.patch<{ message: string }>(
      CUSTOMER_ENDPOINTS.SOFT_DELETE(id),
    );
    logger.log("CUSTOMERS", `Customer soft deleted successfully [id=${id}]`);
    return res.data;
  },

  async restoreDeletedCustomer(id: string): Promise<{ message: string }> {
    logger.log("CUSTOMERS", `Restoring customer [id=${id}]`);
    const res = await apiClient.patch<{ message: string }>(
      CUSTOMER_ENDPOINTS.RESTORE(id),
    );
    logger.log("CUSTOMERS", `Customer restored successfully [id=${id}]`);
    return res.data;
  },

  async deleteCustomer(id: string): Promise<{ message: string }> {
    logger.log("CUSTOMERS", `Deleting customer [id=${id}]`);
    const res = await apiClient.patch<{ message: string }>(
      CUSTOMER_ENDPOINTS.DELETE(id),
    );
    logger.log("CUSTOMERS", `Customer deleted successfully [id=${id}]`);
    return res.data;
  },
};
