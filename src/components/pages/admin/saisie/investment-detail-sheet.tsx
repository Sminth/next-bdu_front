"use client";

import { Investment } from "@/types/investment.types";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Coins, TrendingUp, FileText, Target, MessageSquare, CheckCircle2 } from "lucide-react";

const MOIS_FR = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const formatMois = (mois: string) => {
    const [year, month] = mois.split("-");
    return `${MOIS_FR[parseInt(month, 10) - 1]} ${year}`;
};

const formatFCA = (amount: number) =>
    new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        maximumFractionDigits: 0,
    }).format(amount).replace("XOF", "FCFA");

const PRIORITY_STYLES: Record<string, string> = {
    HAUTE: "bg-red-50 text-red-700 border-red-200",
    MOYENNE: "bg-orange-50 text-orange-700 border-orange-200",
    BASSE: "bg-green-50 text-green-700 border-green-200",
};

const STATUS_STYLES: Record<string, string> = {
    EN_COURS: "bg-blue-50 text-blue-700 border-blue-200",
    NON_PROGRAMME: "bg-amber-50 text-amber-800 border-amber-200",
    TERMINE: "bg-green-50 text-green-700 border-green-200",
};

const STATUS_LABELS: Record<string, string> = {
    EN_COURS: "En cours",
    NON_PROGRAMME: "Non programmé",
    TERMINE: "Terminé",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2">
            <span className="text-sm text-muted-foreground shrink-0 w-44">{label}</span>
            <span className="text-sm font-medium text-right">{value ?? <span className="text-muted-foreground/40">—</span>}</span>
        </div>
    );
}

function Section({ icon: Icon, title, children }: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-xl border border-border/40 p-4 space-y-1">
            <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 text-[#2c63a8]" />
                <h4 className="text-sm font-semibold text-[#2c63a8]">{title}</h4>
            </div>
            {children}
        </div>
    );
}

interface InvestmentDetailSheetProps {
    investment: Investment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InvestmentDetailSheet({ investment, open, onOpenChange }: InvestmentDetailSheetProps) {
    if (!investment) return null;

    const gainsTotal = (investment.gains ?? []).reduce((s, g) => s + g.montant, 0);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl! w-full flex flex-col gap-0 p-0 overflow-hidden bg-[#f8f9fc]">
                <SheetHeader className="p-6 bg-white border-b border-border/40 shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <SheetTitle className="text-lg text-primary">
                                {investment.project?.name ?? "Investissement"}
                            </SheetTitle>
                            <SheetDescription className="mt-1">
                                Détails complets de la saisie — Année {investment.annee}
                            </SheetDescription>
                        </div>
                        <div className="flex gap-2 shrink-0 pt-1">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${PRIORITY_STYLES[investment.priorite] ?? ""}`}>
                                {investment.priorite}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[investment.statut] ?? ""}`}>
                                {STATUS_LABELS[investment.statut] ?? investment.statut}
                            </span>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

                    {/* Projet */}
                    <Section icon={FileText} title="Informations générales">
                        <InfoRow label="Projet" value={investment.project?.name} />
                        <InfoRow label="Domaine" value={investment.project?.domain?.name} />
                        <InfoRow label="Axe stratégique" value={investment.project?.axeStrategique?.name} />
                        <InfoRow label="Année" value={investment.annee} />
                        <InfoRow label="Priorité" value={
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_STYLES[investment.priorite] ?? ""}`}>
                                {investment.priorite}
                            </span>
                        } />
                        <InfoRow label="Statut" value={
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[investment.statut] ?? ""}`}>
                                {STATUS_LABELS[investment.statut] ?? investment.statut}
                            </span>
                        } />
                    </Section>

                    {/* Financier */}
                    <Section icon={Coins} title="Données financières">
                        <InfoRow label="Budget prévisionnel" value={<span className="font-semibold text-[#2c63a8]">{formatFCA(investment.budgetPrevisionnel)}</span>} />
                        <InfoRow label="Coût réel" value={investment.coutReel != null ? formatFCA(investment.coutReel) : null} />
                        <InfoRow
                            label="Gain par mensualité"
                            value={
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${investment.gainMensuel ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                                    {investment.gainMensuel ? "Oui" : "Non"}
                                </span>
                            }
                        />
                        {!investment.gainMensuel && (
                            <InfoRow label="Montant généré" value={investment.montantGenere != null ? formatFCA(investment.montantGenere) : null} />
                        )}
                        {!investment.gainMensuel && investment.methodeEstimation && (
                            <InfoRow label="Méthode d'estimation" value={investment.methodeEstimation} />
                        )}
                        <InfoRow label="Type de gain" value={investment.gainType?.name ?? null} />
                    </Section>

                    {/* Gains mensuels */}
                    {investment.gainMensuel && (investment.gains?.length ?? 0) > 0 && (
                        <Section icon={TrendingUp} title="Gains mensuels">
                            <div className="space-y-2 mt-1">
                                {investment.gains!.map((g) => (
                                    <div key={g.id} className="flex items-center justify-between py-1.5 px-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                        <span className="text-sm text-muted-foreground">{formatMois(g.mois)}</span>
                                        <span className="text-sm font-semibold text-[#2c63a8]">{formatFCA(g.montant)}</span>
                                    </div>
                                ))}
                                <Separator className="my-2" />
                                <div className="flex items-center justify-between px-3 pt-1">
                                    <span className="text-sm font-semibold">Total gains</span>
                                    <span className="text-base font-bold text-[#2c63a8]">{formatFCA(gainsTotal)}</span>
                                </div>
                            </div>
                        </Section>
                    )}

                    {/* KPI & Commentaires */}
                    {(investment.kpiCles || investment.commentaires) && (
                        <Section icon={Target} title="KPI & Commentaires">
                            {investment.kpiCles && <InfoRow label="KPI clés" value={investment.kpiCles} />}
                            {investment.commentaires && (
                                <div className="mt-2">
                                    <p className="text-xs text-muted-foreground mb-1">Commentaires</p>
                                    <p className="text-sm bg-muted/30 rounded-lg p-3 leading-relaxed">{investment.commentaires}</p>
                                </div>
                            )}
                        </Section>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
