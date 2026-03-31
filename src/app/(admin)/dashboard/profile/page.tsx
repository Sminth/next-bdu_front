"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/lib/toast";
import { request } from "@/lib/request";
import { UserEndpoint } from "@/constants/endpoint";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Mail, Shield, KeyRound, Save } from "lucide-react";

export default function ProfilePage() {
    const { user, checkAuth } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await request.put(UserEndpoint.UPDATE, {
                firstName: formData.firstName,
                lastName: formData.lastName,
            });
            toast.success("Profil mis à jour avec succès");
            await checkAuth(); // Refresh user state in Zustand
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("Les mots de passe ne correspondent pas");
        }

        setIsSaving(true);
        try {
            // Assuming a password update endpoint or handling it in the same update endpoint
            await request.put(UserEndpoint.UPDATE, {
                password: passwordData.newPassword,
                // Depending on backend, it might require currentPassword if implemented securely
            });
            toast.success("Mot de passe mis à jour avec succès");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la modification du mot de passe");
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "CN";

    return (
        <div className="space-y-6 max-w-4xl pt-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Mon Profil</h1>
                <p className="text-muted-foreground">
                    Gérez vos informations personnelles et vos paramètres de sécurité.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Colonne de gauche (Avatar et Infos rapides) */}
                <div className="md:col-span-4 space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="h-32 w-32 mb-4 ring-4 ring-primary/5">
                                <AvatarImage src="/avatars/admin.jpg" alt="Photo de profil" />
                                <AvatarFallback className="text-3xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
                            <p className="text-sm text-muted-foreground mb-4">{user.email}</p>

                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                <Shield className="h-3.5 w-3.5" />
                                <span>Rôle : {user.role}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne de droite (Formulaires) */}
                <div className="md:col-span-8 space-y-6">
                    <Card>
                        <form onSubmit={handleUpdateProfile}>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Informations Générales
                                </CardTitle>
                                <CardDescription>
                                    Mettez à jour vos informations de base. L'adresse email est en lecture seule.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Prénom</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                            placeholder="Votre prénom"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Nom</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        Adresse Email
                                    </Label>
                                    <Input
                                        id="email"
                                        value={formData.email}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Veuillez contacter un Super Administrateur pour modifier votre email.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t p-6 bg-muted/50 mt-4 rounded-b-xl">
                                <Button type="submit" disabled={isSaving} className="gap-2">
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Sauvegarder les modifications
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    <Card>
                        <form onSubmit={handleUpdatePassword}>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2 text-red-600/90 dark:text-red-400">
                                    <KeyRound className="h-5 w-5" />
                                    Sécurité & Mot de passe
                                </CardTitle>
                                <CardDescription>
                                    Assurez-vous de choisir un mot de passe fort et unique.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        placeholder="Minimal 8 caractères"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        placeholder="Répétez le mot de passe"
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t p-6 bg-muted/50 mt-4 rounded-b-xl">
                                <Button type="submit" variant="destructive" disabled={isSaving || !passwordData.newPassword} className="gap-2">
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Mettre à jour le mot de passe
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
