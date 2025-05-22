import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Guest, GuestZone, GuestStatus } from '@/types';
import { AlertCircle, FileUp, X, Check } from 'lucide-react';
import Papa from 'papaparse';

interface BulkGuestImportProps {
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
  company?: string;
  phone?: string;
  zone: GuestZone;
  valid: boolean;
  errors: string[];
};

const BulkGuestImport: React.FC<BulkGuestImportProps> = ({ 
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    parseFile(selectedFile);
  };
  
  const parseFile = async (file: File) => {
    setError(null);
    
    if (!file.name.endsWith('.csv')) {
      setError('Proszę wybrać plik CSV');
      return;
    }
    
    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError('Nie można przetworzyć pliku CSV. Sprawdź format danych.');
            return;
          }
          
          const processed = results.data.map((row: any, index: number) => {
            const errors: string[] = [];
            
            if (!row.firstName && !row['Imię'] && !row['imie'] && !row['first_name']) {
              errors.push('Brak imienia');
            }
            if (!row.lastName && !row['Nazwisko'] && !row['nazwisko'] && !row['last_name']) {
              errors.push('Brak nazwiska');
            }
            if (!row.email && !row['Email'] && !row['email']) {
              errors.push('Brak adresu email');
            } else if (row.email && !isValidEmail(row.email || row['Email'] || row['email'])) {
              errors.push('Niepoprawny format adresu email');
            }
            
            const firstName = row.firstName || row['Imię'] || row['imie'] || row['first_name'] || '';
            const lastName = row.lastName || row['Nazwisko'] || row['nazwisko'] || row['last_name'] || '';
            const email = row.email || row['Email'] || row['email'] || '';
            const company = row.company || row['Firma'] || row['firma'] || row['company'] || '';
            const phone = row.phone || row['Telefon'] || row['telefon'] || row['phone'] || '';
            
            let zone: GuestZone = 'general';
            if (row.zone === 'vip' || row['Strefa'] === 'vip' || row['strefa'] === 'vip') {
              zone = 'vip';
            } else if (row.zone === 'press' || row['Strefa'] === 'press' || row['strefa'] === 'press') {
              zone = 'press';
            } else if (row.zone === 'staff' || row['Strefa'] === 'staff' || row['strefa'] === 'staff') {
              zone = 'staff';
            }
            
            return {
              firstName,
              lastName,
              email,
              company,
              phone,
              zone,
              valid: errors.length === 0,
              errors
            };
          });
          
          setProcessedGuests(processed);
        }
      });
    } catch (err) {
      console.error('Error parsing CSV file:', err);
      setError('Wystąpił błąd podczas przetwarzania pliku');
    }
  };
  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const handleImport = async () => {
    try {
      const validGuests = processedGuests
        .filter(guest => guest.valid)
        .map(guest => ({
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          company: guest.company,
          phone: guest.phone,
          zone: guest.zone || defaultZone,
          status: 'invited' as GuestStatus, // Explicitly cast to GuestStatus
          eventId
        }));
      
      if (validGuests.length === 0) {
        setError('Brak prawidłowych gości do zaimportowania');
        return;
      }
      
      await onImport(validGuests);
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
  };
  
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Importuj gości</DialogTitle>
          <DialogDescription>
            Importuj listę gości z pliku CSV. Plik powinien zawierać kolumny: firstName, lastName, email, company (opcjonalnie), phone (opcjonalnie), zone (opcjonalnie).
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
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
              <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm text-center text-muted-foreground mb-2">
                Przeciągnij i upuść plik CSV tutaj lub kliknij, aby wybrać
              </p>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
              />
              <Button asChild>
                <label htmlFor="file-upload">Wybierz plik CSV</label>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {processedGuests.length} gości, {processedGuests.filter(g => g.valid).length} prawidłowych
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Usuń plik</span>
                </Button>
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Domyślna strefa dostępu</label>
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
                <p className="text-xs text-muted-foreground">
                  Ta strefa zostanie przypisana do wszystkich gości, którzy nie mają określonej strefy w pliku CSV
                </p>
              </div>
              
              <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Imię</TableHead>
                      <TableHead>Nazwisko</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Firma</TableHead>
                      <TableHead>Strefa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedGuests.map((guest, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {guest.valid ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>{guest.firstName || <span className="text-red-500">Brak</span>}</TableCell>
                        <TableCell>{guest.lastName || <span className="text-red-500">Brak</span>}</TableCell>
                        <TableCell>{guest.email || <span className="text-red-500">Brak</span>}</TableCell>
                        <TableCell>{guest.company || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {guest.zone === 'vip' ? 'VIP' : 
                             guest.zone === 'press' ? 'Press' : 
                             guest.zone === 'staff' ? 'Staff' : 'Ogólna'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {processedGuests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Brak danych do wyświetlenia
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Anuluj
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || processedGuests.filter(g => g.valid).length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Importowanie...' : 'Importuj'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkGuestImport;
