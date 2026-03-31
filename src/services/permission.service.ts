import { request } from "@/lib/request";
import { Permission } from "@/types/permission.types";

const PERMISSION_ENDPOINT = "/permission";

export const permissionService = {
  findAll: async (): Promise<Permission[]> => {
    return request.get<Permission[]>(PERMISSION_ENDPOINT);
  },
};
