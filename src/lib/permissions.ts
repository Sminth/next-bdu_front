import { useAuthStore } from "@/store/auth.store";

/**
 * Vérifie si l'utilisateur courant possède une permission donnée.
 * La source de vérité est uniquement le tableau `permissions` retourné par l'API.
 * Un ADMIN sans profil reçoit toutes les permissions directement du backend.
 */
export function usePermission() {
    const user = useAuthStore((s) => s.user);

    const can = (permission: string): boolean => {
        if (!user) return false;
        return user.permissions?.includes(permission) ?? false;
    };

    const canAny = (...permissions: string[]): boolean =>
        permissions.some((p) => can(p));

    const canAll = (...permissions: string[]): boolean =>
        permissions.every((p) => can(p));

    return { can, canAny, canAll };
}
