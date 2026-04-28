"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Banknote,
  TrendingUp,
  ShieldCheck,
  Clock,
  BarChart3,
  Globe,
  Wallet,
  PiggyBank,
  Receipt,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/use-stats";
import { cn } from "@/lib/utils";

const MOIS_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function formatFCFA(amount: number) {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} Md FCFA`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} M FCFA`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)} K FCFA`;
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

function BudgetRowSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/15 p-4">
      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-6 w-36" />
      </div>
    </div>
  );
}

function BudgetSummarySkeleton() {
  return (
    <Card className="rounded-2xl border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <BudgetRowSkeleton />
          <BudgetRowSkeleton />
          <BudgetRowSkeleton />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

type BudgetMetricProps = {
  icon: React.ElementType;
  iconClass: string;
  label: string;
  value: string;
};

function BudgetMetricRow({ icon: Icon, iconClass, label, value }: BudgetMetricProps) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-border/60 bg-muted/15 p-3.5 sm:p-4">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10",
          iconClass,
        )}
      >
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium leading-snug text-muted-foreground sm:text-[13px]">{label}</p>
        <p className="mt-1 break-words text-base font-bold tabular-nums tracking-tight sm:text-lg">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardHomePage() {
  const [yearStr, setYearStr] = useState<string>("all");
  const [monthStr, setMonthStr] = useState<string>("all");

  const queryParams = useMemo(() => {
    if (yearStr === "all") return undefined;
    const annee = parseInt(yearStr, 10);
    if (Number.isNaN(annee)) return undefined;
    if (monthStr === "all") return { annee };
    const mois = parseInt(monthStr, 10);
    if (Number.isNaN(mois) || mois < 1 || mois > 12) return { annee };
    return { annee, mois };
  }, [yearStr, monthStr]);

  const { data: stats, isLoading, isError } = useDashboardStats(queryParams);

  const budgetConsumptionPct = useMemo(() => {
    if (!stats) return 0;
    const previ = stats.summary.budgetPrevisionnelTotal ?? stats.summary.budgetTotal;
    const reel = stats.summary.budgetReelTotal ?? stats.summary.coutReelTotal;
    if (!previ || previ === 0) return 0;
    return Math.min(Math.round((reel / previ) * 100), 100);
  }, [stats]);

  const validationPct = useMemo(() => {
    if (!stats || stats.summary.totalInvestments === 0) return 0;
    const termines = stats.summary.termines ?? stats.summary.validated ?? 0;
    return Math.round((termines / stats.summary.totalInvestments) * 100);
  }, [stats]);

  const periodSubtitle = useMemo(() => {
    if (yearStr === "all") return "Toutes les périodes";
    const y = parseInt(yearStr, 10);
    if (monthStr === "all") return `Année budgétaire ${y}`;
    const m = parseInt(monthStr, 10);
    return `${MOIS_LABELS[m - 1]} ${y} · projets dont la date de démarrage tombe dans ce mois`;
  }, [yearStr, monthStr]);

  const paymentPeriodHint = useMemo(() => {
    if (yearStr === "all") return "Toutes les dates (paiements)";
    if (monthStr === "all") return `Année civile ${yearStr} (paiements)`;
    return `${MOIS_LABELS[parseInt(monthStr, 10) - 1]} ${yearStr} (paiements)`;
  }, [yearStr, monthStr]);

  const availableYears = stats?.summary.availableYears ?? [];

  const previ = stats?.summary.budgetPrevisionnelTotal ?? stats?.summary.budgetTotal ?? 0;
  const reel = stats?.summary.budgetReelTotal ?? stats?.summary.coutReelTotal ?? 0;
  const depense = stats?.summary.budgetDepenseTotal ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-0 pb-8">
      {/* En-tête + filtres */}
      <header className="space-y-4 border-b border-border/40 pb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">Vue d&apos;ensemble</h1>
            <p className="text-pretty text-sm text-muted-foreground sm:text-base">
              Tableau de bord des investissements technologiques — <span className="text-foreground/80">{periodSubtitle}</span>
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:shrink-0">
            <Select
              value={yearStr}
              onValueChange={(v) => {
                setYearStr(v);
                if (v === "all") setMonthStr("all");
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-xl bg-background sm:min-w-[200px] sm:max-w-[240px] lg:w-[220px]">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les années</SelectItem>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={monthStr} onValueChange={setMonthStr} disabled={yearStr === "all"}>
              <SelectTrigger className="h-10 w-full rounded-xl bg-background sm:min-w-[200px] sm:max-w-[240px] lg:w-[220px]">
                <SelectValue placeholder="Mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toute l&apos;année</SelectItem>
                {MOIS_LABELS.map((label, idx) => (
                  <SelectItem key={label} value={String(idx + 1)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {isError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Impossible de charger les statistiques. Réessayez plus tard.
        </p>
      )}

      {/* Ligne 1 : KPI compacts */}
      <section aria-label="Indicateurs principaux">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <>
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
            </>
          ) : (
            <>
              <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Saisies</CardTitle>
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Briefcase className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold tabular-nums">{stats?.summary.totalInvestments ?? 0}</p>
                  <p className="mt-1 text-pretty text-xs text-muted-foreground">
                    {stats?.summary.enCours ?? 0} en cours ·{" "}
                    {stats?.summary.nonProgrammes ?? stats?.summary.brouillons ?? 0} non programmé(s)
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">ROI Moyen</CardTitle>
                  <div className="rounded-xl bg-green-500/10 p-2 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold tabular-nums">{stats?.summary.roiMoyen ?? 0}%</p>
                  <p className="mt-1 text-pretty text-xs text-muted-foreground">
                    Gains : {formatFCFA(stats?.summary.montantGenereTotal ?? 0)}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/50 shadow-sm sm:col-span-2 xl:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Taux terminé</CardTitle>
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold tabular-nums">{validationPct}%</p>
                  <p className="mt-1 text-pretty text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    {stats?.summary.termines ?? stats?.summary.validated ?? 0} terminé(s) sur{" "}
                    {stats?.summary.totalInvestments ?? 0}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* Ligne 2 : synthèse budgétaire pleine largeur */}
      <section aria-label="Synthèse budgétaire">
        {isLoading ? (
          <BudgetSummarySkeleton />
        ) : (
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Synthèse budgétaire</CardTitle>
              <div className="rounded-xl bg-orange-500/10 p-2 text-orange-600">
                <Banknote className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                <BudgetMetricRow
                  icon={PiggyBank}
                  iconClass="bg-sky-500/15 text-sky-700 dark:text-sky-300"
                  label="Budget prévisionnel total"
                  value={formatFCFA(previ)}
                />
                <BudgetMetricRow
                  icon={Wallet}
                  iconClass="bg-amber-500/15 text-amber-800 dark:text-amber-300"
                  label="Budget réel (coût réel)"
                  value={formatFCFA(reel)}
                />
                <BudgetMetricRow
                  icon={Receipt}
                  iconClass="bg-violet-500/15 text-violet-800 dark:text-violet-300"
                  label="Budget dépensé (paiements)"
                  value={formatFCFA(depense)}
                />
              </div>
              <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground sm:px-4">
                <p className="text-pretty">
                  <span className="font-medium text-foreground/80">{budgetConsumptionPct}%</span> du prévisionnel couvert par le
                  coût réel.
                </p>
                <p className="mt-1 text-pretty border-t border-border/30 pt-2 sm:mt-1.5 sm:border-0 sm:pt-0">
                  Période des paiements affichée : <span className="font-medium text-foreground/80">{paymentPeriodHint}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Graphiques & répartition */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5" aria-label="Analyses">
        <Card className="rounded-2xl border-border/50 shadow-sm lg:col-span-7">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 shrink-0 text-primary" />
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
              <div className="flex min-h-[160px] items-center justify-center text-sm text-muted-foreground sm:min-h-[200px]">
                Aucune donnée pour cette période
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.investmentsByYear.map((item) => {
                  const maxBudget = Math.max(...(stats?.investmentsByYear.map((y) => y.budget) ?? [1]));
                  const pct = maxBudget > 0 ? Math.round((item.budget / maxBudget) * 100) : 0;
                  const reelPct = item.budget > 0 ? Math.min(Math.round((item.coutReel / item.budget) * 100), 100) : 0;
                  return (
                    <div key={item.annee} className="space-y-2">
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-baseline sm:justify-between">
                        <span className="shrink-0 font-semibold text-foreground">{item.annee}</span>
                        <span className="min-w-0 text-pretty sm:text-right">
                          <span className="tabular-nums">{formatFCFA(item.budget)}</span>
                          <span className="text-muted-foreground/80"> · </span>
                          <span className="font-medium text-primary">{reelPct}%</span>
                          <span className="hidden sm:inline"> consommé</span>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm lg:col-span-5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 shrink-0 text-primary" />
              Répartition &amp; domaines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statuts</p>
              <div className="space-y-2.5">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-lg" />)
                ) : (
                  stats?.investmentsByStatus.map((s) => (
                    <div
                      key={s.statut}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border/40 px-3 py-2 text-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_COLORS[s.statut] ?? "bg-gray-400"}`} />
                        <span className="truncate">{STATUS_LABELS[s.statut] ?? s.statut}</span>
                      </div>
                      <Badge variant="secondary" className="shrink-0 tabular-nums">
                        {s.count}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            {stats?.topDomains && stats.topDomains.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top domaines</p>
                <div className="space-y-2">
                  {stats.topDomains.slice(0, 4).map((d) => (
                    <div key={d.domainId} className="flex min-w-0 items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate font-medium">{d.name}</span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {d.count} saisie{d.count > 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Saisies récentes */}
      <section aria-label="Saisies récentes">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 shrink-0 text-primary" />
              Saisies récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : stats?.recentInvestments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Aucune saisie pour cette période</p>
            ) : (
              <ul className="divide-y divide-border/50">
                {stats?.recentInvestments.map((inv: { id: string; statut: string; annee: number; budgetPrevisionnel: number; project?: { name?: string; domain?: { name?: string } } }) => (
                  <li key={inv.id}>
                    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug">{inv.project?.name ?? "—"}</p>
                        <p className="mt-0.5 text-pretty text-xs text-muted-foreground">
                          {inv.project?.domain?.name ?? "—"} · {inv.annee}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center sm:text-right">
                        <p className="text-sm font-semibold tabular-nums sm:text-base">{formatFCFA(inv.budgetPrevisionnel)}</p>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                            inv.statut === "TERMINE" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
                            inv.statut === "EN_COURS" && "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
                            inv.statut !== "TERMINE" &&
                              inv.statut !== "EN_COURS" &&
                              "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
                          )}
                        >
                          {STATUS_LABELS[inv.statut] ?? inv.statut}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
