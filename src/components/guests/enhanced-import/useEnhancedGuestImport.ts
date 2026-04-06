
import { useState } from 'react';
import { Guest, GuestZone, GuestStatus } from '@/types';
import Papa from 'papaparse';

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

export const useEnhancedGuestImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processedGuests, setProcessedGuests] = useState<ProcessedGuest[]>([]);
  const [defaultZone, setDefaultZone] = useState<GuestZone>('general');
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

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
      setError('Wystąpił błąd podczas przetwarzania pliku');
      setIsProcessing(false);
    }
  };

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    parseFile(selectedFile);
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

  const prepareGuestsForImport = (eventId: string): Array<Partial<Guest> & { eventId: string }> => {
    return processedGuests
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
  };

  const resetForm = () => {
    setFile(null);
    setProcessedGuests([]);
    setError(null);
    setImportProgress(0);
    setIsProcessing(false);
  };

  const selectedCount = processedGuests.filter(g => g.selected).length;
  const validCount = processedGuests.filter(g => g.valid).length;

  return {
    file,
    processedGuests,
    defaultZone,
    error,
    importProgress,
    isProcessing,
    selectedCount,
    validCount,
    setDefaultZone,
    setImportProgress,
    handleFileChange,
    handleSelectAll,
    handleSelectGuest,
    prepareGuestsForImport,
    resetForm
  };
};
