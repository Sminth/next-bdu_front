"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, KeyRound } from "lucide-react";
import { UserAdmin } from "@/types/user-admin.types";
import { useResetPasswordAdmin } from "@/hooks/use-users-admin";
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

const schema = z
  .object({
    newPassword: z.string().min(8, "Minimum 8 caractères"),
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserAdmin | null;
}

export function ResetPasswordAdminDialog({ open, onOpenChange, user }: Props) {
  const mutation = useResetPasswordAdmin();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    try {
      await mutation.mutateAsync({ id: user.id, newPassword: values.newPassword });
      onOpenChange(false);
      form.reset();
    } catch {
      // Toast géré dans le hook
    }
  };

  const handleClose = (v: boolean) => {
    if (!v) form.reset();
    onOpenChange(v);
  };

  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email
    : "";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
              <KeyRound className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          </div>
          <DialogDescription>
            Définissez un nouveau mot de passe pour{" "}
            <span className="font-medium text-foreground">{fullName}</span>.
            L'utilisateur devra obligatoirement le changer à sa prochaine connexion.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="reset-pwd-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Minimum 8 caractères" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Répétez le mot de passe" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={mutation.isPending}>
            Annuler
          </Button>
          <Button
            form="reset-pwd-form"
            type="submit"
            disabled={mutation.isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <KeyRound className="h-4 w-4 mr-2" />
            )}
            Réinitialiser
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
