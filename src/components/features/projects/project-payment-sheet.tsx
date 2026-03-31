"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Trash2, Loader2, Banknote, AlertCircle, CheckCircle2 } from "lucide-react";

import { Project } from "@/types/project.types";
import {
    useProjectPayments,
    useCreatePayments,
    useDeletePayment,
} from "@/hooks/use-projects";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const formatFCA = (amount: number) =>
    new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        maximumFractionDigits: 0,
    })
        .format(amount)
        .replace("XOF", "FCFA");

const paymentRowSchema = z.object({
    date: z.string().min(1, "Date requise"),
    montant: z
        .string()
        .min(1, "Montant requis")
        .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Montant invalide"),
    note: z.string().optional(),
});

const formSchema = z.object({
    rows: z.array(paymentRowSchema).min(1),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectPaymentSheetProps {
    project: Project | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProjectPaymentSheet({
    project,
    open,
    onOpenChange,
}: ProjectPaymentSheetProps) {
    const projectId = project?.id ?? "";
    const montantContrat = project?.montantContrat ?? null;

    const { data: payments = [], isLoading } = useProjectPayments(open ? projectId : null);
    const createMutation = useCreatePayments(projectId);
    const deleteMutation = useDeletePayment(projectId);

    const totalPaid = payments.reduce((s, p) => s + p.montant, 0);
    const remaining = montantContrat !== null ? montantContrat - totalPaid : null;
    const isFull = remaining !== null && remaining <= 0;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rows: [{ date: "", montant: "", note: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "rows",
    });

    /* Calcul du total des nouvelles entrées en cours de saisie */
    const watchedRows = form.watch("rows");
    const newEntriesTotal = watchedRows.reduce((s, r) => {
        const v = parseFloat(r.montant);
        return s + (isNaN(v) ? 0 : v);
    }, 0);

    const projectedTotal = totalPaid + newEntriesTotal;
    const canAddRow =
        montantContrat === null || projectedTotal < montantContrat;

    const onSubmit = async (values: FormValues) => {
        await createMutation.mutateAsync(
            values.rows.map((r) => ({
                date: r.date,
                montant: parseFloat(r.montant),
                note: r.note || undefined,
            }))
        );
        form.reset({ rows: [{ date: "", montant: "", note: "" }] });
    };

    const handleDelete = async (paymentId: string) => {
        if (confirm("Supprimer cette tranche de paiement ?")) {
            await deleteMutation.mutateAsync(paymentId);
        }
    };

    if (!project) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl! w-full flex flex-col gap-0 p-0 overflow-hidden bg-[#f8f9fc]">
                {/* Header */}
                <SheetHeader className="p-6 bg-white border-b border-border/40 shrink-0">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#2c63a8]/10 flex items-center justify-center shrink-0">
                            <Banknote className="h-5 w-5 text-[#2c63a8]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <SheetTitle className="text-base text-primary truncate">
                                Paiements prestataire
                            </SheetTitle>
                            <SheetDescription className="mt-0.5 truncate">
                                {project.name}
                                {project.prestataire ? ` — ${project.prestataire}` : ""}
                            </SheetDescription>
                        </div>
                    </div>

                    {/* Jauges budgétaires */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="bg-[#f8f9fc] rounded-lg p-3 border border-border/40">
                            <p className="text-xs text-muted-foreground mb-1">Montant contrat</p>
                            <p className="text-sm font-bold text-foreground">
                                {montantContrat !== null ? formatFCA(montantContrat) : <span className="text-muted-foreground/50">—</span>}
                            </p>
                        </div>
                        <div className="bg-[#f8f9fc] rounded-lg p-3 border border-border/40">
                            <p className="text-xs text-muted-foreground mb-1">Total versé</p>
                            <p className="text-sm font-bold text-[#2c63a8]">
                                {formatFCA(totalPaid)}
                            </p>
                        </div>
                        <div className={`rounded-lg p-3 border ${isFull ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
                            <p className="text-xs text-muted-foreground mb-1">Reste à verser</p>
                            <p className={`text-sm font-bold ${isFull ? "text-green-700" : "text-orange-700"}`}>
                                {remaining !== null ? (
                                    isFull ? (
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Soldé
                                        </span>
                                    ) : formatFCA(remaining)
                                ) : (
                                    <span className="text-muted-foreground/50">—</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Barre de progression */}
                    {montantContrat !== null && montantContrat > 0 && (
                        <div className="mt-3">
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${isFull ? "bg-green-500" : "bg-[#2c63a8]"}`}
                                    style={{
                                        width: `${Math.min(100, (totalPaid / montantContrat) * 100)}%`,
                                    }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 text-right">
                                {Math.round((totalPaid / montantContrat) * 100)}% versé
                            </p>
                        </div>
                    )}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {/* Historique des paiements */}
                    <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
                        <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-foreground">
                                Historique des versements
                            </h4>
                            <span className="text-xs text-muted-foreground">
                                {payments.length} tranche{payments.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center p-6">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : payments.length === 0 ? (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                Aucun versement enregistré.
                            </div>
                        ) : (
                            <div className="divide-y divide-border/40">
                                {payments.map((p, idx) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-7 w-7 rounded-full bg-[#2c63a8]/10 flex items-center justify-center text-xs font-bold text-[#2c63a8] shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium">
                                                    {format(new Date(p.date), "dd MMM yyyy", { locale: fr })}
                                                </p>
                                                {p.note && (
                                                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                                        {p.note}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-sm font-bold text-[#2c63a8]">
                                                {formatFCA(p.montant)}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(p.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Alerte contrat soldé */}
                    {isFull && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            Le contrat est entièrement soldé. Aucun versement supplémentaire possible.
                        </div>
                    )}

                    {/* Formulaire d'ajout */}
                    {!isFull && (
                        <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
                            <div className="px-4 py-3 border-b border-border/40">
                                <h4 className="text-sm font-semibold text-foreground">
                                    Nouveau(x) versement(s)
                                </h4>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-3">
                                    {fields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-2 items-start"
                                        >
                                            {/* Date */}
                                            <FormField
                                                control={form.control}
                                                name={`rows.${index}.date`}
                                                render={({ field: f }) => (
                                                    <FormItem>
                                                        {index === 0 && (
                                                            <FormLabel className="text-xs font-medium text-muted-foreground">
                                                                Date
                                                            </FormLabel>
                                                        )}
                                                        <FormControl>
                                                            <Input
                                                                type="date"
                                                                {...f}
                                                                className="text-sm h-9"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Montant */}
                                            <FormField
                                                control={form.control}
                                                name={`rows.${index}.montant`}
                                                render={({ field: f }) => (
                                                    <FormItem>
                                                        {index === 0 && (
                                                            <FormLabel className="text-xs font-medium text-muted-foreground">
                                                                Montant (FCFA)
                                                            </FormLabel>
                                                        )}
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                step="any"
                                                                placeholder="0"
                                                                {...f}
                                                                className="text-sm h-9"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Note */}
                                            <FormField
                                                control={form.control}
                                                name={`rows.${index}.note`}
                                                render={({ field: f }) => (
                                                    <FormItem>
                                                        {index === 0 && (
                                                            <FormLabel className="text-xs font-medium text-muted-foreground">
                                                                Note (optionnel)
                                                            </FormLabel>
                                                        )}
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Ex: Acompte 1ère tranche"
                                                                {...f}
                                                                className="text-sm h-9"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Supprimer ligne */}
                                            <div className={index === 0 ? "pt-6" : "pt-0"}>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                                    onClick={() => remove(index)}
                                                    disabled={fields.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Alerte dépassement */}
                                    {montantContrat !== null && projectedTotal > montantContrat && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                            Le total dépasse le montant du contrat de{" "}
                                            <strong>{formatFCA(projectedTotal - montantContrat)}</strong>.
                                        </div>
                                    )}

                                    <Separator />

                                    <div className="flex items-center justify-between pt-1">
                                        {/* Bouton + */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-1.5"
                                            disabled={!canAddRow}
                                            onClick={() =>
                                                append({ date: "", montant: "", note: "" })
                                            }
                                            title={
                                                !canAddRow
                                                    ? "Montant du contrat atteint"
                                                    : "Ajouter une tranche"
                                            }
                                        >
                                            <Plus className="h-4 w-4" />
                                            Ajouter une tranche
                                        </Button>

                                        {/* Enregistrer */}
                                        <Button
                                            type="submit"
                                            size="sm"
                                            className="bg-[#2c63a8] hover:bg-[#245291]"
                                            disabled={
                                                createMutation.isPending ||
                                                (montantContrat !== null && projectedTotal > montantContrat)
                                            }
                                        >
                                            {createMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : null}
                                            Enregistrer
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
