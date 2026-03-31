import { useQuery } from "@tanstack/react-query";
import { permissionService } from "@/services/permission.service";

export const PERMISSION_QUERY_KEY = ["permissions"];

export function usePermissions() {
  return useQuery({
    queryKey: PERMISSION_QUERY_KEY,
    queryFn: () => permissionService.findAll(),
  });
}
