import React, { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Search, Download, Eye, UserCheck, Trash2, Edit, Plus, Key, Clock, AlertTriangle, Settings } from "lucide-react";
import { toast } from "sonner";

const AuditTrail = () => {
  usePageTitle("Ścieżka audytu");

  const auditLogs = [
    { id: 1, timestamp: "2026-04-06 14:23:01", user: "admin@events.pl", action: "login", resource: "auth", details: "Successful login from 185.xxx.xxx.12", severity: "info" },
    { id: 2, timestamp: "2026-04-06 14:25:33", user: "admin@events.pl", action: "update", resource: "event", details: "Updated event 'Gala Medialna 2026' title", severity: "info" },
    { id: 3, timestamp: "2026-04-06 14:30:15", user: "jan@media.pl", action: "create", resource: "accreditation_request", details: "New accreditation request for event abc-123", severity: "info" },
    { id: 4, timestamp: "2026-04-06 14:35:44", user: "admin@events.pl", action: "delete", resource: "guest", details: "Deleted guest record id: xyz-789", severity: "warning" },
    { id: 5, timestamp: "2026-04-06 14:40:12", user: "unknown", action: "login_failed", resource: "auth", details: "Failed login attempt from 92.xxx.xxx.45", severity: "error" },
    { id: 6, timestamp: "2026-04-06 15:01:00", user: "admin@events.pl", action: "export", resource: "gdpr", details: "GDPR data export for user abc-456", severity: "warning" },
    { id: 7, timestamp: "2026-04-06 15:15:22", user: "staff@events.pl", action: "checkin", resource: "guest", details: "Checked in guest Jan Kowalski via QR scan", severity: "info" },
    { id: 8, timestamp: "2026-04-06 15:30:00", user: "admin@events.pl", action: "role_change", resource: "user_roles", details: "Changed role of user xyz from 'guest' to 'organizer'", severity: "warning" },
  ];

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

  const actionIcons: Record<string, React.ElementType> = {
    login: UserCheck, login_failed: AlertTriangle, create: Plus, update: Edit,
    delete: Trash2, export: Download, checkin: Eye, role_change: Key,
  };

  const [filterAction, setFilterAction] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = auditLogs.filter(log => {
    if (filterAction !== "all" && log.action !== filterAction) return false;
    if (searchTerm && !log.details.toLowerCase().includes(searchTerm.toLowerCase()) && !log.user.includes(searchTerm)) return false;
    return true;
  });

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
                <CardTitle>Logi audytu</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Szukaj..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-[200px]" />
                  </div>
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="create">Tworzenie</SelectItem>
                      <SelectItem value="update">Aktualizacja</SelectItem>
                      <SelectItem value="delete">Usunięcie</SelectItem>
                      <SelectItem value="export">Eksport</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Eksportuj</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
                  {filteredLogs.map(log => {
                    const Icon = actionIcons[log.action] || Eye;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                        <TableCell className="text-sm">{log.user}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <Icon className="h-3 w-3" /> {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.resource}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">{log.details}</TableCell>
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
