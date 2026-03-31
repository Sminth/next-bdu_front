import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import {
  CreateProfilePayload,
  UpdateProfilePayload,
  Profile,
} from "@/types/profile.types";
import { toast } from "sonner";
import { PaginatedResponse } from "@/types/pagination.types";

export const PROFILE_QUERY_KEY = ["profiles"];

export function useProfiles() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => profileService.findAll(),
  });
}

export function useProfilesPaged(params: { page: number; pageSize: number; q?: string }) {
  const page = params.page;
  const pageSize = params.pageSize;
  const q = params.q ?? "";
  return useQuery({
    queryKey: [...PROFILE_QUERY_KEY, "paged", { page, pageSize, q }],
    queryFn: () => profileService.findPaged({ page, pageSize, q }),
    placeholderData: (prev) => prev as PaginatedResponse<Profile> | undefined,
  });
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: [...PROFILE_QUERY_KEY, id],
    queryFn: () => profileService.findOne(id),
    enabled: !!id,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProfilePayload) => profileService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      toast.success("Profil créé avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message?: string })?.message ||
          "Erreur lors de la création du profil"
      );
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProfilePayload;
    }) => profileService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      toast.success("Profil mis à jour avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message?: string })?.message ||
          "Erreur lors de la mise à jour du profil"
      );
    },
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => profileService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      toast.success("Profil supprimé avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message?: string })?.message ||
          "Erreur lors de la suppression du profil"
      );
    },
  });
}
