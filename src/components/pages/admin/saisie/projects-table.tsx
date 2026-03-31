"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Pencil, Trash2, Loader2, FileText } from "lucide-react";
import { useInvestments, useDeleteInvestment } from "@/hooks/use-investments";
import { Investment } from "@/types/investment.types";
import { investmentService } from "@/services/investment.service";
import { AddProjectSheet } from "@/components/pages/admin/saisie/add-project-sheet";
import { InvestmentDetailSheet } from "@/components/pages/admin/saisie/investment-detail-sheet";
import { usePermission } from "@/lib/permissions";
import { exportToCSV } from "@/lib/export";
import { toast } from "@/lib/toast";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const formatFCA = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        maximumFractionDigits: 0,
    }).format(amount).replace("XOF", "FCFA");
};

const STATUS_STYLES: Record<string, string> = {
    EN_COURS: "text-blue-600 bg-blue-50 border-blue-200",
    NON_PROGRAMME: "text-amber-700 bg-amber-50 border-amber-200",
    TERMINE: "text-green-600 bg-green-50 border-green-200",
};

const STATUS_LABELS: Record<string, string> = {
    EN_COURS: "En cours",
    NON_PROGRAMME: "Non programmé",
    TERMINE: "Terminé",
};

const PRIORITY_STYLES: Record<string, string> = {
    HAUTE: "text-red-600 bg-red-50 border-red-200",
    MOYENNE: "text-orange-600 bg-orange-50 border-orange-200",
    BASSE: "text-green-600 bg-green-50 border-green-200",
};

export function ProjectsTable() {
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [searchQuery, setSearchQuery] = React.useState("");
    const debouncedQuery = useDebouncedValue(searchQuery, 350);

    React.useEffect(() => {
        setPage(1);
    }, [debouncedQuery, pageSize]);

    const { data, isLoading, isError } = useInvestments({
        page,
        pageSize,
        q: debouncedQuery,
    });
    const investments = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const deleteMutation = useDeleteInvestment();
    const { can } = usePermission();

    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [investmentToEdit, setInvestmentToEdit] = React.useState<Investment | null>(null);
    const [detailOpen, setDetailOpen] = React.useState(false);
    const [investmentToView, setInvestmentToView] = React.useState<Investment | null>(null);
    const [exporting, setExporting] = React.useState(false);

    const handleView = (inv: Investment) => {
        setInvestmentToView(inv);
        setDetailOpen(true);
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const data = await investmentService.exportAll();
            exportToCSV(data, "saisies");
        } catch {
            toast.error("Erreur lors de l'export");
        } finally {
            setExporting(false);
        }
    };

    const handleEdit = (investment: Investment) => {
        setInvestmentToEdit(investment);
        setIsSheetOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette saisie ?")) {
            await deleteMutation.mutateAsync(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-12 bg-white rounded-2xl border border-border/40 shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center p-12 bg-white rounded-2xl border border-border/40 shadow-sm text-destructive">
                Erreur lors du chargement des saisies.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-border/40 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher par projet, statut..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 bg-muted/50 border-none rounded-full h-9"
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-full px-4 border-border/50"
                        onClick={handleExport}
                        disabled={exporting || !total}
                    >
                        {exporting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
                        Exporter
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-border/40 overflow-hidden mt-2">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">ANNÉE</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">PROJET</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider text-center">PRIORITÉ</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">BUDGET</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">COÛT RÉEL</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider text-center">STATUT</TableHead>
                            <TableHead className="text-right font-semibold text-xs text-muted-foreground uppercase tracking-wider">ACTIONS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {investments.length > 0 ? (
                            investments.map((inv) => (
                                <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium text-xs text-muted-foreground">{inv.annee}</TableCell>
                                    <TableCell className="font-medium text-primary max-w-[420px]">
                                        <div className="truncate" title={inv.project?.name || ""}>
                                            {inv.project?.name || "Projet Inconnu"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_STYLES[inv.priorite] ?? ""}`}>
                                            {inv.priorite}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium text-right text-sm">{formatFCA(inv.budgetPrevisionnel)}</TableCell>
                                    <TableCell className="text-right text-sm text-muted-foreground">
                                        {inv.coutReel != null ? formatFCA(inv.coutReel) : <span className="text-muted-foreground/40">—</span>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[inv.statut] ?? ""}`}>
                                            {STATUS_LABELS[inv.statut] ?? inv.statut}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* Œil — visible pour tous ayant saisie.read */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-[#2c63a8] hover:bg-blue-50"
                                                onClick={() => handleView(inv)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {can("saisie.update") && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => handleEdit(inv)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {can("saisie.delete") && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(inv.id)}
                                                    disabled={deleteMutation.isPending && deleteMutation.variables === inv.id}
                                                >
                                                    {deleteMutation.isPending && deleteMutation.variables === inv.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <FileText className="h-8 w-8 mb-2 opacity-20" />
                                        <p>Aucune saisie trouvée</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
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

            <AddProjectSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                investmentToEdit={investmentToEdit}
            />

            <InvestmentDetailSheet
                open={detailOpen}
                onOpenChange={setDetailOpen}
                investment={investmentToView}
            />
        </div>
    );
}
