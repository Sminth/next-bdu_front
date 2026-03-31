"use client";

import { useState } from "react";
import { PagePermissionGuard } from "@/components/auth/page-permission-guard";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Loader2, Search, ChevronLeft, ChevronRight,
  Monitor, Smartphone, Tablet, Download, Eye, X,
} from "lucide-react";
import { useUserSessions } from "@/hooks/use-user-sessions";
import { useAuditLogs } from "@/hooks/use-audit-logs";
import { userSessionService } from "@/services/user-session.service";
import { auditService } from "@/services/audit.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { exportToCSV } from "@/lib/export";
import { toast } from "@/lib/toast";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { UserSession } from "@/types/user-session.types";
import { AuditLog } from "@/types/audit.types";

const PAGE_SIZE = 20;

const ACTION_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  LOGIN: { label: "Connexion", variant: "default" },
  CREATE: { label: "Création", variant: "default" },
  UPDATE: { label: "Modification", variant: "secondary" },
  DELETE: { label: "Suppression", variant: "destructive" },
  CHANGE_PASSWORD: { label: "Changement MDP", variant: "outline" },
  RESET_PASSWORD: { label: "Réinit. MDP", variant: "outline" },
};

const ENTITY_OPTIONS = [
  { value: "__all__", label: "Toutes les entités" },
  { value: "Auth", label: "Authentification" },
  { value: "User", label: "Utilisateurs" },
  { value: "Profile", label: "Profils" },
  { value: "Direction", label: "Directions" },
];

function DeviceIcon({ type }: { type?: string | null }) {
  if (type === "Mobile") return <Smartphone className="h-4 w-4 text-muted-foreground" />;
  if (type === "Tablet") return <Tablet className="h-4 w-4 text-muted-foreground" />;
  return <Monitor className="h-4 w-4 text-muted-foreground" />;
}

function SessionDuration({ session }: { session: UserSession }) {
  if (!session.logoutAt) {
    return <span className="text-xs text-green-600 font-medium">En cours</span>;
  }
  const duration = intervalToDuration({
    start: new Date(session.loginAt),
    end: new Date(session.logoutAt),
  });
  const formatted = formatDuration(duration, {
    locale: fr,
    format: duration.hours ? ["hours", "minutes"] : ["minutes", "seconds"],
  });
  return <span className="text-sm">{formatted || "< 1 min"}</span>;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground shrink-0 w-36">{label}</span>
      <span className="text-sm font-medium text-right">
        {value ?? <span className="text-muted-foreground/40">—</span>}
      </span>
    </div>
  );
}

/* ─── Détail Session ─── */
function SessionDetailDialog({ session, open, onOpenChange }: {
  session: UserSession | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!session) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Détail de la session</DialogTitle>
        </DialogHeader>
        <div className="space-y-0 mt-2">
          <InfoRow label="Utilisateur" value={
            session.user?.firstName
              ? `${session.user.firstName} ${session.user.lastName ?? ""}`.trim()
              : "—"
          } />
          <InfoRow label="Email" value={session.userEmail} />
          <InfoRow label="Adresse IP" value={session.ipAddress} />
          <InfoRow label="Navigateur" value={
            session.browserName
              ? `${session.browserName}${session.browserVersion ? ` ${session.browserVersion}` : ""}`
              : null
          } />
          <InfoRow label="Système d'exploitation" value={session.osName} />
          <InfoRow label="Appareil" value={
            <div className="flex items-center gap-1.5">
              <DeviceIcon type={session.deviceType} />
              <span>{session.deviceType ?? "—"}</span>
            </div>
          } />
          <InfoRow label="Connexion" value={format(new Date(session.loginAt), "dd MMM yyyy HH:mm:ss", { locale: fr })} />
          <InfoRow label="Déconnexion" value={
            session.logoutAt
              ? format(new Date(session.logoutAt), "dd MMM yyyy HH:mm:ss", { locale: fr })
              : <span className="text-green-600 font-medium">Session active</span>
          } />
          <InfoRow label="Durée" value={<SessionDuration session={session} />} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Détail Activité ─── */
function ActiviteDetailDialog({ log, open, onOpenChange }: {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!log) return null;
  const meta = ACTION_LABELS[log.action] ?? { label: log.action, variant: "outline" as const };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Détail de l'activité</DialogTitle>
        </DialogHeader>
        <div className="space-y-0 mt-2">
          <InfoRow label="Date" value={format(new Date(log.createdAt), "dd MMM yyyy HH:mm:ss", { locale: fr })} />
          <InfoRow label="Action" value={<Badge variant={meta.variant} className="text-xs">{meta.label}</Badge>} />
          <InfoRow label="Entité" value={log.entity} />
          <InfoRow label="ID entité" value={log.entityId} />
          <InfoRow label="Utilisateur" value={log.userEmail} />
          {log.details && (
            <div className="pt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Détails</p>
              <pre className="text-xs bg-muted/40 rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap break-all">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Onglet Sessions ─── */
function SessionsTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sessionToView, setSessionToView] = useState<UserSession | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, isError } = useUserSessions({ page, limit: PAGE_SIZE, search });
  const sessions = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const rows = await userSessionService.exportAll(search || undefined);
      exportToCSV(rows, `historique-connexions-${format(new Date(), "yyyyMMdd")}`);
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher (email, IP, navigateur...)"
              className="pl-9 bg-muted/40"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">Filtrer</Button>
        </form>
        <div className="flex items-center gap-2 ml-auto">
          {data && (
            <p className="text-sm text-muted-foreground font-medium">{data.total} entrée{data.total !== 1 ? "s" : ""}</p>
          )}
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Exporter CSV
          </Button>
        </div>
      </div>

      <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center p-12 text-destructive">Erreur lors du chargement.</div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground">Aucune session trouvée.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">Utilisateur</TableHead>
                  <TableHead className="w-[150px]">Date & Heure</TableHead>
                  <TableHead className="w-[120px]">IP</TableHead>
                  <TableHead className="w-[160px]">Navigateur</TableHead>
                  <TableHead className="w-[100px]">Appareil</TableHead>
                  <TableHead className="w-[90px]">Durée</TableHead>
                  <TableHead className="w-[140px]">Connexion</TableHead>
                  <TableHead className="w-[140px]">Déconnexion</TableHead>
                  <TableHead className="text-right w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/30">
                    <TableCell>
                      <p className="font-medium text-sm">
                        {s.user?.firstName ? `${s.user.firstName} ${s.user.lastName ?? ""}`.trim() : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.userEmail}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(s.loginAt), "dd MMM yyyy", { locale: fr })}
                      <br />
                      {format(new Date(s.loginAt), "HH:mm:ss")}
                    </TableCell>
                    <TableCell className="text-sm font-mono">{s.ipAddress ?? "—"}</TableCell>
                    <TableCell>
                      {s.browserName ? (
                        <>
                          <p className="text-sm font-medium">{s.browserName} <span className="text-xs text-muted-foreground">{s.browserVersion}</span></p>
                          <p className="text-xs text-muted-foreground">{s.osName}</p>
                        </>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <DeviceIcon type={s.deviceType} />
                        <span className="text-sm">{s.deviceType ?? "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell><SessionDuration session={s} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(s.loginAt), "dd MMM yyyy HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {s.logoutAt
                        ? format(new Date(s.logoutAt), "dd MMM yyyy HH:mm", { locale: fr })
                        : <span className="text-green-600 font-medium">Active</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-[#2c63a8] hover:bg-blue-50"
                        onClick={() => { setSessionToView(s); setDetailOpen(true); }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">Page {page} / {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <SessionDetailDialog
        session={sessionToView}
        open={detailOpen}
        onOpenChange={(v) => { setDetailOpen(v); if (!v) setSessionToView(null); }}
      />
    </div>
  );
}

/* ─── Onglet Activités ─── */
function ActivitesTab() {
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState("__all__");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [logToView, setLogToView] = useState<AuditLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const entity = entityFilter === "__all__" ? undefined : entityFilter;
  const { data, isLoading, isError } = useAuditLogs({ page, limit: PAGE_SIZE, entity, q: search || undefined });
  const logs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const filtered = logs;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const rows = await auditService.exportAll({ entity, q: search || undefined });
      exportToCSV(rows, `historique-activites-${format(new Date(), "yyyyMMdd")}`);
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher (email, action, entité...)"
              className="pl-9 bg-muted/40"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">Filtrer</Button>
        </form>
        <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrer par entité" />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 ml-auto">
          {data && <p className="text-sm text-muted-foreground font-medium">{data.total} entrée{data.total !== 1 ? "s" : ""}</p>}
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Exporter CSV
          </Button>
        </div>
      </div>

      <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center p-12 text-destructive">Erreur lors du chargement.</div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground">Aucune entrée trouvée.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[160px]">Date</TableHead>
                  <TableHead className="w-[130px]">Action</TableHead>
                  <TableHead className="w-[120px]">Entité</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead className="text-right w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => {
                  const meta = ACTION_LABELS[log.action] ?? { label: log.action, variant: "outline" as const };
                  return (
                    <TableRow key={log.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={meta.variant} className="text-xs">{meta.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{log.entity}</span>
                        {log.entityId && (
                          <p className="text-xs text-muted-foreground truncate max-w-[100px]">{log.entityId}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{log.userEmail ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {log.details ? JSON.stringify(log.details) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-[#2c63a8] hover:bg-blue-50"
                          onClick={() => { setLogToView(log); setDetailOpen(true); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">Page {page} / {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ActiviteDetailDialog
        log={logToView}
        open={detailOpen}
        onOpenChange={(v) => { setDetailOpen(v); if (!v) setLogToView(null); }}
      />
    </div>
  );
}

export default function HistoriquePage() {
  const [tab, setTab] = useState<"sessions" | "activites">("sessions");

  return (
    <PagePermissionGuard permission="historique.read">
    <div className="flex flex-col gap-6 w-full fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Suivi des connexions et des activités sur la plateforme.
          </p>
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {(["sessions", "activites"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "sessions" ? "Connexions" : "Activités"}
          </button>
        ))}
      </div>

      {tab === "sessions" ? <SessionsTab /> : <ActivitesTab />}
    </div>
    </PagePermissionGuard>
  );
}
