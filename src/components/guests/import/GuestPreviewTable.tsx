
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X } from 'lucide-react';
import { GuestTicketType, TICKET_TYPE_LABELS } from '@/types';

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

interface GuestPreviewTableProps {
  guests: ProcessedGuest[];
}

const GuestPreviewTable: React.FC<GuestPreviewTableProps> = ({ guests }) => {
  return (
    <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Imię</TableHead>
            <TableHead>Nazwisko</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Firma</TableHead>
            <TableHead>Typ biletu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest, index) => (
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
                  {TICKET_TYPE_LABELS[guest.ticketType] || guest.ticketType}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {guests.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Brak danych do wyświetlenia
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default GuestPreviewTable;
