"use client";

import { Project } from "@/types/project.types";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Briefcase,
    Calendar,
    UserCheck,
    Target,
    CheckCircle2,
} from "lucide-react";

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

function formatDate(d?: string | null) {
    if (!d) return null;
    try {
        return format(new Date(d), "dd MMM yyyy", { locale: fr });
    } catch {
        return d;
    }
}

interface ProjectDetailSheetProps {
    project: Project | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProjectDetailSheet({ project, open, onOpenChange }: ProjectDetailSheetProps) {
    if (!project) return null;

    const createdBy = project.createdBy as any;
    const createdByLabel = createdBy
        ? (`${createdBy.firstName ?? ""} ${createdBy.lastName ?? ""}`.trim() || createdBy.email)
        : null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl! w-full flex flex-col gap-0 p-0 overflow-hidden bg-[#f8f9fc]">
                <SheetHeader className="p-6 bg-white border-b border-border/40 shrink-0">
                    <SheetTitle className="text-lg text-primary">{project.name}</SheetTitle>
                    <SheetDescription className="mt-1">
                        Détails complets du projet
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    <Section icon={Briefcase} title="Informations générales">
                        <InfoRow label="Libellé" value={project.name} />
                        <InfoRow label="Chef de projet" value={project.projectManager} />
                        <InfoRow label="Domaine" value={project.domain?.name} />
                        <InfoRow label="Axe stratégique" value={project.axeStrategique?.name} />
                        <InfoRow
                            label="Achèvement"
                            value={
                                project.completionPercentage != null ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#2c63a8] rounded-full transition-all"
                                                style={{ width: `${project.completionPercentage}%` }}
                                            />
                                        </div>
                                        <span>{project.completionPercentage}%</span>
                                    </div>
                                ) : null
                            }
                        />
                    </Section>

                    {project.description && (
                        <Section icon={Target} title="Description">
                            <p className="text-sm bg-muted/30 rounded-lg p-3 leading-relaxed">
                                {project.description}
                            </p>
                        </Section>
                    )}

                    <Section icon={Calendar} title="Planification">
                        <InfoRow label="Date début" value={formatDate(project.startDate)} />
                        <InfoRow label="Date fin prévue" value={formatDate(project.expectedEndDate)} />
                        <InfoRow label="Date fin réelle" value={formatDate(project.actualEndDate)} />
                    </Section>

                    {(project.prestataire || project.prestataireContact || project.prestataireEmail) && (
                        <Section icon={UserCheck} title="Prestataire">
                            <InfoRow label="Prestataire" value={project.prestataire} />
                            <InfoRow label="Contact" value={project.prestataireContact} />
                            <InfoRow label="Email" value={project.prestataireEmail} />
                        </Section>
                    )}

                    <Section icon={CheckCircle2} title="Informations système">
                        <InfoRow
                            label="Créé le"
                            value={format(new Date(project.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                        />
                        <InfoRow label="Créé par" value={createdByLabel} />
                    </Section>
                </div>
            </SheetContent>
        </Sheet>
    );
}
