"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { useCreateDirection, useUpdateDirection } from "@/hooks/use-directions";
import { Direction } from "@/types/direction.types";

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
});

type FormValues = z.infer<typeof formSchema>;

interface DirectionSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    directionToEdit?: Direction | null;
}

export function DirectionSheet({
    isOpen,
    onOpenChange,
    directionToEdit,
}: DirectionSheetProps) {
    const createMutation = useCreateDirection();
    const updateMutation = useUpdateDirection();

    const isEditing = !!directionToEdit;
    const isPending = createMutation.isPending || updateMutation.isPending;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    useEffect(() => {
        if (directionToEdit) {
            form.reset({
                name: directionToEdit.name,
                description: directionToEdit.description || "",
            });
        } else {
            form.reset({
                name: "",
                description: "",
            });
        }
    }, [directionToEdit, form, isOpen]);

    const onSubmit = async (values: FormValues) => {
        try {
            if (isEditing) {
                await updateMutation.mutateAsync({
                    id: directionToEdit.id,
                    payload: values,
                });
            } else {
                await createMutation.mutateAsync(values);
            }
            onOpenChange(false);
            form.reset();
        } catch (error) {
            // L'erreur est gérée dans les hooks de mutation avec Toast
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl! w-full flex flex-col gap-0 p-0 overflow-hidden bg-[#f8f9fc]">
                <SheetHeader className="p-6 bg-white border-b border-border/40 shrink-0">
                    <SheetTitle className="text-xl text-primary">
                        {isEditing ? "Modifier la direction" : "Créer une direction"}
                    </SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? "Modifiez les informations de cette direction puis sauvegardez."
                            : "Ajoutez une nouvelle direction à la base de données. Cliquez sur sauvegarder une fois terminé."}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-2">
                    <div className="p-2">
                        <Form {...form}>
                            <form
                                id="direction-form"
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6 mt-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Libellé de la direction <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input className="bg-white h-11" placeholder="Entrez le nom de la direction..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Description (Optionnel)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Ajoutez une description..."
                                                    className="bg-white resize-none min-h-[120px]"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                            form="direction-form"
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
