import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAdminService } from "@/services/user-admin.service";
import {
  CreateUserByAdminPayload,
  UpdateUserByAdminPayload,
  UserAdmin,
} from "@/types/user-admin.types";
import { toast } from "sonner";
import { PaginatedResponse } from "@/types/pagination.types";

export const USERS_ADMIN_QUERY_KEY = ["users-admin"];

export function useUsersAdmin() {
  return useQuery({
    queryKey: USERS_ADMIN_QUERY_KEY,
    queryFn: () => userAdminService.findAll(),
  });
}

export function useUsersAdminPaged(params: { page: number; pageSize: number; q?: string }) {
  const page = params.page;
  const pageSize = params.pageSize;
  const q = params.q ?? "";
  return useQuery({
    queryKey: [...USERS_ADMIN_QUERY_KEY, "paged", { page, pageSize, q }],
    queryFn: () => userAdminService.findPaged({ page, pageSize, q }),
    placeholderData: (prev) => prev as PaginatedResponse<UserAdmin> | undefined,
  });
}

export function useUserAdmin(id: string) {
  return useQuery({
    queryKey: [...USERS_ADMIN_QUERY_KEY, id],
    queryFn: () => userAdminService.findOne(id),
    enabled: !!id,
  });
}

export function useCreateUserAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserByAdminPayload) =>
      userAdminService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_ADMIN_QUERY_KEY });
      toast.success("Utilisateur créé avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message?: string })?.message ||
          "Erreur lors de la création de l'utilisateur"
      );
    },
  });
}

export function useUpdateUserAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserByAdminPayload;
    }) => userAdminService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_ADMIN_QUERY_KEY });
      toast.success("Utilisateur mis à jour avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message?: string })?.message ||
          "Erreur lors de la mise à jour de l'utilisateur"
      );
    },
  });
}

export function useResetPasswordAdmin() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      userAdminService.resetPassword(id, newPassword),
    onSuccess: () => {
      toast.success("Mot de passe réinitialisé. L'utilisateur devra le changer à sa prochaine connexion.");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message?: string })?.message ||
          "Erreur lors de la réinitialisation du mot de passe"
      );
    },
  });
}

export function useDeleteUserAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userAdminService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_ADMIN_QUERY_KEY });
      toast.success("Utilisateur supprimé avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message?: string })?.message ||
          "Erreur lors de la suppression de l'utilisateur"
      );
    },
  });
}
