
import { useState } from 'react';
import { Guest, GuestZone, GuestStatus } from '@/types';
import Papa from 'papaparse';

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

export const useGuestImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processedGuests, setProcessedGuests] = useState<ProcessedGuest[]>([]);
  const [defaultZone, setDefaultZone] = useState<GuestZone>('general');
  const [error, setError] = useState<string | null>(null);
  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
          
          const processed = results.data.map((row: any) => {
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

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const prepareGuestsForImport = (eventId: string): Array<Partial<Guest> & { eventId: string }> => {
    return processedGuests
      .filter(guest => guest.valid)
      .map(guest => ({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        company: guest.company,
        phone: guest.phone,
        zone: guest.zone || defaultZone,
        status: 'invited' as GuestStatus,
        eventId
      }));
  };

  const resetForm = () => {
    setFile(null);
    setProcessedGuests([]);
    setError(null);
  };

  return {
    file,
    processedGuests,
    defaultZone,
    error,
    setDefaultZone,
    handleFileChange,
    prepareGuestsForImport,
    resetForm
  };
};
