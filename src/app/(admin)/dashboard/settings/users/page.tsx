"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Pencil, Plus, Trash2, Loader2, Search, Download, KeyRound, Eye } from "lucide-react";

import { useUsersAdminPaged, useDeleteUserAdmin } from "@/hooks/use-users-admin";
import { UserAdmin } from "@/types/user-admin.types";
import { userAdminService } from "@/services/user-admin.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserDialog } from "@/components/features/users/user-dialog";
import { UserDetailSheet } from "@/components/features/users/user-detail-sheet";
import { ResetPasswordAdminDialog } from "@/components/features/users/reset-password-admin-dialog";
import { PagePermissionGuard } from "@/components/auth/page-permission-guard";
import { exportToCSV } from "@/lib/export";
import { usePermission } from "@/lib/permissions";
import { toast } from "@/lib/toast";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const deleteMutation = useDeleteUserAdmin();
  const { can } = usePermission();

  const canCreate = can("user.create");
  const canUpdate = can("user.update");
  const canDelete = can("user.delete");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [userToResetPwd, setUserToResetPwd] = useState<UserAdmin | null>(null);
  const [userToEdit, setUserToEdit] = useState<UserAdmin | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [userToView, setUserToView] = useState<UserAdmin | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);

  const debouncedQuery = useDebouncedValue(searchQuery, 350);
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, pageSize]);

  const { data, isLoading, isError } = useUsersAdminPaged({
    page,
    pageSize,
    q: debouncedQuery,
  });
  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await userAdminService.exportAll();
      exportToCSV(data, `utilisateurs-${format(new Date(), "yyyyMMdd")}`);
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  const handleCreate = () => {
    setUserToEdit(null);
    setDialogOpen(true);
  };

  const handleEdit = (user: UserAdmin) => {
    setUserToEdit(user);
    setDialogOpen(true);
  };

  const handleView = (user: UserAdmin) => {
    setUserToView(user);
    setDetailOpen(true);
  };

  const handleResetPwd = (user: UserAdmin) => {
    setUserToResetPwd(user);
    setResetPwdOpen(true);
  };

  const handleDelete = async (user: UserAdmin) => {
    if (
      !confirm(
        `Supprimer l'utilisateur ${user.firstName ?? ""} ${user.lastName ?? ""} (${user.email}) ? Cette action est irréversible.`
      )
    ) {
      return;
    }
    await deleteMutation.mutateAsync(user.id);
  };

  return (
    <PagePermissionGuard permission="user.read">
    <div className="flex flex-col gap-6 w-full fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des utilisateurs
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gérez les utilisateurs de votre organisation.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Exporter
          </Button>
          {canCreate && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />Nouvel utilisateur
            </Button>
          )}
        </div>
      </div>

      <div className="bg-background rounded-xl border shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              className="pl-9 bg-muted/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {total} utilisateur
            {total !== 1 ? "s" : ""}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center p-12 text-destructive">
            Une erreur est survenue lors du chargement des utilisateurs.
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground">
            Aucun utilisateur trouvé{searchQuery ? " pour cette recherche" : ""}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[18%]">Prénom</TableHead>
                  <TableHead className="w-[18%]">Nom</TableHead>
                  <TableHead className="w-[20%]">Email</TableHead>
                  <TableHead className="w-[12%]">Profil</TableHead>
                  <TableHead className="w-[10%]">Direction</TableHead>
                  <TableHead className="w-[10%]">Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {user.firstName ?? "—"}
                    </TableCell>
                    <TableCell>{user.lastName ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {user.profile ? (
                        <span className="text-sm">{user.profile.name}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.direction ? (
                        <span className="text-sm">{user.direction.name}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "default" : "secondary"}
                        className={
                          user.isActive
                            ? "bg-green-600/90 hover:bg-green-600"
                            : ""
                        }
                      >
                        {user.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-[#2c63a8] hover:bg-blue-50"
                          onClick={() => handleView(user)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Button>
                        {canUpdate && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(user)}>
                            <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                        )}
                        {canUpdate && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleResetPwd(user)} title="Réinitialiser le mot de passe">
                            <KeyRound className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="sr-only">Réinitialiser le mot de passe</span>
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(user)}
                            disabled={deleteMutation.isPending && deleteMutation.variables === user.id}
                          >
                            {deleteMutation.isPending && deleteMutation.variables === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

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
            {[10, 20, 50, 100].map((n) => (
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

      <UserDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setUserToEdit(null);
        }}
        userToEdit={userToEdit}
      />

      <UserDetailSheet
        user={userToView}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setUserToView(null);
        }}
      />

      <ResetPasswordAdminDialog
        open={resetPwdOpen}
        onOpenChange={(open) => {
          setResetPwdOpen(open);
          if (!open) setUserToResetPwd(null);
        }}
        user={userToResetPwd}
      />
    </div>
    </PagePermissionGuard>
  );
}
