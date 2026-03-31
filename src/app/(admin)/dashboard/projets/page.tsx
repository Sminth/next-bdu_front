"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Pencil, Plus, Trash2, Loader2, Search, Download, Eye, Banknote } from "lucide-react";

import { useProjectsPaged, useDeleteProject } from "@/hooks/use-projects";
import { Project } from "@/types/project.types";
import { projectService } from "@/services/project.service";

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
import { ProjectSheet } from "@/components/features/projects/project-sheet";
import { ProjectDetailSheet } from "@/components/features/projects/project-detail-sheet";
import { ProjectPaymentSheet } from "@/components/features/projects/project-payment-sheet";
import { PagePermissionGuard } from "@/components/auth/page-permission-guard";
import { exportToCSV } from "@/lib/export";
import { usePermission } from "@/lib/permissions";
import { toast } from "@/lib/toast";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function ProjectsPage() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const deleteMutation = useDeleteProject();
    const { can } = usePermission();

    const canCreate = can("project.create");
    const canUpdate = can("project.update");
    const canDelete = can("project.delete");

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [projectToView, setProjectToView] = useState<Project | null>(null);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [projectForPayment, setProjectForPayment] = useState<Project | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [exporting, setExporting] = useState(false);

    const debouncedQuery = useDebouncedValue(searchQuery, 350);
    useEffect(() => {
        setPage(1);
    }, [debouncedQuery, pageSize]);

    const { data, isLoading, isError } = useProjectsPaged({
        page,
        pageSize,
        q: debouncedQuery,
    });
    const projects = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const handleOpenCreate = () => {
        setProjectToEdit(null);
        setIsSheetOpen(true);
    };

    const handleOpenEdit = (project: Project) => {
        setProjectToEdit(project);
        setIsSheetOpen(true);
    };

    const handleView = (project: Project) => {
        setProjectToView(project);
        setDetailOpen(true);
    };

    const handlePayments = (project: Project) => {
        setProjectForPayment(project);
        setPaymentOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.")) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const data = await projectService.exportAll();
            exportToCSV(data, `projets-${format(new Date(), "yyyyMMdd")}`);
        } catch {
            toast.error("Erreur lors de l'export");
        } finally {
            setExporting(false);
        }
    };

    return (
        <PagePermissionGuard permission="project.read">
        <div className="flex flex-col gap-6 w-full fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Gérez la liste de tous les projets de la plateforme.
                    </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={handleExport} disabled={exporting}>
                        {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                        Exporter
                    </Button>
                    {canCreate && (
                        <Button onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4 mr-2" />Ajouter
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
                        Une erreur est survenue lors du chargement des projets.
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center p-12 text-muted-foreground">
                        Aucun projet trouvé {searchQuery && "pour cette recherche"}.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Libellé</TableHead>
                                    <TableHead>Domaine</TableHead>
                                    <TableHead>Axe stratégique</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Créé le</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.map((project) => (
                                    <TableRow key={project.id} className="hover:bg-muted/30">
                                        <TableCell className="font-medium max-w-[360px]">
                                            <div className="truncate" title={project.name}>
                                                {project.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {project.domain?.name || <span className="text-muted-foreground/50">—</span>}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {project.axeStrategique?.name || <span className="text-muted-foreground/50">—</span>}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                                            {project.description || "—"}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {format(new Date(project.createdAt), "dd MMM yyyy", { locale: fr })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-[#2c63a8] hover:bg-blue-50"
                                                    onClick={() => handleView(project)}
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">Voir</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handlePayments(project)}
                                                    title="Gérer les paiements prestataire"
                                                >
                                                    <Banknote className="h-4 w-4" />
                                                    <span className="sr-only">Paiements</span>
                                                </Button>
                                                {canUpdate && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleOpenEdit(project)}
                                                    >
                                                        <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        <span className="sr-only">Modifier</span>
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleDelete(project.id)}
                                                        disabled={deleteMutation.isPending && deleteMutation.variables === project.id}
                                                    >
                                                        {deleteMutation.isPending && deleteMutation.variables === project.id ? (
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

            <ProjectSheet
                isOpen={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                projectToEdit={projectToEdit}
            />

            <ProjectDetailSheet
                project={projectToView}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />

            <ProjectPaymentSheet
                project={projectForPayment}
                open={paymentOpen}
                onOpenChange={(v) => {
                    setPaymentOpen(v);
                    if (!v) setProjectForPayment(null);
                }}
            />
        </div>
        </PagePermissionGuard>
    );
}
