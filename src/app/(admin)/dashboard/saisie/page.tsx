"use client";

import { useMemo } from "react";
import { AddProjectSheet } from "@/components/pages/admin/saisie/add-project-sheet";
import { ProjectsTable } from "@/components/pages/admin/saisie/projects-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Coins, BringToFront, Activity } from "lucide-react";
import { useInvestments } from "@/hooks/use-investments";
import { usePermission } from "@/lib/permissions";
import { PagePermissionGuard } from "@/components/auth/page-permission-guard";

const formatFCA = (amount: number) =>
    new Intl.NumberFormat("fr-FR", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(amount) + " FCFA";

export default function SaisiePage() {
    const { data } = useInvestments({ page: 1, pageSize: 10, q: "" });
    const investments = data?.items ?? [];
    const { can } = usePermission();

    const stats = useMemo(() => {
        const total = investments.length;
        const budgetGlobal = investments.reduce((sum, inv) => sum + (inv.budgetPrevisionnel || 0), 0);
        const validated = investments.filter((inv) => inv.statut === "TERMINE").length;

        const rois = investments
            .filter((inv) => inv.budgetPrevisionnel > 0 && inv.montantGenere != null && inv.montantGenere > 0)
            .map((inv) => ((inv.montantGenere! / inv.budgetPrevisionnel) * 100));

        const roiMoyen = rois.length > 0 ? rois.reduce((a, b) => a + b, 0) / rois.length : 0;

        return { total, budgetGlobal, validated, roiMoyen };
    }, [investments]);

    return (
        <PagePermissionGuard permission="saisie.read">
        <div className="flex flex-col gap-6 w-full fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Saisie des données</h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestion et suivi des bordereaux de projets d'investissement technologique.</p>
                </div>
                {can("saisie.create") && <AddProjectSheet />}
            </div>

            {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-2xl border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Saisies</CardTitle>
                        <div className="bg-primary/10 p-2 rounded-xl text-primary">
                            <FileText className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            investissements enregistrés
                        </p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Budget Global</CardTitle>
                        <div className="bg-orange-500/10 p-2 rounded-xl text-orange-600">
                            <Coins className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatFCA(stats.budgetGlobal)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            budget prévisionnel total
                        </p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">ROI Moyen</CardTitle>
                        <div className="bg-green-500/10 p-2 rounded-xl text-green-600">
                            <Activity className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.roiMoyen.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            sur l'ensemble des investissements
                        </p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Projets Validés</CardTitle>
                        <div className="bg-blue-500/10 p-2 rounded-xl text-blue-600">
                            <BringToFront className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.validated}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            investissements validés
                        </p>
                    </CardContent>
                </Card>
            </div> */}

            <div className="mt-4">
                <ProjectsTable />
            </div>
        </div>
        </PagePermissionGuard>
    );
}

