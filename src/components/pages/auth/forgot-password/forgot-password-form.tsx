"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { authService } from "@/services/auth.service";

export function ForgotPasswordForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            await authService.sendResetLink(email);
            setSent(true);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
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
                {sent ? (
                    <div className="flex flex-col items-center gap-4 text-center py-4">
                        <div className="bg-green-100 p-3.5 rounded-full text-green-600 ring-4 ring-green-50">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Email envoyé !</h2>
                        <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
                            Si l'adresse <strong>{email}</strong> est associée à un compte, vous recevrez un lien de réinitialisation dans quelques minutes.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Vérifiez aussi votre dossier spam.
                        </p>
                        <Link
                            href="/login"
                            className="mt-4 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            Retourner à la connexion
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col items-center gap-2 text-center mb-8">
                            <div className="bg-primary/10 p-3.5 rounded-full mb-3 text-primary ring-4 ring-primary/5">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Mot de passe oublié</h1>
                            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
                                Saisissez l'adresse email associée à votre compte, nous vous enverrons un lien de réinitialisation sécurisé.
                            </p>
                        </div>

                        <div className="space-y-5">
                            <Field>
                                <FieldLabel htmlFor="email" className="font-semibold text-foreground/80 mb-2 block">
                                    Adresse email
                                </FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="votre.email@bdu.ci"
                                    required
                                    disabled={isLoading}
                                    className="rounded-xl h-12 bg-muted/30 focus:bg-background transition-colors"
                                />
                            </Field>
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <Field className="mt-8">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isLoading}
                                className="rounded-xl w-full h-12 font-semibold text-base shadow hover:shadow-md transition-all"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer le lien de réinitialisation"}
                            </Button>
                        </Field>
                    </form>
                )}
            </FieldGroup>
        </div>
    );
}
