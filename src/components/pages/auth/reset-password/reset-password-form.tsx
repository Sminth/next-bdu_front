"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { KeyRound, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { authService } from "@/services/auth.service";

function ResetPasswordFormInner({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token || !email) {
            setError("Lien invalide. Veuillez refaire une demande de réinitialisation.");
        }
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            return setError("Les mots de passe ne correspondent pas");
        }
        if (newPassword.length < 8) {
            return setError("Le mot de passe doit contenir au moins 8 caractères");
        }

        setIsLoading(true);
        try {
            await authService.resetPassword(token, email, newPassword, confirmPassword);
            setSuccess(true);
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la réinitialisation. Le lien est peut-être expiré.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 w-fit">
                <ArrowLeft className="w-4 h-4" />
                <Link href="/login" className="font-medium">Retour à la connexion</Link>
            </div>

            <FieldGroup className="p-6 sm:p-8">
                {success ? (
                    <div className="flex flex-col items-center gap-4 text-center py-4">
                        <div className="bg-green-100 p-3.5 rounded-full text-green-600 ring-4 ring-green-50">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Mot de passe réinitialisé !</h2>
                        <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
                            Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion.
                        </p>
                        <Link
                            href="/login"
                            className="mt-4 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            Se connecter maintenant
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col items-center gap-2 text-center mb-8">
                            <div className="bg-primary/10 p-3.5 rounded-full mb-3 text-primary ring-4 ring-primary/5">
                                <KeyRound className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Nouveau mot de passe</h1>
                            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
                                Choisissez un nouveau mot de passe sécurisé pour votre compte.
                            </p>
                            {email && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Compte : <strong>{email}</strong>
                                </p>
                            )}
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
                                        disabled={isLoading || !token}
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
                                    Confirmer le mot de passe
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
                                        disabled={isLoading || !token}
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

                        <Field className="mt-8">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isLoading || !token || !email}
                                className="rounded-xl w-full h-12 font-semibold text-base shadow hover:shadow-md transition-all"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Réinitialiser le mot de passe"}
                            </Button>
                        </Field>
                    </form>
                )}
            </FieldGroup>
        </div>
    );
}

export function ResetPasswordForm(props: React.ComponentProps<"div">) {
    return (
        <Suspense>
            <ResetPasswordFormInner {...props} />
        </Suspense>
    );
}
