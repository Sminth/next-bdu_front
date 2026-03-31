"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Banknote,
  TrendingUp,
  ShieldCheck,
  Clock,
  BarChart3,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/use-stats";

function formatFCFA(amount: number) {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}Md FCFA`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M FCFA`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K FCFA`;
  return `${amount} FCFA`;
}

const STATUS_LABELS: Record<string, string> = {
  EN_COURS: "En cours",
  NON_PROGRAMME: "Non programmé",
  TERMINE: "Terminé",
};

const STATUS_COLORS: Record<string, string> = {
  EN_COURS: "bg-blue-500",
  NON_PROGRAMME: "bg-amber-400",
  TERMINE: "bg-emerald-500",
};

function KpiSkeleton() {
  return (
    <Card className="rounded-2xl border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-24 mb-1" />
        <Skeleton className="h-3 w-40" />
      </CardContent>
    </Card>
  );
}

export default function DashboardHomePage() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  const budgetConsumptionPct = useMemo(() => {
    if (!stats) return 0;
    const { budgetTotal, coutReelTotal } = stats.summary;
    if (!budgetTotal || budgetTotal === 0) return 0;
    return Math.min(Math.round((coutReelTotal / budgetTotal) * 100), 100);
  }, [stats]);

  const validationPct = useMemo(() => {
    if (!stats || stats.summary.totalInvestments === 0) return 0;
    const termines =
      (stats.summary as { termines?: number }).termines ??
      stats.summary.validated ??
      0;
    return Math.round((termines / stats.summary.totalInvestments) * 100);
  }, [stats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Vue d'ensemble</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Tableau de bord des investissements technologiques — {stats?.summary.currentYear ?? new Date().getFullYear()}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Saisies</CardTitle>
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <Briefcase className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.summary.totalInvestments ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.summary.enCours ?? 0} en cours ·{" "}
                  {(stats?.summary as { nonProgrammes?: number }).nonProgrammes ??
                    stats?.summary.brouillons ??
                    0}{" "}
                  non programmé(s)
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Budget Global</CardTitle>
                <div className="bg-orange-500/10 p-2 rounded-xl text-orange-600">
                  <Banknote className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatFCFA(stats?.summary.budgetTotal ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {budgetConsumptionPct}% consommé · {formatFCFA(stats?.summary.coutReelTotal ?? 0)} réel
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ROI Moyen</CardTitle>
                <div className="bg-green-500/10 p-2 rounded-xl text-green-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.summary.roiMoyen ?? 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gains : {formatFCFA(stats?.summary.montantGenereTotal ?? 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taux terminé</CardTitle>
                <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{validationPct}%</div>
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  {(stats?.summary as { termines?: number }).termines ??
                    stats?.summary.validated ??
                    0}{" "}
                  terminé(s) sur {stats?.summary.totalInvestments ?? 0}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Second Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Budget par année */}
        <Card className="col-span-4 rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-primary" />
              Budget par année
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : stats?.investmentsByYear.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée disponible
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.investmentsByYear.map((item) => {
                  const maxBudget = Math.max(...(stats?.investmentsByYear.map(y => y.budget) ?? [1]));
                  const pct = maxBudget > 0 ? Math.round((item.budget / maxBudget) * 100) : 0;
                  const reelPct = item.budget > 0 ? Math.min(Math.round((item.coutReel / item.budget) * 100), 100) : 0;
                  return (
                    <div key={item.annee} className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{item.annee}</span>
                        <span>{formatFCFA(item.budget)} · <span className="text-blue-600">{reelPct}% consommé</span></span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status + Top Domains */}
        <Card className="col-span-3 rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="w-4 h-4 text-primary" />
              Répartition & Domaines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status breakdown */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wider">Statuts</p>
              <div className="space-y-2">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)
                ) : (
                  stats?.investmentsByStatus.map((s) => (
                    <div key={s.statut} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[s.statut] ?? 'bg-gray-400'}`} />
                        <span>{STATUS_LABELS[s.statut] ?? s.statut}</span>
                      </div>
                      <Badge variant="secondary">{s.count}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Domains */}
            {stats?.topDomains && stats.topDomains.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wider">Top Domaines</p>
                <div className="space-y-2">
                  {stats.topDomains.slice(0, 4).map((d) => (
                    <div key={d.domainId} className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[150px]">{d.name}</span>
                      <span className="text-muted-foreground text-xs">{d.count} saisie{d.count > 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Investments */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4 text-primary" />
            Saisies récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : stats?.recentInvestments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune saisie récente</p>
          ) : (
            <div className="divide-y divide-border/50">
              {stats?.recentInvestments.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{inv.project?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{inv.project?.domain?.name ?? "—"} · {inv.annee}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatFCFA(inv.budgetPrevisionnel)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inv.statut === "TERMINE" ? "bg-emerald-100 text-emerald-700" : inv.statut === "EN_COURS" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-800"}`}>
                      {STATUS_LABELS[inv.statut] ?? inv.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
