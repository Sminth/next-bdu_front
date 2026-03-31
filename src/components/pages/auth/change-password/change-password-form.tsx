"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { KeyRound, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "@/lib/toast";

export function ChangePasswordForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter();
    const patchUser = useAuthStore((s) => s.patchUser);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            return setError("Les mots de passe ne correspondent pas");
        }
        if (newPassword.length < 8) {
            return setError("Le mot de passe doit contenir au moins 8 caractères");
        }

        setLoading(true);
        try {
            await authService.forceChangePassword(newPassword);
            // Mettre à jour le store immédiatement — évite toute re-redirection par AuthGuard
            patchUser({ mustChangePassword: false });
            toast.success("Mot de passe défini avec succès !");
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Erreur lors du changement de mot de passe");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form onSubmit={handleSubmit}>
                <FieldGroup className="p-6 sm:p-8">
                    <div className="flex flex-col items-center gap-2 text-center mb-8">
                        <div className="bg-primary/10 p-3.5 rounded-full mb-3 text-primary ring-4 ring-primary/5">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">
                            Changement de mot de passe
                        </h1>
                        <p className="text-muted-foreground text-sm mx-auto leading-relaxed">
                            Pour votre sécurité, définissez un nouveau mot de passe avant d'accéder à l'application.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Field>
                            <FieldLabel htmlFor="newPassword" className="font-semibold text-foreground/80 mb-2 block text-sm">
                                Nouveau mot de passe
                            </FieldLabel>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none">
                                    <KeyRound className="w-4 h-4" strokeWidth={1.8} />
                                </span>
                                <Input
                                    id="newPassword"
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimum 8 caractères"
                                    required
                                    disabled={loading}
                                    className="rounded-xl h-12 bg-muted/30 focus:bg-background transition-colors pl-10 pr-10 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showNew ? <EyeOff className="w-4 h-4" strokeWidth={1.8} /> : <Eye className="w-4 h-4" strokeWidth={1.8} />}
                                </button>
                            </div>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="confirmPassword" className="font-semibold text-foreground/80 mb-2 block text-sm">
                                Confirmer le nouveau mot de passe
                            </FieldLabel>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none">
                                    <KeyRound className="w-4 h-4" strokeWidth={1.8} />
                                </span>
                                <Input
                                    id="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Répétez le mot de passe"
                                    required
                                    disabled={loading}
                                    className="rounded-xl h-12 bg-muted/30 focus:bg-background transition-colors pl-10 pr-10 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" strokeWidth={1.8} /> : <Eye className="w-4 h-4" strokeWidth={1.8} />}
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
                        <Button
                            disabled={loading}
                            type="submit"
                            size="lg"
                            className="cursor-pointer rounded-xl w-full h-12 font-semibold text-base shadow hover:shadow-md transition-all"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmer le nouveau mot de passe"}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </div>
    );
}
