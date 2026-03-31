"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import { useDomains } from "@/hooks/use-domains";
import { useAxesStrategiques } from "@/hooks/use-axes-strategiques";
import { Project } from "@/types/project.types";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

const formSchema = z.object({
    name: z.string().min(2, "Le libellé doit contenir au moins 2 caractères"),
    description: z.string().optional(),
    projectManager: z.string().optional(),
    domainId: z.string().optional(),
    axeStrategiqueId: z.string().optional(),
    startDate: z.string().optional(),
    expectedEndDate: z.string().optional(),
    actualEndDate: z.string().optional(),
    completionPercentage: z.string().optional(),
    prestataire: z.string().optional(),
    prestataireContact: z.string().optional(),
    prestataireEmail: z.string().email("Email invalide").optional().or(z.literal("")),
    montantContrat: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    projectToEdit?: Project | null;
}

export function ProjectSheet({
    isOpen,
    onOpenChange,
    projectToEdit,
}: ProjectSheetProps) {
    const createMutation = useCreateProject();
    const updateMutation = useUpdateProject();
    const { data: domains, isLoading: isLoadingDomains } = useDomains();
    const { data: axes, isLoading: isLoadingAxes } = useAxesStrategiques();

    const isEditing = !!projectToEdit;
    const isPending = createMutation.isPending || updateMutation.isPending;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            projectManager: "",
            domainId: "",
            axeStrategiqueId: "",
            startDate: "",
            expectedEndDate: "",
            actualEndDate: "",
            completionPercentage: "",
            prestataire: "",
            prestataireContact: "",
            prestataireEmail: "",
            montantContrat: "",
        },
    });

    useEffect(() => {
        if (projectToEdit) {
            form.reset({
                name: projectToEdit.name,
                description: projectToEdit.description || "",
                projectManager: projectToEdit.projectManager || "",
                domainId: projectToEdit.domainId || "",
                axeStrategiqueId: projectToEdit.axeStrategiqueId || "",
                startDate: projectToEdit.startDate ? projectToEdit.startDate.split('T')[0] : "",
                expectedEndDate: projectToEdit.expectedEndDate ? projectToEdit.expectedEndDate.split('T')[0] : "",
                actualEndDate: projectToEdit.actualEndDate ? projectToEdit.actualEndDate.split('T')[0] : "",
                completionPercentage: projectToEdit.completionPercentage !== null && projectToEdit.completionPercentage !== undefined ? String(projectToEdit.completionPercentage) : "",
                prestataire: projectToEdit.prestataire || "",
                prestataireContact: projectToEdit.prestataireContact || "",
                prestataireEmail: projectToEdit.prestataireEmail || "",
                montantContrat: projectToEdit.montantContrat !== null && projectToEdit.montantContrat !== undefined ? String(projectToEdit.montantContrat) : "",
            });
        } else {
            form.reset({
                name: "",
                description: "",
                projectManager: "",
                domainId: "",
                axeStrategiqueId: "",
                startDate: "",
                expectedEndDate: "",
                actualEndDate: "",
                completionPercentage: "",
                prestataire: "",
                prestataireContact: "",
                prestataireEmail: "",
                montantContrat: "",
            });
        }
    }, [projectToEdit, form, isOpen]);

    const onSubmit = async (values: FormValues) => {
        try {
            const payload = {
                ...values,
                description: values.description?.trim() || undefined,
                projectManager: values.projectManager?.trim() || undefined,
                domainId: values.domainId || undefined,
                axeStrategiqueId: values.axeStrategiqueId || undefined,
                startDate: values.startDate || undefined,
                expectedEndDate: values.expectedEndDate || undefined,
                actualEndDate: values.actualEndDate || undefined,
                completionPercentage: values.completionPercentage ? Number(values.completionPercentage) : undefined,
                prestataire: values.prestataire?.trim() || undefined,
                prestataireContact: values.prestataireContact?.trim() || undefined,
                prestataireEmail: values.prestataireEmail?.trim() || undefined,
                montantContrat: values.montantContrat ? Number(values.montantContrat) : undefined,
            };

            if (isEditing) {
                await updateMutation.mutateAsync({
                    id: projectToEdit.id,
                    payload,
                });
            } else {
                await createMutation.mutateAsync(payload);
            }
            onOpenChange(false);
            form.reset();
        } catch (error) {
            // Error is handled in the mutation hooks (Toast)
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl! w-full flex flex-col gap-0 p-0 overflow-hidden bg-[#f8f9fc]">
                <SheetHeader className="p-6 bg-white border-b border-border/40 shrink-0">
                    <SheetTitle className="text-xl text-primary">
                        {isEditing ? "Modifier le projet" : "Créer un projet"}
                    </SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? "Modifiez les informations de ce projet puis sauvegardez."
                            : "Ajoutez un nouveau projet à la base de données. Cliquez sur sauvegarder une fois terminé."}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-2">
                    <div className="p-2">
                        <Form {...form}>
                            <form
                                id="project-form"
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6 mt-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-sm font-medium">Libellé du projet <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input className="bg-white h-11" placeholder="Entrez le nom du projet..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="projectManager"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-sm font-medium">Porteur de projet</FormLabel>
                                                <FormControl>
                                                    <Input className="bg-white h-11" placeholder="Nom du porteur..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="domainId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Domaine</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value || ""}
                                                    disabled={isLoadingDomains}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white h-11 w-full [&>span]:truncate">
                                                            <SelectValue placeholder={isLoadingDomains ? "Chargement..." : "Sélectionner un domaine"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {domains?.map((d) => (
                                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="axeStrategiqueId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Axe stratégique</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value || ""}
                                                    disabled={isLoadingAxes}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white h-11 w-full [&>span]:truncate">
                                                            <SelectValue placeholder={isLoadingAxes ? "Chargement..." : "Sélectionner un axe stratégique"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {axes?.map((a) => (
                                                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="prestataire"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-sm font-medium">Prestataire</FormLabel>
                                                <FormControl>
                                                    <Input className="bg-white h-11" placeholder="Nom du prestataire..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="prestataireContact"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Contact prestataire</FormLabel>
                                                <FormControl>
                                                    <PhoneInput
                                                        international
                                                        defaultCountry="CI"
                                                        value={field.value ?? undefined}
                                                        onChange={(val) => field.onChange(val ?? "")}
                                                        className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:ring-0 [&_.PhoneInputInput]:flex-1"
                                                        numberInputProps={{ className: "flex-1 min-w-0" }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="prestataireEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Email prestataire</FormLabel>
                                                <FormControl>
                                                    <Input type="email" className="bg-white h-11" placeholder="email@prestataire.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="montantContrat"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Montant du contrat (FCFA)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step="any"
                                                        className="bg-white h-11"
                                                        placeholder="Ex: 5000000"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Date de début</FormLabel>
                                                <FormControl>
                                                    <Input type="date" className="bg-white h-11" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="expectedEndDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Date de fin prévue</FormLabel>
                                                <FormControl>
                                                    <Input type="date" className="bg-white h-11" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Date de fin réelle + barre d'achèvement sur la même ligne */}
                                    <FormField
                                        control={form.control}
                                        name="actualEndDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Date de fin réelle</FormLabel>
                                                <FormControl>
                                                    <Input type="date" className="bg-white h-11" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="completionPercentage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center pb-2 pt-1">
                                                    <FormLabel className="text-sm font-medium">% d'achèvement</FormLabel>
                                                    <span className="text-sm font-bold text-primary">{field.value || 0}%</span>
                                                </div>
                                                <FormControl>
                                                    <Slider
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                        value={[Number(field.value) || 0]}
                                                        onValueChange={(vals) => field.onChange(String(vals[0]))}
                                                        className="py-2"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2 mt-3">
                                                <FormLabel className="text-sm font-medium">Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Ajoutez une description relative au projet..."
                                                        className="bg-white resize-none min-h-[120px]"
                                                        {...field}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-border/40 shrink-0 flex items-center w-full">
                    <div className="flex justify-end gap-2 w-full">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                            className="rounded-md px-6 cursor-pointer"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            form="project-form"
                            disabled={isPending}
                            className="bg-[#2c63a8] hover:bg-[#2c63a8]/90 text-white rounded-md px-6 cursor-pointer"
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Mettre à jour" : "Sauvegarder"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
