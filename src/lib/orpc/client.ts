import { RPCLink } from "@orpc/client/fetch";
import { createORPCClient } from "@orpc/client";
import type { PaginatedResult } from ".";

interface AdminUser {
  id: string;
  phoneNumber: string;
  name: string | null;
  status: string;
  createdAt: string;
  approvedAt: string | null;
  apiKeyCount: number;
}

interface AdminKey {
  id: string;
  keyName: string;
  awsKeyId: string;
  keyValue: string | null;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  usageCount: number;
  user: {
    id: string;
    phoneNumber: string;
    name: string | null;
    status: string;
  } | null;
}

interface AccessRequest {
  id: string;
  userId: string;
  useCase: string;
  requestedAt: string;
  approvedAt: string | null;
  adminNotes: string | null;
  user: {
    id: string;
    phoneNumber: string;
    name: string | null;
  } | null;
}

interface AdminClient {
  admin: {
    users: {
      list: (input: {
        page: number;
        perPage: number;
        status: "all" | "approved" | "pending" | "rejected";
      }) => Promise<PaginatedResult<AdminUser>>;
    };
    keys: {
      list: (input: {
        page: number;
        perPage: number;
        status: "all" | "active" | "inactive";
        search?: string;
      }) => Promise<PaginatedResult<AdminKey>>;
    };
    accessRequests: {
      list: (input: {
        page: number;
        perPage: number;
        status: "all" | "pending" | "approved";
      }) => Promise<PaginatedResult<AccessRequest>>;
    };
  };
}

const link = new RPCLink({
  url: "/api/orpc",
});

const raw = createORPCClient(link);
export const orpc = raw as unknown as AdminClient;
