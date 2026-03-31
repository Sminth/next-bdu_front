"use client";

import { usePermission } from "@/lib/permissions";
import { useAuthStore } from "@/store/auth.store";
import { ShieldX, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PagePermissionGuardProps {
    permission: string;
    children: React.ReactNode;
}

export function PagePermissionGuard({ permission, children }: PagePermissionGuardProps) {
    const { can } = usePermission();
    const hasHydrated = useAuthStore((s) => s.hasHydrated);

    // Pendant l'hydration de Zustand, on affiche un indicateur de chargement
    // pour éviter le flash "Accès refusé" avant que l'utilisateur soit disponible
    if (!hasHydrated) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!can(permission)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="bg-destructive/10 p-5 rounded-full text-destructive">
                    <ShieldX className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Accès refusé</h1>
                    <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
                        Vous n'avez pas les droits nécessaires pour accéder à cette page.
                        Contactez un administrateur pour obtenir les accès.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/dashboard">Retour au tableau de bord</Link>
                </Button>
            </div>
        );
    }

    return <>{children}</>;
}
