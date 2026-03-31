"use client";

import { UserAdmin } from "@/types/user-admin.types";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { User, Building, Shield, CheckCircle2 } from "lucide-react";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2">
            <span className="text-sm text-muted-foreground shrink-0 w-44">{label}</span>
            <span className="text-sm font-medium text-right">
                {value ?? <span className="text-muted-foreground/40">—</span>}
            </span>
        </div>
    );
}

function Section({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-xl border border-border/40 p-4 space-y-1">
            <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 text-[#2c63a8]" />
                <h4 className="text-sm font-semibold text-[#2c63a8]">{title}</h4>
            </div>
            {children}
        </div>
    );
}

interface UserDetailSheetProps {
    user: UserAdmin | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserDetailSheet({ user, open, onOpenChange }: UserDetailSheetProps) {
    if (!user) return null;

    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md! w-full flex flex-col gap-0 p-0 overflow-hidden bg-[#f8f9fc]">
                <SheetHeader className="p-6 bg-white border-b border-border/40 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#2c63a8]/10 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-[#2c63a8]" />
                        </div>
                        <div>
                            <SheetTitle className="text-lg text-primary">{fullName}</SheetTitle>
                            <SheetDescription className="mt-0.5">{user.email}</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    <Section icon={User} title="Identité">
                        <InfoRow label="Prénom" value={user.firstName} />
                        <InfoRow label="Nom" value={user.lastName} />
                        <InfoRow label="Email" value={user.email} />
                        <InfoRow label="Téléphone" value={user.phone} />
                        <InfoRow label="Poste" value={user.jobTitle} />
                    </Section>

                    <Section icon={Building} title="Organisation">
                        <InfoRow label="Direction" value={user.direction?.name} />
                    </Section>

                    <Section icon={Shield} title="Accès & Profil">
                        <InfoRow label="Profil" value={user.profile?.name} />
                        <InfoRow label="Rôle système" value={user.role} />
                        <InfoRow
                            label="Statut"
                            value={
                                <Badge
                                    variant={user.isActive ? "default" : "secondary"}
                                    className={user.isActive ? "bg-green-600/90 hover:bg-green-600" : ""}
                                >
                                    {user.isActive ? "Actif" : "Inactif"}
                                </Badge>
                            }
                        />
                        <InfoRow
                            label="Changement MDP requis"
                            value={
                                (user as any).mustChangePassword ? (
                                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                                        Oui
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                                        Non
                                    </Badge>
                                )
                            }
                        />
                    </Section>

                    <Section icon={CheckCircle2} title="Informations système">
                        <InfoRow
                            label="Créé le"
                            value={format(new Date(user.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                        />
                    </Section>
                </div>
            </SheetContent>
        </Sheet>
    );
}
