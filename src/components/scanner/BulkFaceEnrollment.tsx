import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileArchive, FileSpreadsheet, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import JSZip from 'jszip';
import Papa from 'papaparse';

interface EnrollmentResult {
  guestName: string;
  fileName: string;
  success: boolean;
  message: string;
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

  const handleZipChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setZipFile(file);
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

  const processBulkEnrollment = async () => {
    if (!zipFile || !csvFile || !selectedEventId || !guests?.length) return;

    setIsProcessing(true);
    setResults([]);
    setProgress(0);
    setProcessedItems(0);

    try {
      // Parse CSV
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

      // Expect columns: email (or id), filename
      const rows = parsed.data;
      if (rows.length === 0) {
        toast.error('Plik CSV jest pusty');
        setIsProcessing(false);
        return;
      }

      // Detect columns
      const firstRow = rows[0];
      const keys = Object.keys(firstRow);
      const emailCol = keys.find((k) => k.includes('email') || k.includes('e-mail'));
      const idCol = keys.find((k) => k === 'id' || k === 'guest_id');
      const fileCol = keys.find((k) => k.includes('file') || k.includes('photo') || k.includes('zdjęcie') || k.includes('zdjecie') || k.includes('plik'));

      if (!fileCol) {
        toast.error('Brak kolumny z nazwą pliku w CSV (oczekiwana: file, photo, plik, zdjęcie)');
        setIsProcessing(false);
        return;
      }

      if (!emailCol && !idCol) {
        toast.error('Brak kolumny identyfikującej gościa (oczekiwana: email lub id)');
        setIsProcessing(false);
        return;
      }

      // Load ZIP
      const zipData = await zipFile.arrayBuffer();
      const zip = await JSZip.loadAsync(zipData);

      setTotalItems(rows.length);
      const enrollResults: EnrollmentResult[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const fileName = row[fileCol!]?.trim();
        const email = emailCol ? row[emailCol]?.trim() : undefined;
        const guestId = idCol ? row[idCol]?.trim() : undefined;

        // Find guest
        let guest = guestId
          ? guests.find((g) => g.id === guestId)
          : guests.find((g) => g.email.toLowerCase() === email?.toLowerCase());

        if (!guest) {
          enrollResults.push({
            guestName: email || guestId || '?',
            fileName: fileName || '?',
            success: false,
            message: 'Nie znaleziono gościa',
          });
          setProcessedItems(i + 1);
          setProgress(((i + 1) / rows.length) * 100);
          continue;
        }

        // Find file in ZIP (support nested paths)
        let zipEntry = zip.file(fileName);
        if (!zipEntry) {
          // Search in subdirectories
          const allFiles = Object.keys(zip.files);
          const match = allFiles.find((f) => f.endsWith(`/${fileName}`) || f === fileName);
          if (match) zipEntry = zip.file(match);
        }

        if (!zipEntry) {
          enrollResults.push({
            guestName: `${guest.first_name} ${guest.last_name}`,
            fileName: fileName || '?',
            success: false,
            message: 'Nie znaleziono pliku w ZIP',
          });
          setProcessedItems(i + 1);
          setProgress(((i + 1) / rows.length) * 100);
          continue;
        }

        try {
          // Read image from ZIP as base64
          const base64 = await zipEntry.async('base64');
          const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
          const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
          const dataUrl = `data:${mimeType};base64,${base64}`;

          // Call edge function for enrollment
          const { data, error } = await supabase.functions.invoke('face-recognition', {
            body: {
              action: 'enroll',
              capturedImageBase64: dataUrl,
              eventId: selectedEventId,
              guestId: guest.id,
            },
          });

          if (error) throw error;

          enrollResults.push({
            guestName: `${guest.first_name} ${guest.last_name}`,
            fileName,
            success: true,
            message: data.message || 'Zapisano',
          });
        } catch (err: any) {
          enrollResults.push({
            guestName: `${guest.first_name} ${guest.last_name}`,
            fileName,
            success: false,
            message: err.message || 'Błąd zapisu',
          });
        }

        setProcessedItems(i + 1);
        setProgress(((i + 1) / rows.length) * 100);
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

  return (
    <div className="space-y-4">
      {/* Event selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-5 w-5" />
            Masowy enrollment twarzy (ZIP + CSV)
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

      {/* File uploads */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          {/* CSV */}
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
              <Badge variant="secondary" className="text-xs">
                {csvFile.name}
              </Badge>
            )}
          </div>

          {/* ZIP */}
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

          <Button
            onClick={processBulkEnrollment}
            disabled={isProcessing || !zipFile || !csvFile || !selectedEventId}
            className="w-full"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isProcessing ? `Przetwarzanie ${processedItems}/${totalItems}...` : 'Rozpocznij enrollment'}
          </Button>
        </CardContent>
      </Card>

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
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-3">
              Wyniki enrollmentu
              <Badge variant="default">{successCount} ✓</Badge>
              {failCount > 0 && <Badge variant="destructive">{failCount} ✗</Badge>}
            </CardTitle>
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
              <p className="font-medium text-foreground">Przykładowy format CSV:</p>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`email,file
jan.kowalski@firma.pl,jan_kowalski.jpg
anna.nowak@firma.pl,anna_nowak.jpg`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
