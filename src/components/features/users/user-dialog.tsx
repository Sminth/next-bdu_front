"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { useCreateUserAdmin, useUpdateUserAdmin } from "@/hooks/use-users-admin";
import { useDirections } from "@/hooks/use-directions";
import { useProfiles } from "@/hooks/use-profiles";
import { UserAdmin } from "@/types/user-admin.types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  email: z.string().email("Email invalide"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  directionId: z.string().optional(),
  profileId: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: UserAdmin | null;
}

export function UserDialog({
  open,
  onOpenChange,
  userToEdit,
}: UserDialogProps) {
  const createMutation = useCreateUserAdmin();
  const updateMutation = useUpdateUserAdmin();
  const { data: directions = [] } = useDirections();
  const { data: profiles = [] } = useProfiles();

  const isEditing = !!userToEdit;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      jobTitle: "",
      directionId: "",
      profileId: "",
      isActive: true,
    },
  });

  const EMPTY_SELECT = "__none__";

  useEffect(() => {
    if (userToEdit) {
      form.reset({
        email: userToEdit.email,
        firstName: userToEdit.firstName ?? "",
        lastName: userToEdit.lastName ?? "",
        phone: userToEdit.phone ?? "",
        jobTitle: userToEdit.jobTitle ?? "",
        directionId: userToEdit.directionId ?? "__none__",
        profileId: userToEdit.profileId ?? "__none__",
        isActive: userToEdit.isActive ?? true,
      });
    } else {
      form.reset({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        jobTitle: "",
        directionId: "__none__",
        profileId: "__none__",
        isActive: true,
      });
    }
  }, [userToEdit, form, open]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        email: values.email,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        phone: values.phone || undefined,
        jobTitle: values.jobTitle || undefined,
        directionId:
          values.directionId && values.directionId !== "__none__"
            ? values.directionId
            : undefined,
        profileId:
          values.profileId && values.profileId !== "__none__"
            ? values.profileId
            : undefined,
        // isActive n'est envoyé que lors d'une modification
        ...(isEditing ? { isActive: values.isActive } : {}),
      };
      if (isEditing && userToEdit) {
        await updateMutation.mutateAsync({ id: userToEdit.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
      form.reset();
    } catch {
      // Toast géré dans les hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl! max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>
            {isEditing ? "Modifier l'utilisateur" : "Créer un utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de l'utilisateur."
              : "Renseignez les informations du nouvel utilisateur. Un mot de passe temporaire lui sera envoyé par email ; il devra le changer à sa première connexion."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="user-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="p-6 overflow-y-auto flex-1">
              
                <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                </div>

              <div className="grid gap-6 sm:grid-cols-2 mt-4">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="exemple@bdu.com"
                        disabled={isEditing}
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <PhoneInput
                        international
                        defaultCountry="CI"
                        value={field.value ?? undefined}
                        onChange={(val) => field.onChange(val ?? "")}
                        className="flex h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:ring-0"
                        numberInputProps={{ className: "flex-1 min-w-0" }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du poste *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Administrateur, COMPTA..." className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="directionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value && field.value !== "" ? field.value : "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Sélectionner une direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Aucune</SelectItem>
                        {directions.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profileId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profil (habilitation) *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value && field.value !== "" ? field.value : "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Sélectionner un profil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Aucun</SelectItem>
                        {profiles.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isEditing && (
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value ?? true}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border accent-primary"
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Compte actif
                      </FormLabel>
                    </FormItem>
                  )}
                />
              )}
              </div>
            </div>

            <DialogFooter className="p-6 pt-4 border-t bg-muted/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" form="user-form" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
