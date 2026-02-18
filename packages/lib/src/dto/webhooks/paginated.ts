import type { Webhook } from "../../db/schema";

export interface PaginatedWebhooksDto {
  items: Webhook[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
