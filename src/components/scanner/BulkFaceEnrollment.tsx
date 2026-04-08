import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileArchive, FileSpreadsheet, CheckCircle, XCircle, Loader2, AlertCircle, Eye, UserPlus, X, Wand2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
// JSZip loaded dynamically when needed
const loadJSZip = () => import('jszip').then(m => m.default);
import Papa from 'papaparse';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EnrollmentResult {
  guestName: string;
  fileName: string;
  success: boolean;
  message: string;
}

interface ThumbnailPreview {
  fileName: string;
  fullPath: string;
  dataUrl: string;
  assignedGuestId?: string;
}

export default function BulkFaceEnrollment() {
  const [selectedEventId, setSelectedEventId] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [processedItems, setProcessedItems] = useState(0);
  const [results, setResults] = useState<EnrollmentResult[]>([]);
  const [thumbnails, setThumbnails] = useState<ThumbnailPreview[]>([]);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);
  const [mappingMode, setMappingMode] = useState<'csv' | 'manual'>('csv');

  const { data: events } = useQuery({
    queryKey: ['events-bulk-enroll'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('id, title').order('start_date', { ascending: false });
      return data || [];
    },
  });

  const { data: guests } = useQuery({
    queryKey: ['guests-bulk-enroll', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return [];
      const { data } = await supabase
        .from('guests')
        .select('id, first_name, last_name, email')
        .eq('event_id', selectedEventId);
      return data || [];
    },
    enabled: !!selectedEventId,
  });

  const handleZipChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setZipFile(file);
      setThumbnails([]);
      setIsLoadingThumbnails(true);
      try {
        const zipData = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(zipData);
        const imageFiles = Object.keys(zip.files).filter(
          (f) => !zip.files[f].dir && /\.(jpe?g|png|webp)$/i.test(f)
        );
        const previews: ThumbnailPreview[] = [];
        const maxPreviews = Math.min(imageFiles.length, 50);
        for (let i = 0; i < maxPreviews; i++) {
          const entry = zip.file(imageFiles[i]);
          if (!entry) continue;
          const base64 = await entry.async('base64');
          const ext = imageFiles[i].split('.').pop()?.toLowerCase() || 'jpg';
          const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
          const shortName = imageFiles[i].split('/').pop() || imageFiles[i];
          previews.push({
            fileName: shortName,
            fullPath: imageFiles[i],
            dataUrl: `data:${mime};base64,${base64}`,
          });
        }
        setThumbnails(previews);
        toast.success(`Znaleziono ${imageFiles.length} zdjęć w ZIP${imageFiles.length > 50 ? ' (podgląd pierwszych 50)' : ''}`);
      } catch {
        toast.error('Nie udało się odczytać ZIP');
      } finally {
        setIsLoadingThumbnails(false);
      }
    } else {
      toast.error('Wybierz plik ZIP');
    }
  }, []);

  const handleCsvChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
      setCsvFile(file);
    } else {
      toast.error('Wybierz plik CSV');
    }
  }, []);

  const assignGuestToThumbnail = (thumbnailIndex: number, guestId: string) => {
    setThumbnails((prev) =>
      prev.map((t, i) => (i === thumbnailIndex ? { ...t, assignedGuestId: guestId || undefined } : t))
    );
  };

  const clearAssignment = (thumbnailIndex: number) => {
    setThumbnails((prev) =>
      prev.map((t, i) => (i === thumbnailIndex ? { ...t, assignedGuestId: undefined } : t))
    );
  };

  const assignedCount = thumbnails.filter((t) => t.assignedGuestId).length;
  const assignedGuestIds = new Set(thumbnails.map((t) => t.assignedGuestId).filter(Boolean));

  const autoMatchGuests = useCallback(() => {
    if (!guests?.length || thumbnails.length === 0) return;
    let matched = 0;
    const usedGuestIds = new Set<string>();
    const updated = thumbnails.map((t) => {
      if (t.assignedGuestId) {
        usedGuestIds.add(t.assignedGuestId);
        return t;
      }
      const baseName = t.fileName.replace(/\.(jpe?g|png|webp)$/i, '').toLowerCase();
      const guest = guests.find((g) => {
        if (usedGuestIds.has(g.id)) return false;
        const email = g.email.toLowerCase();
        const fullName = `${g.first_name}.${g.last_name}`.toLowerCase();
        const fullNameAlt = `${g.first_name}_${g.last_name}`.toLowerCase();
        const fullNameSpace = `${g.first_name} ${g.last_name}`.toLowerCase();
        return baseName === email || baseName.includes(email)
          || baseName === fullName || baseName === fullNameAlt || baseName === fullNameSpace
          || baseName === g.id;
      });
      if (guest) {
        matched++;
        usedGuestIds.add(guest.id);
        return { ...t, assignedGuestId: guest.id };
      }
      return t;
    });
    setThumbnails(updated);
    if (matched > 0) {
      toast.success(`Automatycznie dopasowano ${matched} gości`);
    } else {
      toast.info('Nie udało się dopasować żadnego gościa po nazwie pliku');
    }
  }, [guests, thumbnails]);

  const processManualEnrollment = async () => {
    if (!zipFile || !selectedEventId || !guests?.length) return;
    const mapped = thumbnails.filter((t) => t.assignedGuestId);
    if (mapped.length === 0) {
      toast.error('Przypisz przynajmniej jednego gościa do zdjęcia');
      return;
    }

    setIsProcessing(true);
    setResults([]);
    setProgress(0);
    setProcessedItems(0);
    setTotalItems(mapped.length);

    try {
      const zipData = await zipFile.arrayBuffer();
      const zip = await JSZip.loadAsync(zipData);
      const enrollResults: EnrollmentResult[] = [];

      for (let i = 0; i < mapped.length; i++) {
        const item = mapped[i];
        const guest = guests.find((g) => g.id === item.assignedGuestId);
        if (!guest) {
          enrollResults.push({ guestName: '?', fileName: item.fileName, success: false, message: 'Nie znaleziono gościa' });
          setProcessedItems(i + 1);
          setProgress(((i + 1) / mapped.length) * 100);
          continue;
        }

        try {
          const { data, error } = await supabase.functions.invoke('face-recognition', {
            body: {
              action: 'enroll',
              capturedImageBase64: item.dataUrl,
              eventId: selectedEventId,
              guestId: guest.id,
            },
          });
          if (error) throw error;
          enrollResults.push({
            guestName: `${guest.first_name} ${guest.last_name}`,
            fileName: item.fileName,
            success: true,
            message: data.message || 'Zapisano',
          });
        } catch (err: any) {
          enrollResults.push({
            guestName: `${guest.first_name} ${guest.last_name}`,
            fileName: item.fileName,
            success: false,
            message: err.message || 'Błąd zapisu',
          });
        }
        setProcessedItems(i + 1);
        setProgress(((i + 1) / mapped.length) * 100);
      }

      setResults(enrollResults);
      const successCount = enrollResults.filter((r) => r.success).length;
      toast.success(`Enrollment zakończony: ${successCount}/${enrollResults.length} zapisanych`);
    } catch (err: any) {
      toast.error(err.message || 'Błąd przetwarzania');
    } finally {
      setIsProcessing(false);
    }
  };

  const processCsvEnrollment = async () => {
    if (!zipFile || !csvFile || !selectedEventId || !guests?.length) return;

    setIsProcessing(true);
    setResults([]);
    setProgress(0);
    setProcessedItems(0);

    try {
      const csvText = await csvFile.text();
      const parsed = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim().toLowerCase(),
      });

      if (parsed.errors.length > 0) {
        toast.error(`Błędy w CSV: ${parsed.errors[0].message}`);
        setIsProcessing(false);
        return;
      }

      const rows = parsed.data;
      if (rows.length === 0) { toast.error('Plik CSV jest pusty'); setIsProcessing(false); return; }

      const firstRow = rows[0];
      const keys = Object.keys(firstRow);
      const emailCol = keys.find((k) => k.includes('email') || k.includes('e-mail'));
      const idCol = keys.find((k) => k === 'id' || k === 'guest_id');
      const fileCol = keys.find((k) => k.includes('file') || k.includes('photo') || k.includes('zdjęcie') || k.includes('zdjecie') || k.includes('plik'));

      if (!fileCol) { toast.error('Brak kolumny z nazwą pliku w CSV'); setIsProcessing(false); return; }
      if (!emailCol && !idCol) { toast.error('Brak kolumny identyfikującej gościa'); setIsProcessing(false); return; }

      const zipData = await zipFile.arrayBuffer();
      const zip = await JSZip.loadAsync(zipData);
      setTotalItems(rows.length);
      const enrollResults: EnrollmentResult[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const fileName = row[fileCol!]?.trim();
        const email = emailCol ? row[emailCol]?.trim() : undefined;
        const guestId = idCol ? row[idCol]?.trim() : undefined;

        let guest = guestId
          ? guests.find((g) => g.id === guestId)
          : guests.find((g) => g.email.toLowerCase() === email?.toLowerCase());

        if (!guest) {
          enrollResults.push({ guestName: email || guestId || '?', fileName: fileName || '?', success: false, message: 'Nie znaleziono gościa' });
          setProcessedItems(i + 1); setProgress(((i + 1) / rows.length) * 100); continue;
        }

        let zipEntry = zip.file(fileName);
        if (!zipEntry) {
          const allFiles = Object.keys(zip.files);
          const match = allFiles.find((f) => f.endsWith(`/${fileName}`) || f === fileName);
          if (match) zipEntry = zip.file(match);
        }

        if (!zipEntry) {
          enrollResults.push({ guestName: `${guest.first_name} ${guest.last_name}`, fileName: fileName || '?', success: false, message: 'Nie znaleziono pliku w ZIP' });
          setProcessedItems(i + 1); setProgress(((i + 1) / rows.length) * 100); continue;
        }

        try {
          const base64 = await zipEntry.async('base64');
          const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
          const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
          const dataUrl = `data:${mimeType};base64,${base64}`;

          const { data, error } = await supabase.functions.invoke('face-recognition', {
            body: { action: 'enroll', capturedImageBase64: dataUrl, eventId: selectedEventId, guestId: guest.id },
          });
          if (error) throw error;
          enrollResults.push({ guestName: `${guest.first_name} ${guest.last_name}`, fileName, success: true, message: data.message || 'Zapisano' });
        } catch (err: any) {
          enrollResults.push({ guestName: `${guest.first_name} ${guest.last_name}`, fileName, success: false, message: err.message || 'Błąd zapisu' });
        }
        setProcessedItems(i + 1); setProgress(((i + 1) / rows.length) * 100);
      }

      setResults(enrollResults);
      const successCount = enrollResults.filter((r) => r.success).length;
      toast.success(`Enrollment zakończony: ${successCount}/${enrollResults.length} zapisanych`);
    } catch (err: any) {
      toast.error(err.message || 'Błąd przetwarzania');
    } finally {
      setIsProcessing(false);
    }
  };

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  const exportResultsToCsv = useCallback(() => {
    if (results.length === 0) return;
    const header = 'Gość,Plik,Status,Wiadomość';
    const rows = results.map((r) =>
      [r.guestName, r.fileName, r.success ? 'OK' : 'Błąd', `"${r.message.replace(/"/g, '""')}"`].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollment-wyniki-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Wyeksportowano wyniki do CSV');
  }, [results]);

  return (
    <div className="space-y-4">
      {/* Event selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-5 w-5" />
            Masowy enrollment twarzy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz wydarzenie..." />
            </SelectTrigger>
            <SelectContent>
              {events?.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedEventId && guests && (
            <p className="text-sm text-muted-foreground">
              {guests.length} gości w tym wydarzeniu
            </p>
          )}
        </CardContent>
      </Card>

      {/* ZIP upload */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <FileArchive className="h-4 w-4" />
              Plik ZIP ze zdjęciami
            </label>
            <p className="text-xs text-muted-foreground">
              Obsługiwane formaty: JPG, PNG, WebP
            </p>
            <input
              type="file"
              accept=".zip"
              onChange={handleZipChange}
              disabled={isProcessing}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
            {zipFile && (
              <Badge variant="secondary" className="text-xs">
                {zipFile.name} ({(zipFile.size / 1024 / 1024).toFixed(1)} MB)
              </Badge>
            )}
          </div>

          {isLoadingThumbnails && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Ładowanie podglądu zdjęć...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mapping mode */}
      {thumbnails.length > 0 && selectedEventId && (
        <Card>
          <CardContent className="pt-4">
            <Tabs value={mappingMode} onValueChange={(v) => setMappingMode(v as 'csv' | 'manual')}>
              <TabsList className="w-full">
                <TabsTrigger value="csv" className="flex-1 gap-1">
                  <FileSpreadsheet className="h-4 w-4" />
                  Mapowanie CSV
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex-1 gap-1">
                  <UserPlus className="h-4 w-4" />
                  Ręczne przypisanie
                </TabsTrigger>
              </TabsList>

              <TabsContent value="csv" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <FileSpreadsheet className="h-4 w-4" />
                    Plik CSV (mapowanie gość → zdjęcie)
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Kolumny: <code>email</code> (lub <code>id</code>) + <code>file</code> (nazwa pliku w ZIP)
                  </p>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvChange}
                    disabled={isProcessing}
                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                  />
                  {csvFile && (
                    <Badge variant="secondary" className="text-xs">{csvFile.name}</Badge>
                  )}
                </div>

                {/* CSV thumbnail preview */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Eye className="h-4 w-4" />
                    Podgląd zdjęć ({thumbnails.length})
                  </label>
                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1">
                    {thumbnails.map((t, i) => (
                      <div key={i} className="relative">
                        <div className="aspect-square rounded overflow-hidden border border-border bg-muted">
                          <img src={t.dataUrl} alt={t.fileName} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[9px] text-muted-foreground truncate" title={t.fileName}>{t.fileName}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={processCsvEnrollment}
                  disabled={isProcessing || !zipFile || !csvFile || !selectedEventId}
                  className="w-full"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {isProcessing ? `Przetwarzanie ${processedItems}/${totalItems}...` : 'Rozpocznij enrollment (CSV)'}
                </Button>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4 mt-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <UserPlus className="h-4 w-4" />
                    Przypisz gości do zdjęć ({assignedCount}/{thumbnails.length})
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={autoMatchGuests}
                      disabled={isProcessing || !guests?.length}
                    >
                      <Wand2 className="h-3.5 w-3.5 mr-1" />
                      Auto-dopasuj
                    </Button>
                    {assignedCount > 0 && (
                      <Badge variant="secondary">{assignedCount} przypisanych</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {thumbnails.map((t, i) => {
                    const assignedGuest = guests?.find((g) => g.id === t.assignedGuestId);
                    return (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card">
                        <div className="w-14 h-14 shrink-0 rounded-md overflow-hidden border border-border bg-muted">
                          <img src={t.dataUrl} alt={t.fileName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-xs text-muted-foreground truncate" title={t.fileName}>{t.fileName}</p>
                          <Select
                            value={t.assignedGuestId || ''}
                            onValueChange={(val) => assignGuestToThumbnail(i, val)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Wybierz gościa..." />
                            </SelectTrigger>
                            <SelectContent>
                              {guests?.map((g) => (
                                <SelectItem
                                  key={g.id}
                                  value={g.id}
                                  disabled={assignedGuestIds.has(g.id) && g.id !== t.assignedGuestId}
                                >
                                  <span className="flex items-center gap-1">
                                    {g.first_name} {g.last_name}
                                    <span className="text-muted-foreground ml-1">({g.email})</span>
                                    {assignedGuestIds.has(g.id) && g.id !== t.assignedGuestId && (
                                      <span className="text-destructive ml-1">✓</span>
                                    )}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {t.assignedGuestId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => clearAssignment(i)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={processManualEnrollment}
                  disabled={isProcessing || assignedCount === 0 || !selectedEventId}
                  className="w-full"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {isProcessing
                    ? `Przetwarzanie ${processedItems}/${totalItems}...`
                    : `Rozpocznij enrollment (${assignedCount} zdjęć)`}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Postęp</span>
              <span>{processedItems} / {totalItems}</span>
            </div>
            <Progress value={progress} />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base flex items-center gap-3">
              Wyniki enrollmentu
              <Badge variant="default">{successCount} ✓</Badge>
              {failCount > 0 && <Badge variant="destructive">{failCount} ✗</Badge>}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={exportResultsToCsv}>
              <Download className="h-3.5 w-3.5 mr-1" />
              Eksport CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm py-1 border-b border-border last:border-0">
                  {r.success ? (
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  )}
                  <span className="font-medium truncate">{r.guestName}</span>
                  <span className="text-muted-foreground truncate text-xs">{r.fileName}</span>
                  <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">{r.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help */}
      <Card className="border-muted">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1 text-muted-foreground">
              <p className="font-medium text-foreground">Jak to działa?</p>
              <ul className="list-disc pl-4 space-y-0.5 text-xs">
                <li><strong>Mapowanie CSV:</strong> Prześlij CSV z kolumnami <code>email</code> + <code>file</code></li>
                <li><strong>Ręczne przypisanie:</strong> Wybierz gościa z listy dla każdego zdjęcia</li>
                <li><strong>Auto-dopasowanie:</strong> Nazwij pliki wg emaila (np. <code>jan@firma.pl.jpg</code>) lub imienia i nazwiska (np. <code>jan.kowalski.jpg</code>)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
