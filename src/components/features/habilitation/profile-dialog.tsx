"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { useCreateProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { usePermissions } from "@/hooks/use-permissions";
import { Profile } from "@/types/profile.types";
import { Permission } from "@/types/permission.types";

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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileToEdit?: Profile | null;
}

/** Ordre des catégories = ordre du menu (Tableau de bord → Saisie → Reporting → Paramétrage → Administration) */
const PERMISSION_CATEGORY_ORDER = [
  "DASHBOARD",
  "SAISIE",
  "REPORTING",
  "PROJETS",
  "DOMAINES",
  "TYPES_DE_GAIN",
  "AXES_STRATEGIQUES",
  "DIRECTION",
  "HABILITATION",
  "UTILISATEURS",
  "HISTORIQUE",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  DASHBOARD: "Tableau de bord",
  SAISIE: "Saisie",
  REPORTING: "Reporting",
  PROJETS: "Projets",
  DOMAINES: "Domaines",
  TYPES_DE_GAIN: "Types de gain",
  AXES_STRATEGIQUES: "Axes stratégiques",
  DIRECTION: "Direction",
  HABILITATION: "Habilitation",
  UTILISATEURS: "Utilisateurs",
  HISTORIQUE: "Historique",
};

export function ProfileDialog({
  open,
  onOpenChange,
  profileToEdit,
}: ProfileDialogProps) {
  const createMutation = useCreateProfile();
  const updateMutation = useUpdateProfile();
  const { data: permissions = [] } = usePermissions();

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());

  const isEditing = !!profileToEdit;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "" },
  });

  const permissionsByCategory = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of permissions) {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    }
    // Ordre selon le menu : Tableau de bord, Saisie, Reporting, Projets, Domaines, Direction, Habilitation, Utilisateurs
    const orderIndex = (cat: string) => {
      const i = (PERMISSION_CATEGORY_ORDER as readonly string[]).indexOf(cat);
      return i === -1 ? PERMISSION_CATEGORY_ORDER.length : i;
    };
    return Array.from(map.entries()).sort(
      ([a], [b]) => orderIndex(a) - orderIndex(b)
    );
  }, [permissions]);

  useEffect(() => {
    if (profileToEdit) {
      form.reset({
        name: profileToEdit.name,
        description: profileToEdit.description ?? "",
      });
      setSelectedPermissionIds(
        new Set(profileToEdit.permissions.map((pp) => pp.permission.id))
      );
    } else {
      form.reset({ name: "", description: "" });
      setSelectedPermissionIds(new Set());
    }
  }, [profileToEdit, form, open]);

  const togglePermission = (id: string) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const permissionIds = Array.from(selectedPermissionIds);
      if (isEditing && profileToEdit) {
        await updateMutation.mutateAsync({
          id: profileToEdit.id,
          payload: { ...values, permissionIds },
        });
      } else {
        await createMutation.mutateAsync({ ...values, permissionIds });
      }
      onOpenChange(false);
      form.reset();
    } catch {
      // Toast géré dans les hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>
            {isEditing ? "Modifier le profil" : "Créer un profil"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations et les permissions du profil."
              : "Définissez le nom, la description et les permissions du nouveau profil."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="profile-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <Form {...form}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du profil *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: ADMINISTRATEUR" {...field} />
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
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Administrateur système avec accès complet"
                        className="min-h-[80px] resize-none"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label>Permissions *</Label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <Checkbox
                    checked={
                      permissions.length > 0 &&
                      selectedPermissionIds.size === permissions.length
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPermissionIds(
                          new Set(permissions.map((p) => p.id))
                        );
                      } else {
                        setSelectedPermissionIds(new Set());
                      }
                    }}
                  />
                  Tout sélectionner
                </label>
              </div>
              <div className="border rounded-lg divide-y max-h-[280px] overflow-y-auto bg-muted/30">
                {permissionsByCategory.map(([category, perms]) => (
                  <div key={category} className="p-3">
                    <p className="text-sm font-semibold text-foreground mb-2">
                      {CATEGORY_LABELS[category] ?? category}
                    </p>
                    <ul className="space-y-2">
                      {perms.map((perm) => (
                        <li
                          key={perm.id}
                          className="flex items-start gap-3 text-sm"
                        >
                          <Checkbox
                            id={perm.id}
                            checked={selectedPermissionIds.has(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                            className="mt-0.5"
                          />
                          <label
                            htmlFor={perm.id}
                            className="flex-1 cursor-pointer"
                          >
                            <span className="font-medium">{perm.name}</span>
                            {perm.description && (
                              <span className="block text-muted-foreground text-xs mt-0.5">
                                {perm.description}
                              </span>
                            )}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
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
            <Button type="submit" form="profile-form" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
