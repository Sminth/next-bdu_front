"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, Loader2, User, Download } from "lucide-react";

import { useProfilesPaged, useDeleteProfile } from "@/hooks/use-profiles";
import { Profile } from "@/types/profile.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileDialog } from "@/components/features/habilitation/profile-dialog";
import { PagePermissionGuard } from "@/components/auth/page-permission-guard";
import { exportToCSV } from "@/lib/export";
import { usePermission } from "@/lib/permissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { profileService } from "@/services/profile.service";
import { toast } from "@/lib/toast";

function getAccessLevelLabel(permissionCount: number): string {
  if (permissionCount === 0) return "Aucun accès";
  if (permissionCount <= 5) return "Accès limité";
  if (permissionCount <= 15) return "Accès étendu";
  return "Accès complet";
}

export default function HabilitationPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const deleteMutation = useDeleteProfile();
  const { can } = usePermission();

  const canCreate = can("profile.create");
  const canUpdate = can("profile.update");
  const canDelete = can("profile.delete");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedQuery = useDebouncedValue(searchQuery, 350);
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, pageSize]);

  const { data, isLoading, isError } = useProfilesPaged({
    page,
    pageSize,
    q: debouncedQuery,
  });
  const profiles = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleExport = async () => {
    try {
      const rows = await profileService.exportAll(debouncedQuery || undefined);
      exportToCSV(rows, "habilitations");
    } catch {
      toast.error("Erreur lors de l'export");
    }
  };

  const handleCreate = () => {
    setProfileToEdit(null);
    setDialogOpen(true);
  };

  const handleEdit = (profile: Profile) => {
    setProfileToEdit(profile);
    setDialogOpen(true);
  };

  const handleDelete = async (profile: Profile) => {
    const userCount = profile._count?.users ?? 0;
    if (
      userCount > 0 &&
      !confirm(
        `Ce profil est assigné à ${userCount} utilisateur(s). Supprimer quand même ?`
      )
    ) {
      return;
    }
    if (confirm("Supprimer ce profil ? Cette action est irréversible.")) {
      await deleteMutation.mutateAsync(profile.id);
    }
  };

  return (
    <PagePermissionGuard permission="profile.read">
    <div className="flex flex-col gap-6 w-full fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des habilitations
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gérez les profils et permissions de vos utilisateurs.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport} disabled={!profiles.length}>
            <Download className="h-4 w-4 mr-2" />Exporter
          </Button>
          {canCreate && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un profil
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un profil..."
            className="pl-9 bg-muted/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground self-center">
          {total} profil{total !== 1 ? "s" : ""}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="text-center p-12 text-destructive">
          Une erreur est survenue lors du chargement des profils.
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground rounded-xl border bg-muted/20">
          Aucun profil trouvé{searchQuery ? " pour cette recherche" : ""}.
          Créez un premier profil pour commencer.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => {
            const permCount = profile.permissions?.length ?? 0;
            const accessLabel = getAccessLevelLabel(permCount);
            return (
              <Card
                key={profile.id}
                className="flex flex-col hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base">{profile.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    {canUpdate && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(profile)}>
                        <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="sr-only">Éditer</span>
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(profile)} disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-2">
                  <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {profile.description || "Aucune description"}
                  </CardDescription>
                  <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{permCount} permission{permCount !== 1 ? "s" : ""}</span>
                    <span
                      className={
                        permCount >= 15
                          ? "text-green-600 dark:text-green-400 font-medium"
                          : permCount > 0
                            ? "text-amber-600 dark:text-amber-400"
                            : ""
                      }
                    >
                      {accessLabel}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="text-xs text-muted-foreground">
          {total > 0 ? (
            <>
              Page <span className="font-medium text-foreground">{page}</span> /{" "}
              <span className="font-medium text-foreground">{totalPages}</span> —{" "}
              <span className="font-medium text-foreground">{total}</span> élément(s)
            </>
          ) : (
            "0 élément"
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-8 rounded-md border border-border/50 bg-white px-2 text-xs"
          >
            {[6, 12, 24, 48].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Suivant
          </Button>
        </div>
      </div>

      <ProfileDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setProfileToEdit(null);
        }}
        profileToEdit={profileToEdit}
      />
    </div>
    </PagePermissionGuard>
  );
}
