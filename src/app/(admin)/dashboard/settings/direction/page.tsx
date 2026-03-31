"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Pencil, Plus, Trash2, Loader2, Search, Download } from "lucide-react";

import { useDirectionsPaged, useDeleteDirection } from "@/hooks/use-directions";
import { Direction } from "@/types/direction.types";

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
import { DirectionSheet } from "@/components/features/directions/direction-sheet";
import { PagePermissionGuard } from "@/components/auth/page-permission-guard";
import { exportToCSV } from "@/lib/export";
import { usePermission } from "@/lib/permissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { directionService } from "@/services/direction.service";
import { toast } from "@/lib/toast";

export default function DirectionPage() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const deleteMutation = useDeleteDirection();
    const { can } = usePermission();

    const canCreate = can("direction.create");
    const canUpdate = can("direction.update");
    const canDelete = can("direction.delete");

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [directionToEdit, setDirectionToEdit] = useState<Direction | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const debouncedQuery = useDebouncedValue(searchQuery, 350);
    useEffect(() => {
        setPage(1);
    }, [debouncedQuery, pageSize]);

    const { data, isLoading, isError } = useDirectionsPaged({
        page,
        pageSize,
        q: debouncedQuery,
    });
    const directions = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const handleOpenCreate = () => {
        setDirectionToEdit(null);
        setIsSheetOpen(true);
    };

    const handleOpenEdit = (direction: Direction) => {
        setDirectionToEdit(direction);
        setIsSheetOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette direction ? Cette action est irréversible.")) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleExport = async () => {
        try {
            const rows = await directionService.exportAll(debouncedQuery || undefined);
            exportToCSV(rows, "directions");
        } catch {
            toast.error("Erreur lors de l'export");
        }
    };

    return (
        <PagePermissionGuard permission="direction.read">
        <div className="flex flex-col gap-6 w-full fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Directions</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Gérez la liste des directions (ex: DSI, Direction Métier...).
                    </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={handleExport} disabled={!directions.length}>
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                    </Button>
                    {canCreate && (
                        <Button onClick={handleOpenCreate}>
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
                            placeholder="Rechercher par libellé..."
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
                        Une erreur est survenue lors du chargement des directions.
                    </div>
                ) : directions.length === 0 ? (
                    <div className="text-center p-12 text-muted-foreground">
                        Aucune direction trouvée {searchQuery && "pour cette recherche"}.
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
                                {directions.map((direction) => (
                                    <TableRow key={direction.id} className="hover:bg-muted/30">
                                        <TableCell className="font-medium">{direction.name}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-[300px] truncate">
                                            {direction.description || "—"}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {format(new Date(direction.createdAt), "dd MMM yyyy", {
                                                locale: fr,
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {canUpdate && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenEdit(direction)}
                                                >
                                                    <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    <span className="sr-only">Modifier</span>
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(direction.id)}
                                                    disabled={deleteMutation.isPending && deleteMutation.variables === direction.id}
                                                >
                                                    {deleteMutation.isPending && deleteMutation.variables === direction.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                    )}
                                                    <span className="sr-only">Supprimer</span>
                                                </Button>
                                            )}
                                            {!canUpdate && !canDelete && (
                                                <span className="text-xs text-muted-foreground px-2">—</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <div className="flex items-center justify-between gap-3 p-4 border-t">
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
            </div>

            <DirectionSheet
                isOpen={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                directionToEdit={directionToEdit}
            />
        </div>
        </PagePermissionGuard>
    );
}
