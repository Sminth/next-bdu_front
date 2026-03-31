"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";

const MOIS_FR = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const YEARS = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 3 + i);

/** Sélecteur mois + année combinés — valeur au format "YYYY-MM" */
function MonthYearPicker({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const [year, setYear] = React.useState(() => value ? value.split("-")[0] : String(new Date().getFullYear()));
    const [month, setMonth] = React.useState(() => value ? value.split("-")[1] : "");

    React.useEffect(() => {
        if (value) {
            const [y, m] = value.split("-");
            setYear(y);
            setMonth(m);
        }
    }, [value]);

    const handleChange = (newYear: string, newMonth: string) => {
        setYear(newYear);
        setMonth(newMonth);
        if (newYear && newMonth) onChange(`${newYear}-${newMonth}`);
    };

    return (
        <div className="flex gap-2">
            <select
                value={month}
                onChange={(e) => handleChange(year, e.target.value)}
                className="flex-1 h-10 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
                <option value="">Mois</option>
                {MOIS_FR.map((m, i) => (
                    <option key={i} value={String(i + 1).padStart(2, "0")}>{m}</option>
                ))}
            </select>
            <select
                value={year}
                onChange={(e) => handleChange(e.target.value, month)}
                className="w-[90px] h-10 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
                {YEARS.map((y) => (
                    <option key={y} value={String(y)}>{y}</option>
                ))}
            </select>
        </div>
    );
}

import { useCreateInvestment, useUpdateInvestment } from "@/hooks/use-investments";
import { useProjects } from "@/hooks/use-projects";
import { useGainTypes } from "@/hooks/use-gain-types";
import { Investment, Priority } from "@/types/investment.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const gainSchema = z.object({
    mois: z.string().min(1, "Sélectionnez un mois"),
    montant: z.coerce.number().min(0, "Le montant doit être positif"),
});

const formSchema = z.object({
    projectId: z.string().min(1, "Veuillez sélectionner un projet"),
    annee: z.coerce.number().min(2000, "Année invalide").max(2100, "Année invalide"),
    priorite: z.enum(["HAUTE", "MOYENNE", "BASSE"]),
    budgetPrevisionnel: z.coerce.number().min(0, "Le budget doit être positif"),
    coutReel: z.coerce.number().min(0).optional().or(z.literal("")),
    gainMensuel: z.boolean().default(false),
    statut: z.enum(["EN_COURS", "NON_PROGRAMME", "TERMINE"]),
    gainTypeId: z.string().optional(),
    methodeEstimation: z.string().optional(),
    kpiCles: z.string().optional(),
    commentaires: z.string().optional(),
    gains: z.array(gainSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddProjectSheetProps {
    investmentToEdit?: Investment | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddProjectSheet({ investmentToEdit, open, onOpenChange }: AddProjectSheetProps) {
    const [step, setStep] = React.useState(1);
    const [internalOpen, setInternalOpen] = React.useState(false);

    const isControlled = open !== undefined && onOpenChange !== undefined;
    const isSheetOpen = isControlled ? open : internalOpen;
    const setIsSheetOpen = isControlled ? onOpenChange : setInternalOpen;

    const { data: projects, isLoading: isLoadingProjects } = useProjects();
    const { data: gainTypes = [], isLoading: isLoadingGainTypes } = useGainTypes();

    const createMutation = useCreateInvestment();
    const updateMutation = useUpdateInvestment();
    const isEditing = !!investmentToEdit;
    const isPending = createMutation.isPending || updateMutation.isPending;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            projectId: "",
            annee: new Date().getFullYear(),
            priorite: "MOYENNE",
            budgetPrevisionnel: 0,
            coutReel: "",
            gainMensuel: false,
            statut: "NON_PROGRAMME",
            gainTypeId: "",
            methodeEstimation: "",
            kpiCles: "",
            commentaires: "",
            gains: [{ mois: "", montant: 0 }],
        },
    });

    const { fields: gainFields, append: appendGain, remove: removeGain } = useFieldArray({
        control: form.control,
        name: "gains",
    });

    const gainMensuel = form.watch("gainMensuel");
    const totalSteps = gainMensuel ? 3 : 2;

    React.useEffect(() => {
        if (investmentToEdit && isSheetOpen) {
            form.reset({
                projectId: investmentToEdit.projectId || "",
                annee: investmentToEdit.annee || new Date().getFullYear(),
                priorite: investmentToEdit.priorite || "MOYENNE",
                budgetPrevisionnel: investmentToEdit.budgetPrevisionnel || 0,
                coutReel: investmentToEdit.coutReel ?? "",
                gainMensuel: investmentToEdit.gainMensuel || false,
                statut: (["EN_COURS", "NON_PROGRAMME", "TERMINE"].includes(investmentToEdit.statut)
                    ? investmentToEdit.statut
                    : "NON_PROGRAMME") as "EN_COURS" | "NON_PROGRAMME" | "TERMINE",
                gainTypeId: investmentToEdit.gainTypeId || "",
                methodeEstimation: investmentToEdit.methodeEstimation || "",
                kpiCles: investmentToEdit.kpiCles || "",
                commentaires: investmentToEdit.commentaires || "",
                gains: investmentToEdit.gains?.length
                    ? investmentToEdit.gains.map((g) => ({ mois: g.mois, montant: g.montant }))
                    : [{ mois: "", montant: 0 }],
            });
            setStep(1);
        } else if (!isSheetOpen && !isControlled) {
            form.reset();
            setStep(1);
        }
    }, [investmentToEdit, isSheetOpen, form, isControlled]);

    const handleNext = () => setStep((s) => s + 1);
    const handleBack = () => setStep((s) => s - 1);

    const onSubmit = async (values: FormValues) => {
        const payload = {
            ...values,
            coutReel: values.coutReel === "" ? undefined : Number(values.coutReel),
            gainTypeId: values.gainTypeId || undefined,
            gains: values.gainMensuel
                ? (values.gains ?? []).filter((g) => g.mois && g.montant >= 0)
                : undefined,
        };

        try {
            if (isEditing) {
                await updateMutation.mutateAsync({ id: investmentToEdit.id, payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            setIsSheetOpen(false);
            if (!isControlled) {
                form.reset();
                setStep(1);
            }
        } catch {
            // Toast géré par le hook
        }
    };

    const onError = (errors: any) => {
        const step1Fields = ["projectId", "annee", "priorite"];
        if (step1Fields.some((f) => errors[f])) setStep(1);
    };

    const handleFormSubmit = () => form.handleSubmit(onSubmit, onError)();

    const FCFA = (v: number) =>
        new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

    const gainsTotal = (form.watch("gains") ?? []).reduce(
        (s, g) => s + (Number(g.montant) || 0),
        0
    );

    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            {!isControlled && (
                <SheetTrigger asChild>
                    <Button className="bg-[#2c63a8] hover:bg-[#2c63a8]/90 text-white rounded-md px-6 shadow-sm cursor-pointer">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvelle saisie
                    </Button>
                </SheetTrigger>
            )}
            <SheetContent className="sm:max-w-2xl! w-full flex flex-col gap-0 p-0 overflow-hidden bg-[#f8f9fc]">
                <SheetHeader className="p-6 bg-white border-b border-border/40 shrink-0">
                    <SheetTitle className="text-xl text-primary">
                        {isEditing ? "Modifier l'investissement" : "Ajouter un nouvel investissement"}
                    </SheetTitle>
                    <SheetDescription>
                        Renseignez les détails de la saisie d'investissement technologique.
                    </SheetDescription>

                    {/* Stepper */}
                    <div className="flex items-center justify-between w-full mt-6 px-8">
                        {[
                            { label: "Infos\nGénérales" },
                            { label: "Financier\n& KPI" },
                            ...(gainMensuel ? [{ label: "Gains\nMensuels" }] : []),
                        ].map((s, i) => (
                            <React.Fragment key={i}>
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step >= i + 1 ? "bg-[#2c63a8] text-white" : "bg-muted text-muted-foreground"}`}>
                                        {i + 1}
                                    </div>
                                    <span className="text-xs font-medium px-2 text-center whitespace-pre-line leading-tight">
                                        {s.label}
                                    </span>
                                </div>
                                {i < (gainMensuel ? 2 : 1) && (
                                    <div className={`h-[2px] flex-1 mx-2 transition-colors ${step >= i + 2 ? "bg-[#2c63a8]" : "bg-muted"}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-2">
                    <div className="p-2">
                        <Form {...form}>
                            <form id="investment-form" className="space-y-4">

                                {/* ── ÉTAPE 1 ── */}
                                <div className={step === 1 ? "space-y-4 animate-in fade-in slide-in-from-right-4" : "hidden"}>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Informations Générales</h3>

                                    <FormField
                                        control={form.control}
                                        name="projectId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Projet <span className="text-red-500">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingProjects}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white w-full h-11! [&>span]:truncate">
                                                            <SelectValue placeholder={isLoadingProjects ? "Chargement..." : "Sélectionner un projet existant"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {projects?.map((p) => (
                                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4 items-start">
                                        <FormField
                                            control={form.control}
                                            name="annee"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium block">Année <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="2000" max="2100" className="bg-white w-full h-11" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="priorite"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Priorité</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white w-full h-11! [&>span]:truncate">
                                                                <SelectValue placeholder="Sélectionner la priorité" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="HAUTE">Haute</SelectItem>
                                                            <SelectItem value="MOYENNE">Moyenne</SelectItem>
                                                            <SelectItem value="BASSE">Basse</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* ── ÉTAPE 2 ── */}
                                <div className={step === 2 ? "space-y-4 animate-in fade-in slide-in-from-right-4" : "hidden"}>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Données Financières & KPI</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="budgetPrevisionnel"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Budget prévisionnel (FCFA) <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Montant prévisionnel" type="number" className="bg-white h-11" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="coutReel"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Coût réel (FCFA)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Montant engagé" type="number" className="bg-white h-11" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Checkbox Gain par mensualité */}
                                    <FormField
                                        control={form.control}
                                        name="gainMensuel"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start gap-3 rounded-lg border border-border/50 bg-white p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="mt-0.5"
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="text-sm font-medium cursor-pointer">
                                                        Gain par mensualité ?
                                                    </FormLabel>
                                                    <p className="text-xs text-muted-foreground">
                                                        Cochez si les gains sont enregistrés mois par mois
                                                    </p>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Méthode d'estimation — visible uniquement si gainMensuel = false */}
                                    {!gainMensuel && (
                                        <FormField
                                            control={form.control}
                                            name="methodeEstimation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Méthode d'estimation des gains</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Calcul du gain estimé..." className="bg-white h-11" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="statut"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Statut <span className="text-red-500">*</span></FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white w-full h-11! [&>span]:truncate">
                                                                <SelectValue placeholder="Statut" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="EN_COURS">En cours</SelectItem>
                                                            <SelectItem value="NON_PROGRAMME">Non programmé</SelectItem>
                                                            <SelectItem value="TERMINE">Terminé</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gainTypeId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Type de gain</FormLabel>
                                                    <Select
                                                        onValueChange={(v) =>
                                                            field.onChange(v === "__none__" ? "" : v)
                                                        }
                                                        value={field.value ? field.value : "__none__"}
                                                        disabled={isLoadingGainTypes}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white w-full h-11! [&>span]:truncate">
                                                                <SelectValue placeholder={isLoadingGainTypes ? "Chargement..." : "Sélectionner un type"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="__none__">—</SelectItem>
                                                            {gainTypes.map((gt) => (
                                                                <SelectItem key={gt.id} value={gt.id}>
                                                                    {gt.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="kpiCles"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">KPI clés</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Taux d'adoption, Temps de traitement..." className="bg-white h-11" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="commentaires"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Commentaires</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Informations complémentaires..." className="bg-white min-h-[80px] resize-none" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* ── ÉTAPE 3 — Gains mensuels ── */}
                                {gainMensuel && (
                                    <div className={step === 3 ? "space-y-4 animate-in fade-in slide-in-from-right-4" : "hidden"}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Gains mensuels</h3>
                                            {gainsTotal > 0 && (
                                                <span className="text-xs font-semibold text-[#2c63a8] bg-blue-50 px-3 py-1 rounded-full">
                                                    Total : {FCFA(gainsTotal)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {gainFields.map((gField, index) => (
                                                <div key={gField.id} className="flex items-end gap-3 bg-white p-3 rounded-xl border border-border/40">
                                                    <FormField
                                                        control={form.control}
                                                        name={`gains.${index}.mois`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-1">
                                                                <FormLabel className="text-xs font-medium text-muted-foreground">Mois / Année</FormLabel>
                                                                <FormControl>
                                                                    <MonthYearPicker
                                                                        value={field.value ?? ""}
                                                                        onChange={field.onChange}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`gains.${index}.montant`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-1">
                                                                <FormLabel className="text-xs font-medium text-muted-foreground">Montant (FCFA)</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        placeholder="0"
                                                                        className="bg-white h-10"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => gainFields.length > 1 && removeGain(index)}
                                                        disabled={gainFields.length <= 1}
                                                        className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => appendGain({ mois: "", montant: 0 })}
                                            className="w-full border-dashed border-[#2c63a8] text-[#2c63a8] hover:bg-blue-50 h-10 rounded-xl"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Ajouter un mois
                                        </Button>

                                        {gainsTotal > 0 && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                                                <span className="text-sm text-blue-700 font-medium">Total des gains mensuels</span>
                                                <span className="text-base font-bold text-[#2c63a8]">{FCFA(gainsTotal)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </form>
                        </Form>

                        <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-sm">
                            Assurez-vous de remplir tous les champs marqués d'un astérisque (*)
                        </div>
                    </div>
                </div>

                <SheetFooter className="p-6 bg-white border-t border-border/40 shrink-0 flex items-center w-full">
                    <div className="flex justify-end gap-2 w-full">
                        {step > 1 && (
                            <Button type="button" variant="outline" onClick={handleBack} disabled={isPending} className="rounded-md px-6 cursor-pointer">
                                Précédent
                            </Button>
                        )}
                        {step < totalSteps ? (
                            <Button type="button" onClick={handleNext} className="bg-[#2c63a8] hover:bg-[#2c63a8]/90 text-white rounded-md px-6 cursor-pointer">
                                Suivant
                            </Button>
                        ) : (
                            <Button type="button" onClick={handleFormSubmit} disabled={isPending} className="bg-[#2c63a8] hover:bg-[#2c63a8]/90 text-white rounded-md px-6 cursor-pointer">
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Mettre à jour" : "Enregistrer la saisie"}
                            </Button>
                        )}
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
