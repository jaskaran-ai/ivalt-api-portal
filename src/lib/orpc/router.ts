import { listAdminUsers, listAdminKeys, listAccessRequests } from "./procedures/admin";

export const router = {
  admin: {
    users: {
      list: listAdminUsers,
    },
    keys: {
      list: listAdminKeys,
    },
    accessRequests: {
      list: listAccessRequests,
    },
  },
};

export type Router = typeof router;
