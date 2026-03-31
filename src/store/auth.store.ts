import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminUser, LoginPayload } from '@/types/auth.types';
import { authService } from '@/services/auth.service';

interface AuthState {
    user: AdminUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    hasHydrated: boolean;
    login: (credentials: LoginPayload) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    patchUser: (patch: Partial<AdminUser>) => void;
    setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            hasHydrated: false,

            setHasHydrated: (v) => set({ hasHydrated: v }),

            patchUser: (patch) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...patch } : state.user,
                })),

            login: async (credentials) => {
                set({ isLoading: true });
                try {
                    const response = await authService.login(credentials);
                    if ("access_token" in response && response.user) {
                        set({ user: response.user, isAuthenticated: true, isLoading: false });
                    } else {
                        set({ isLoading: false });
                        throw new Error((response as any).message || 'Login failed');
                    }
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await authService.logout();
                } finally {
                    set({ user: null, isAuthenticated: false, isLoading: false });
                }
            },

            checkAuth: async () => {
                if (!authService.isAuthenticated()) {
                    set({ user: null, isAuthenticated: false });
                    return;
                }
                try {
                    const response = await authService.me();
                    if (response && response.email) {
                        set({ user: response, isAuthenticated: true });
                    }
                } catch (error: any) {
                    // Session expirée (401 silencieux) → déconnecter proprement et rediriger
                    if (error?.message === 'unauthorized') {
                        try { await authService.logout(); } catch { /* ignore */ }
                        set({ user: null, isAuthenticated: false, isLoading: false });
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login';
                        }
                        return;
                    }
                    // Autres erreurs (réseau temporaire, etc.) : ignorées silencieusement
                }
            },

            changePassword: async (currentPassword, newPassword) => {
                await authService.changePassword(currentPassword, newPassword);
                try {
                    const response = await authService.me();
                    if (response && response.email) {
                        set({ user: response });
                    }
                } catch {
                    // Silencieux
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
            onRehydrateStorage: () => (state) => {
                // Appelé une fois après que Zustand a rechargé l'état depuis localStorage
                state?.setHasHydrated(true);
            },
        }
    )
);
