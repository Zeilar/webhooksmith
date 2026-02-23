import type { Webhook } from "../../db/schema";

export interface PaginatedWebhooksDto {
  items: Webhook[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}
