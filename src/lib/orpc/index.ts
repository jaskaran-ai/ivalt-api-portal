import { os } from "@orpc/server";
import { z } from "zod";

export const base = os;

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(10),
});

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export function paginatedResponse<T>(items: T[], total: number, page: number, perPage: number): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}
