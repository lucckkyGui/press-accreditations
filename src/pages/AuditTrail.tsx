import React, { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Shield, Search, Download, Eye, UserCheck, Trash2, Edit, Plus, Key, AlertTriangle, Settings, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchAuditLogs, type AuditLog } from "@/services/audit/auditService";
import { format } from "date-fns";

const AuditTrail = () => {
  usePageTitle("Ścieżka audytu");

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const actionIcons: Record<string, React.ElementType> = {
    login: UserCheck, login_failed: AlertTriangle, create: Plus, update: Edit,
    delete: Trash2, export: Download, checkin: Eye, role_change: Key,
  };

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchAuditLogs({
        action: filterAction !== "all" ? filterAction : undefined,
        search: searchTerm || undefined,
        limit: pageSize,
        offset: page * pageSize,
      });
      setLogs(result.data || []);
      setTotalCount(result.count || 0);
    } catch (err: unknown) {
      toast.error("Błąd ładowania logów: " + (err.message || "Unknown error"));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filterAction, searchTerm, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleExport = () => {
    if (logs.length === 0) {
      toast.info("Brak logów do eksportu");
      return;
    }
    const csv = [
      "timestamp,user,action,resource,details,severity",
      ...logs.map(l => `"${l.created_at}","${l.user_email || ''}","${l.action}","${l.resource}","${(l.details || '').replace(/"/g, '""')}","${l.severity}"`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Eksport CSV gotowy");
  };

  const retentionPolicies = [
    { table: "user_notifications", retention: "90 dni", autoDelete: true },
    { table: "access_logs", retention: "180 dni", autoDelete: true },
    { table: "audit_logs", retention: "365 dni", autoDelete: false },
    { table: "chat_messages", retention: "365 dni", autoDelete: false },
    { table: "email_queue", retention: "30 dni", autoDelete: true },
  ];

  const ssoProviders = [
    { name: "Google Workspace", type: "OIDC", status: "active", domain: "*.company.com" },
    { name: "Microsoft Azure AD", type: "SAML", status: "inactive", domain: "—" },
    { name: "Okta", type: "SAML", status: "inactive", domain: "—" },
  ];

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" /> Bezpieczeństwo i Audyt
        </h1>
        <p className="text-muted-foreground">Ścieżka audytu, retencja danych i konfiguracja SSO</p>
      </div>

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit">Logi audytu</TabsTrigger>
          <TabsTrigger value="retention">Retencja danych</TabsTrigger>
          <TabsTrigger value="sso">SSO</TabsTrigger>
        </TabsList>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle>Logi audytu</CardTitle>
                  <CardDescription className="mt-1">
                    {totalCount > 0 ? `${totalCount} logów łącznie` : "Brak logów"}
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Szukaj..."
                      value={searchTerm}
                      onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
                      className="pl-10 w-[200px]"
                    />
                  </div>
                  <Select value={filterAction} onValueChange={v => { setFilterAction(v); setPage(0); }}>
                    <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="login_failed">Login failed</SelectItem>
                      <SelectItem value="create">Tworzenie</SelectItem>
                      <SelectItem value="update">Aktualizacja</SelectItem>
                      <SelectItem value="delete">Usunięcie</SelectItem>
                      <SelectItem value="export">Eksport</SelectItem>
                      <SelectItem value="checkin">Check-in</SelectItem>
                      <SelectItem value="role_change">Zmiana roli</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={loadLogs} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" /> Eksportuj
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Brak logów audytu</p>
                  <p className="text-sm mt-1">Logi pojawią się automatycznie gdy użytkownicy będą wykonywać akcje w systemie.</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Czas</TableHead>
                        <TableHead>Użytkownik</TableHead>
                        <TableHead>Akcja</TableHead>
                        <TableHead>Zasób</TableHead>
                        <TableHead>Szczegóły</TableHead>
                        <TableHead>Ważność</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map(log => {
                        const Icon = actionIcons[log.action] || Eye;
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs whitespace-nowrap">
                              {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                            </TableCell>
                            <TableCell className="text-sm">{log.user_email || "system"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="gap-1">
                                <Icon className="h-3 w-3" /> {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{log.resource}</TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                              {log.details}
                            </TableCell>
                            <TableCell>
                              <Badge variant={log.severity === "error" ? "destructive" : log.severity === "warning" ? "secondary" : "outline"}>
                                {log.severity}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Strona {page + 1} z {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                          Poprzednia
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                          Następna
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle>Polityki retencji danych</CardTitle>
              <CardDescription>Konfiguruj automatyczne usuwanie starych danych</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Okres retencji</TableHead>
                    <TableHead>Auto-usuwanie</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retentionPolicies.map(p => (
                    <TableRow key={p.table}>
                      <TableCell className="font-mono text-sm">{p.table}</TableCell>
                      <TableCell>{p.retention}</TableCell>
                      <TableCell><Switch defaultChecked={p.autoDelete} /></TableCell>
                      <TableCell><Button variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sso">
          <Card>
            <CardHeader>
              <CardTitle>Single Sign-On (SSO)</CardTitle>
              <CardDescription>Konfiguruj SAML/OIDC dla enterprise login</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ssoProviders.map(p => (
                  <div key={p.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Key className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-muted-foreground">{p.type} · {p.domain}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={p.status === "active" ? "default" : "outline"}>
                        {p.status === "active" ? "Aktywny" : "Nieaktywny"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        {p.status === "active" ? "Konfiguracja" : "Połącz"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditTrail;