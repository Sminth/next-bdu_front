"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth().then(() => {
      // Small timeout to allow state to settle
      setTimeout(() => {
        if (useAuthStore.getState().isAuthenticated) {
          router.push("/dashboard");
        } else {
          router.push("/login"); // or whatever your auth route is, e.g. /login isn't usually the root route if it's in (auth). 
          // Wait, the Next folder structure showed it is at `/login` because `(auth)/login` resolves to `/login`.
        }
      }, 50);
    });
  }, [checkAuth, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-300 pointer-events-none" />
        <p className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Chargement de la session...
        </p>
      </div>
    </div>
  );
}
