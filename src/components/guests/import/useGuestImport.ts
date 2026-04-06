
import { useState } from 'react';
import { Guest, GuestStatus, GuestTicketType, TICKET_TYPE_LABELS } from '@/types';
import Papa from 'papaparse';

type ProcessedGuest = {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  ticketType: GuestTicketType;
  valid: boolean;
  errors: string[];
};

export const useGuestImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processedGuests, setProcessedGuests] = useState<ProcessedGuest[]>([]);
  const [defaultTicketType, setDefaultTicketType] = useState<GuestTicketType>('uczestnik');
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
            
            const rawType = row.ticketType || row.ticket_type || row['Typ biletu'] || row['typ_biletu'] || '';
            const ticketType: GuestTicketType = Object.keys(TICKET_TYPE_LABELS).includes(rawType) ? rawType as GuestTicketType : 'uczestnik';
            
            return {
              firstName,
              lastName,
              email,
              company,
              phone,
              ticketType,
              valid: errors.length === 0,
              errors
            };
          });
          
          setProcessedGuests(processed);
        }
      });
    } catch (err) {
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
        ticketType: guest.ticketType || defaultTicketType,
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
    defaultTicketType,
    error,
    setDefaultTicketType,
    handleFileChange,
    prepareGuestsForImport,
    resetForm
  };
};
