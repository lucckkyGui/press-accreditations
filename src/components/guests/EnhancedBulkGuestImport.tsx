import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Guest, GuestZone, GuestStatus } from '@/types';
import { AlertCircle, FileUp, X, Check, Download, Users } from 'lucide-react';
import Papa from 'papaparse';

interface EnhancedBulkGuestImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (guests: Array<Partial<Guest> & { eventId: string }>) => Promise<void>;
  eventId: string;
  isSubmitting?: boolean;
}

type ProcessedGuest = {
  firstName: string;
  lastName: string;
  email: string;
  pesel?: string;
  company?: string;
  phone?: string;
  zone: GuestZone;
  valid: boolean;
  errors: string[];
  selected: boolean;
};

const EnhancedBulkGuestImport: React.FC<EnhancedBulkGuestImportProps> = ({ 
  open, 
  onOpenChange, 
  onImport, 
  eventId,
  isSubmitting = false 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [processedGuests, setProcessedGuests] = useState<ProcessedGuest[]>([]);
  const [defaultZone, setDefaultZone] = useState<GuestZone>('general');
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    parseFile(selectedFile);
  };
  
  const parseFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    
    if (!file.name.match(/\.(csv|xlsx|xls)$/)) {
      setError('Proszę wybrać plik CSV lub Excel');
      setIsProcessing(false);
      return;
    }
    
    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError('Nie można przetworzyć pliku. Sprawdź format danych.');
            setIsProcessing(false);
            return;
          }
          
          const processed = results.data.map((row: any, index: number) => {
            const errors: string[] = [];
            
            // Walidacja wymaganych pól
            const firstName = row.firstName || row['Imię'] || row['imie'] || row['first_name'] || '';
            const lastName = row.lastName || row['Nazwisko'] || row['nazwisko'] || row['last_name'] || '';
            const email = row.email || row['Email'] || row['email'] || '';
            const pesel = row.pesel || row['PESEL'] || row['Pesel'] || '';
            
            if (!firstName.trim()) errors.push('Brak imienia');
            if (!lastName.trim()) errors.push('Brak nazwiska');
            if (!email.trim()) errors.push('Brak adresu email');
            else if (!isValidEmail(email)) errors.push('Niepoprawny format adresu email');
            
            // Walidacja PESEL
            if (pesel && !isValidPesel(pesel)) {
              errors.push('Niepoprawny format PESEL');
            }
            
            const company = row.company || row['Firma'] || row['firma'] || row['company'] || '';
            const phone = row.phone || row['Telefon'] || row['telefon'] || row['phone'] || '';
            
            let zone: GuestZone = defaultZone;
            const zoneValue = row.zone || row['Strefa'] || row['strefa'] || '';
            if (['vip', 'press', 'staff', 'general'].includes(zoneValue)) {
              zone = zoneValue as GuestZone;
            }
            
            return {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.trim().toLowerCase(),
              pesel: pesel.trim(),
              company: company.trim(),
              phone: phone.trim(),
              zone,
              valid: errors.length === 0,
              errors,
              selected: errors.length === 0 // Domyślnie zaznacz tylko poprawne wpisy
            };
          });
          
          setProcessedGuests(processed);
          setIsProcessing(false);
        }
      });
    } catch (err) {
      console.error('Error parsing file:', err);
      setError('Wystąpił błąd podczas przetwarzania pliku');
      setIsProcessing(false);
    }
  };
  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPesel = (pesel: string) => {
    if (!/^\d{11}$/.test(pesel)) return false;
    
    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    let sum = 0;
    
    for (let i = 0; i < 10; i++) {
      sum += parseInt(pesel[i]) * weights[i];
    }
    
    const checksum = (10 - (sum % 10)) % 10;
    return checksum === parseInt(pesel[10]);
  };
  
  const handleSelectAll = (checked: boolean) => {
    setProcessedGuests(guests => 
      guests.map(guest => ({ ...guest, selected: checked && guest.valid }))
    );
  };

  const handleSelectGuest = (index: number, checked: boolean) => {
    setProcessedGuests(guests => 
      guests.map((guest, i) => 
        i === index ? { ...guest, selected: checked } : guest
      )
    );
  };
  
  const handleImport = async () => {
    try {
      const selectedValidGuests = processedGuests
        .filter(guest => guest.selected && guest.valid)
        .map(guest => ({
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          pesel: guest.pesel,
          company: guest.company,
          phone: guest.phone,
          zone: guest.zone,
          status: 'invited' as GuestStatus,
          eventId
        }));
      
      if (selectedValidGuests.length === 0) {
        setError('Nie wybrano żadnych prawidłowych gości do zaimportowania');
        return;
      }
      
      // Symulacja postępu importu
      const batchSize = 100;
      const totalBatches = Math.ceil(selectedValidGuests.length / batchSize);
      
      for (let i = 0; i < totalBatches; i++) {
        const batch = selectedValidGuests.slice(i * batchSize, (i + 1) * batchSize);
        await onImport(batch);
        
        const progress = ((i + 1) / totalBatches) * 100;
        setImportProgress(progress);
        
        // Małe opóźnienie dla lepszego UX
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      resetForm();
      onOpenChange(false);
    } catch (err) {
      console.error('Error importing guests:', err);
      setError('Wystąpił błąd podczas importowania gości');
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setProcessedGuests([]);
    setError(null);
    setImportProgress(0);
    setIsProcessing(false);
  };
  
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const csvContent = "firstName,lastName,email,pesel,company,phone,zone\n" +
                      "Jan,Kowalski,jan@example.com,80010112345,ABC Corp,+48123456789,general\n" +
                      "Anna,Nowak,anna@example.com,85020298765,XYZ Media,+48987654321,press";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'szablon_gosci.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedCount = processedGuests.filter(g => g.selected).length;
  const validCount = processedGuests.filter(g => g.valid).length;
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Import gości z pliku</DialogTitle>
          <DialogDescription>
            Importuj listę gości z pliku CSV lub Excel. Obsługujemy pola: imię, nazwisko, email, PESEL, firma, telefon, strefa.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Błąd</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-6 py-4">
          {!file ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm text-center text-muted-foreground mb-2">
                  Przeciągnij i upuść plik CSV/Excel tutaj lub kliknij, aby wybrać
                </p>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                />
                <Button asChild>
                  <label htmlFor="file-upload">Wybierz plik</label>
                </Button>
              </div>
              
              <div className="flex justify-center">
                <Button variant="outline" onClick={downloadTemplate} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Pobierz szablon CSV
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {processedGuests.length} rekordów, {validCount} prawidłowych, {selectedCount} wybranych
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Domyślna strefa dostępu</Label>
                <Select value={defaultZone} onValueChange={(value: GuestZone) => setDefaultZone(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wybierz strefę dostępu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Ogólna</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="press">Press</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Przetwarzanie pliku...</p>
                  </div>
                </div>
              ) : (
                <>
                  {importProgress > 0 && importProgress < 100 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Postęp importu:</span>
                        <span className="text-sm font-medium">{Math.round(importProgress)}%</span>
                      </div>
                      <Progress value={importProgress} className="w-full" />
                    </div>
                  )}
                  
                  <div className="border rounded-md overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background">
                          <TableRow>
                            <TableHead className="w-[40px]">
                              <Checkbox 
                                checked={selectedCount > 0 && selectedCount === validCount}
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>
                            <TableHead className="w-[40px]">Status</TableHead>
                            <TableHead>Imię</TableHead>
                            <TableHead>Nazwisko</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>PESEL</TableHead>
                            <TableHead>Firma</TableHead>
                            <TableHead>Strefa</TableHead>
                            <TableHead>Błędy</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {processedGuests.map((guest, index) => (
                            <TableRow key={index} className={!guest.valid ? 'bg-red-50' : ''}>
                              <TableCell>
                                <Checkbox 
                                  checked={guest.selected}
                                  onCheckedChange={(checked) => handleSelectGuest(index, !!checked)}
                                  disabled={!guest.valid}
                                />
                              </TableCell>
                              <TableCell>
                                {guest.valid ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                              </TableCell>
                              <TableCell>{guest.firstName || <span className="text-red-500">Brak</span>}</TableCell>
                              <TableCell>{guest.lastName || <span className="text-red-500">Brak</span>}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{guest.email || <span className="text-red-500">Brak</span>}</TableCell>
                              <TableCell>{guest.pesel || "-"}</TableCell>
                              <TableCell>{guest.company || "-"}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {guest.zone === 'vip' ? 'VIP' : 
                                   guest.zone === 'press' ? 'Press' : 
                                   guest.zone === 'staff' ? 'Staff' : 'Ogólna'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {guest.errors.length > 0 && (
                                  <div className="text-xs text-red-600">
                                    {guest.errors.join(', ')}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          {processedGuests.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={9} className="h-24 text-center">
                                Brak danych do wyświetlenia
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Anuluj
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || selectedCount === 0 || isSubmitting || isProcessing}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            {isSubmitting ? 'Importowanie...' : `Importuj (${selectedCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedBulkGuestImport;
