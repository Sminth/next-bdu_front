"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

// Délai minimum entre deux vérifications périodiques de token (5 minutes)
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, checkAuth, isAuthenticated, hasHydrated } = useAuthStore();
    const lastCheckRef = useRef<number>(0);

    // Refresh immédiat des permissions dès l'hydration, puis toutes les 5 minutes
    useEffect(() => {
        if (!hasHydrated) return;

        // Toujours rafraîchir au premier montage pour garantir des permissions à jour
        const now = Date.now();
        const timeSinceLastCheck = now - lastCheckRef.current;
        if (timeSinceLastCheck > CHECK_INTERVAL_MS) {
            lastCheckRef.current = now;
            checkAuth();
        }
    }, [hasHydrated]);

    useEffect(() => {
        if (hasHydrated && isAuthenticated && user?.mustChangePassword) {
            router.replace("/change-password");
        }
    }, [hasHydrated, isAuthenticated, user]);

    return <>{children}</>;
}
