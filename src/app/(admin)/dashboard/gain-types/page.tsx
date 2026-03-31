"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Pencil, Plus, Trash2, Loader2, Search, Download } from "lucide-react";

import { useGainTypesPaged, useDeleteGainType } from "@/hooks/use-gain-types";
import { GainType } from "@/types/gain-type.types";

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
import { GainTypeSheet } from "@/components/features/gain-types/gain-type-sheet";
import { PagePermissionGuard } from "@/components/auth/page-permission-guard";
import { exportToCSV } from "@/lib/export";
import { usePermission } from "@/lib/permissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { gainTypeService } from "@/services/gain-type.service";
import { toast } from "@/lib/toast";

export default function GainTypesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const deleteMutation = useDeleteGainType();
  const { can } = usePermission();

  const canCreate = can("gainType.create");
  const canUpdate = can("gainType.update");
  const canDelete = can("gainType.delete");

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [toEdit, setToEdit] = useState<GainType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedQuery = useDebouncedValue(searchQuery, 350);
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, pageSize]);

  const { data, isLoading, isError } = useGainTypesPaged({
    page,
    pageSize,
    q: debouncedQuery,
  });
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleExport = async () => {
    try {
      const data = await gainTypeService.exportAll(debouncedQuery || undefined);
      exportToCSV(data, "types-de-gain");
    } catch {
      toast.error("Erreur lors de l'export");
    }
  };

  return (
    <PagePermissionGuard permission="gainType.read">
      <div className="flex flex-col gap-6 w-full fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Types de gain</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Paramétrez les libellés proposés lors de la saisie (liste déroulante
              « Type de gain »).
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={!rows.length}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            {canCreate && (
              <Button
                onClick={() => {
                  setToEdit(null);
                  setIsSheetOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            )}
          </div>
        </div>

        <div className="bg-background rounded-xl border shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-9 bg-muted/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground font-medium px-4">
              {total} résultat{total > 1 ? "s" : ""}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center p-12 text-destructive">
              Erreur lors du chargement.
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">
              Aucun type de gain{searchQuery && " pour cette recherche"}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[30%]">Libellé</TableHead>
                    <TableHead className="w-[40%]">Description</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[300px] truncate">
                        {row.description || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(row.createdAt), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setToEdit(row);
                              setIsSheetOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (
                                confirm(
                                  `Supprimer « ${row.name} » ? Les saisies qui l’utilisent devront être mises à jour.`
                                )
                              ) {
                                deleteMutation.mutate(row.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        )}
                        {!canUpdate && !canDelete && (
                          <span className="text-xs text-muted-foreground px-2">
                            —
                          </span>
                        )}
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

        <GainTypeSheet
          isOpen={isSheetOpen}
          onOpenChange={(o) => {
            setIsSheetOpen(o);
            if (!o) setToEdit(null);
          }}
          gainTypeToEdit={toEdit}
        />
      </div>
    </PagePermissionGuard>
  );
}
