import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Plus, Radio, Ban, Search, Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import PageContent from '@/components/layout/PageContent';
import { rfidService, WristbandAssignment } from '@/services/rfid/rfidService';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';

interface CsvRow {
  rfid_code: string;
  guest_email?: string;
  guest_first_name?: string;
  guest_last_name?: string;
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

const WristbandManagement = () => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [wristbands, setWristbands] = useState<WristbandAssignment[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [newRfid, setNewRfid] = useState('');
  const [newGuestId, setNewGuestId] = useState('');

  // CSV import state
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvPreview, setCsvPreview] = useState<CsvRow[]>([]);
  const [importMode, setImportMode] = useState<'email' | 'name'>('email');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('events').select('id, title').order('start_date', { ascending: false });
      setEvents(data || []);
      if (data && data.length > 0) setSelectedEvent(data[0].id);
    };
    load();
  }, []);

  const loadData = useCallback(async () => {
    if (!selectedEvent) return;
    const [wb, g] = await Promise.all([
      rfidService.getWristbands(selectedEvent),
      supabase.from('guests').select('id, first_name, last_name, company, email').eq('event_id', selectedEvent)
    ]);
    setWristbands(wb);
    setGuests(g.data || []);
  }, [selectedEvent]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAssign = async () => {
    if (!newRfid || !newGuestId) {
      toast.error('Wypełnij wszystkie pola');
      return;
    }
    try {
      await rfidService.assignWristband(selectedEvent, newGuestId, newRfid);
      toast.success('Opaska przypisana');
      setDialogOpen(false);
      setNewRfid('');
      setNewGuestId('');
      await loadData();
    } catch (err: any) {
      toast.error('Błąd', { description: err.message });
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await rfidService.deactivateWristband(id, 'Dezaktywacja manualna');
      toast.success('Opaska dezaktywowana');
      await loadData();
    } catch (err: any) {
      toast.error('Błąd', { description: err.message });
    }
  };

  // CSV file handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvErrors([]);
    setImportResult(null);
    setImportProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];
        const rows: CsvRow[] = [];

        results.data.forEach((row: any, i: number) => {
          const rfid = (row.rfid_code || row.rfid || row.code || row.RFID || '').toString().trim();
          if (!rfid) {
            errors.push(`Wiersz ${i + 2}: brak kodu RFID`);
            return;
          }

          const email = (row.guest_email || row.email || row.Email || '').toString().trim();
          const firstName = (row.guest_first_name || row.first_name || row.imie || row.Imię || '').toString().trim();
          const lastName = (row.guest_last_name || row.last_name || row.nazwisko || row.Nazwisko || '').toString().trim();

          if (!email && (!firstName || !lastName)) {
            errors.push(`Wiersz ${i + 2}: brak emaila lub imienia i nazwiska dla kodu ${rfid}`);
            return;
          }

          rows.push({ rfid_code: rfid, guest_email: email, guest_first_name: firstName, guest_last_name: lastName });
        });

        setCsvData(rows);
        setCsvPreview(rows.slice(0, 10));
        setCsvErrors(errors);

        if (rows.length > 0 && rows[0].guest_email) {
          setImportMode('email');
        } else {
          setImportMode('name');
        }
      },
      error: (err) => {
        toast.error('Błąd parsowania CSV', { description: err.message });
      }
    });
  };

  const handleBulkImport = async () => {
    if (!selectedEvent || csvData.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);
    const result: ImportResult = { total: csvData.length, success: 0, failed: 0, errors: [] };

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      setImportProgress(Math.round(((i + 1) / csvData.length) * 100));

      try {
        // Find guest by email or name
        let guest: any = null;

        if (importMode === 'email' && row.guest_email) {
          guest = guests.find(g => g.email?.toLowerCase() === row.guest_email?.toLowerCase());
        } else if (row.guest_first_name && row.guest_last_name) {
          guest = guests.find(g =>
            g.first_name?.toLowerCase() === row.guest_first_name?.toLowerCase() &&
            g.last_name?.toLowerCase() === row.guest_last_name?.toLowerCase()
          );
        }

        if (!guest) {
          result.failed++;
          result.errors.push(`${row.rfid_code}: nie znaleziono gościa (${row.guest_email || `${row.guest_first_name} ${row.guest_last_name}`})`);
          continue;
        }

        await rfidService.assignWristband(selectedEvent, guest.id, row.rfid_code);
        result.success++;
      } catch (err: any) {
        result.failed++;
        result.errors.push(`${row.rfid_code}: ${err.message}`);
      }
    }

    setImportResult(result);
    setIsImporting(false);
    await loadData();

    if (result.failed === 0) {
      toast.success(`Zaimportowano ${result.success} opasek`);
    } else {
      toast.warning(`Zaimportowano ${result.success}/${result.total}, ${result.failed} błędów`);
    }
  };

  const downloadTemplate = () => {
    const csv = Papa.unparse([
      { rfid_code: 'RFID001', guest_email: 'jan@example.com', guest_first_name: 'Jan', guest_last_name: 'Kowalski' },
      { rfid_code: 'RFID002', guest_email: 'anna@example.com', guest_first_name: 'Anna', guest_last_name: 'Nowak' },
    ]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wristbands_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setCsvData([]);
    setCsvPreview([]);
    setCsvErrors([]);
    setImportResult(null);
    setImportProgress(0);
  };

  const assignedGuestIds = new Set(wristbands.map(w => w.guest_id));
  const unassignedGuests = guests.filter(g => !assignedGuestIds.has(g.id));

  const filtered = wristbands.filter(w =>
    !search || w.guest_name?.toLowerCase().includes(search.toLowerCase()) || w.rfid_code.includes(search)
  );

  return (
    <PageContent>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Radio className="h-8 w-8 text-primary" />
              Zarządzanie opaskami RFID
            </h1>
            <p className="text-muted-foreground">Przypisuj opaski do gości i zarządzaj dostępem</p>
          </div>
          <div className="flex gap-2">
            {/* Bulk import dialog */}
            <Dialog open={importDialogOpen} onOpenChange={(open) => { setImportDialogOpen(open); if (!open) resetImport(); }}>
              <DialogTrigger asChild>
                <Button variant="outline"><Upload className="h-4 w-4 mr-2" />Import CSV</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Masowy import opasek RFID
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Template download */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Pobierz szablon CSV</p>
                      <p className="text-xs text-muted-foreground">Kolumny: rfid_code, guest_email, guest_first_name, guest_last_name</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={downloadTemplate}>
                      <Download className="h-4 w-4 mr-2" />Szablon
                    </Button>
                  </div>

                  {/* File upload */}
                  <div>
                    <Label>Plik CSV</Label>
                    <Input type="file" accept=".csv" onChange={handleFileUpload} className="mt-1" />
                  </div>

                  {/* CSV parse errors */}
                  {csvErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-medium mb-1">Błędy parsowania ({csvErrors.length}):</p>
                        <ul className="text-xs space-y-0.5 max-h-24 overflow-y-auto">
                          {csvErrors.slice(0, 5).map((e, i) => <li key={i}>• {e}</li>)}
                          {csvErrors.length > 5 && <li>...i {csvErrors.length - 5} więcej</li>}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Preview */}
                  {csvPreview.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Podgląd ({csvData.length} wierszy)</p>
                        <Select value={importMode} onValueChange={(v: 'email' | 'name') => setImportMode(v)}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Dopasuj po emailu</SelectItem>
                            <SelectItem value="name">Dopasuj po imieniu/nazwisku</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium">Kod RFID</th>
                              <th className="px-3 py-2 text-left font-medium">
                                {importMode === 'email' ? 'Email' : 'Imię i nazwisko'}
                              </th>
                              <th className="px-3 py-2 text-left font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {csvPreview.map((row, i) => {
                              const matchField = importMode === 'email'
                                ? row.guest_email
                                : `${row.guest_first_name} ${row.guest_last_name}`;
                              const found = importMode === 'email'
                                ? guests.some(g => g.email?.toLowerCase() === row.guest_email?.toLowerCase())
                                : guests.some(g =>
                                    g.first_name?.toLowerCase() === row.guest_first_name?.toLowerCase() &&
                                    g.last_name?.toLowerCase() === row.guest_last_name?.toLowerCase()
                                  );
                              const alreadyAssigned = wristbands.some(w => w.rfid_code === row.rfid_code);

                              return (
                                <tr key={i} className="border-t">
                                  <td className="px-3 py-2 font-mono text-xs">{row.rfid_code}</td>
                                  <td className="px-3 py-2">{matchField}</td>
                                  <td className="px-3 py-2">
                                    {alreadyAssigned ? (
                                      <Badge variant="secondary" className="text-xs">Już przypisana</Badge>
                                    ) : found ? (
                                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">Znaleziono</Badge>
                                    ) : (
                                      <Badge variant="destructive" className="text-xs">Nie znaleziono</Badge>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {csvData.length > 10 && (
                          <div className="px-3 py-2 bg-muted/30 text-xs text-muted-foreground text-center">
                            ...i {csvData.length - 10} więcej wierszy
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Import progress */}
                  {isImporting && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Importowanie...</span>
                        <span>{importProgress}%</span>
                      </div>
                      <Progress value={importProgress} />
                    </div>
                  )}

                  {/* Import result */}
                  {importResult && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 rounded bg-muted/50">
                          <p className="text-lg font-bold">{importResult.total}</p>
                          <p className="text-xs text-muted-foreground">Łącznie</p>
                        </div>
                        <div className="text-center p-2 rounded bg-green-500/10">
                          <p className="text-lg font-bold text-green-600">{importResult.success}</p>
                          <p className="text-xs text-muted-foreground">Sukces</p>
                        </div>
                        <div className="text-center p-2 rounded bg-destructive/10">
                          <p className="text-lg font-bold text-destructive">{importResult.failed}</p>
                          <p className="text-xs text-muted-foreground">Błędy</p>
                        </div>
                      </div>
                      {importResult.errors.length > 0 && (
                        <div className="max-h-32 overflow-y-auto text-xs space-y-1 p-2 rounded bg-muted/30">
                          {importResult.errors.map((e, i) => (
                            <div key={i} className="flex items-start gap-1">
                              <XCircle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                              <span>{e}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {csvData.length > 0 && !importResult && (
                    <Button onClick={handleBulkImport} disabled={isImporting} className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Importuj {csvData.length} opasek
                    </Button>
                  )}

                  {importResult && (
                    <Button onClick={() => { resetImport(); setImportDialogOpen(false); }} className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />Zamknij
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Single assign dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Przypisz opaskę</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Przypisz opaskę RFID</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Kod RFID opaski</Label>
                    <Input value={newRfid} onChange={e => setNewRfid(e.target.value)} placeholder="Zeskanuj lub wpisz kod..." />
                  </div>
                  <div>
                    <Label>Gość</Label>
                    <Select value={newGuestId} onValueChange={setNewGuestId}>
                      <SelectTrigger><SelectValue placeholder="Wybierz gościa" /></SelectTrigger>
                      <SelectContent>
                        {unassignedGuests.map(g => (
                          <SelectItem key={g.id} value={g.id}>{g.first_name} {g.last_name} {g.company ? `(${g.company})` : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAssign} className="w-full">Przypisz</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Event selector & search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger><SelectValue placeholder="Wybierz wydarzenie" /></SelectTrigger>
            <SelectContent>
              {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Szukaj po nazwie lub kodzie..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="py-4 text-center">
            <p className="text-3xl font-bold">{wristbands.length}</p>
            <p className="text-sm text-muted-foreground">Łącznie opasek</p>
          </CardContent></Card>
          <Card><CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-green-600">{wristbands.filter(w => w.is_active).length}</p>
            <p className="text-sm text-muted-foreground">Aktywne</p>
          </CardContent></Card>
          <Card><CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-destructive">{wristbands.filter(w => !w.is_active).length}</p>
            <p className="text-sm text-muted-foreground">Dezaktywowane</p>
          </CardContent></Card>
        </div>

        {/* Wristband list */}
        <Card>
          <CardHeader><CardTitle>Przypisane opaski</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filtered.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Brak przypisanych opasek. Kliknij "Przypisz opaskę" lub "Import CSV" aby rozpocząć.</p>
              )}
              {filtered.map(w => (
                <div key={w.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Radio className={`h-5 w-5 ${w.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium">{w.guest_name}</p>
                      {w.guest_company && <p className="text-xs text-muted-foreground">{w.guest_company}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-sm bg-background px-2 py-1 rounded">{w.rfid_code}</code>
                    <Badge variant={w.is_active ? 'default' : 'secondary'}>
                      {w.is_active ? 'Aktywna' : 'Nieaktywna'}
                    </Badge>
                    {w.is_active && (
                      <Button size="sm" variant="ghost" onClick={() => handleDeactivate(w.id)}>
                        <Ban className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
};

export default WristbandManagement;
