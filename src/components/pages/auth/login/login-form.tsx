"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LockKeyhole, Loader2, Mail, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { toast } from "@/lib/toast";

export function LoginForm({
  className,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit">) {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
      const user = useAuthStore.getState().user;
      const firstName = user?.firstName || "vous";
      if (user?.mustChangePassword) {
        router.push("/change-password");
      } else {
        toast.success(`Bienvenue, ${firstName} ! Connexion réussie.`);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Identifiants incorrects");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-2 text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bienvenue</h1>
          <p className="text-muted-foreground text-sm max-w-[250px] mx-auto leading-relaxed">
            Connectez-vous à votre compte
          </p>
        </div>

        <div className="space-y-4">
          {/* Champ Identifiant */}
          <Field>
            <FieldLabel htmlFor="email" className="font-semibold text-foreground/80 mb-2 block text-sm">
              Identifiant
            </FieldLabel>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none">
                <Mail className="w-4.5 h-4.5" strokeWidth={1.8} />
              </span>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={isLoading}
                className="rounded-xl h-12 bg-muted/30 focus:bg-background transition-colors pl-10 text-sm"
              />
            </div>
          </Field>

          {/* Champ Mot de passe */}
          <Field>
            <FieldLabel htmlFor="password" className="font-semibold text-foreground/80 mb-2 block text-sm">
              Mot de passe
            </FieldLabel>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none">
                <LockKeyhole className="w-4.5 h-4.5" strokeWidth={1.8} />
              </span>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                required
                disabled={isLoading}
                className="rounded-xl h-12 bg-muted/30 focus:bg-background transition-colors pl-10 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4.5 h-4.5" strokeWidth={1.8} />
                ) : (
                  <Eye className="w-4.5 h-4.5" strokeWidth={1.8} />
                )}
              </button>
            </div>
            {/* Mot de passe oublié */}
            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </Field>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center dark:bg-red-950/50 dark:text-red-400">
            {error}
          </div>
        )}

        <Field className="mt-6">
          <Button disabled={isLoading} type="submit" size="lg" className="cursor-pointer rounded-xl w-full h-12 font-semibold text-base shadow hover:shadow-md transition-all">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Se connecter"}
          </Button>
        </Field>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
          <LockKeyhole className="w-3.5 h-3.5 opacity-70" />
          <span>Espace chiffré de bout en bout</span>
        </div>
      </FieldGroup>

      {/* Dialog mot de passe oublié */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader className="items-center gap-3">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-3 mx-auto">
              <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle>Mot de passe oublié ?</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Pour des raisons de sécurité, la réinitialisation du mot de passe
              doit être effectuée par un administrateur de la plateforme.
              <br /><br />
              Veuillez contacter votre administrateur afin qu'il procède à la
              réinitialisation de votre compte.
            </DialogDescription>
          </DialogHeader>
          <Button className="w-full mt-2" onClick={() => setForgotOpen(false)}>
            Compris
          </Button>
        </DialogContent>
      </Dialog>
    </form>
  );
}
