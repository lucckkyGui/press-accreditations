import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertTriangle } from 'lucide-react';
import { GuestTicketType, TICKET_TYPE_LABELS } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  const invalidCount = guests.filter(g => !g.valid).length;
  const validCount = guests.filter(g => g.valid).length;

  return (
    <div className="space-y-2">
      {/* Summary bar */}
      {guests.length > 0 && (
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-600">
            <Check className="h-3.5 w-3.5" /> {validCount} poprawnych
          </span>
          {invalidCount > 0 && (
            <span className="flex items-center gap-1 text-red-600">
              <X className="h-3.5 w-3.5" /> {invalidCount} z błędami
            </span>
          )}
          <span className="text-muted-foreground">Razem: {guests.length}</span>
        </div>
      )}

      <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead className="w-8"></TableHead>
              <TableHead>Imię</TableHead>
              <TableHead>Nazwisko</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Firma</TableHead>
              <TableHead>Typ biletu</TableHead>
              <TableHead className="w-[120px]">Błędy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((guest, index) => (
              <TableRow key={index} className={!guest.valid ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>
                <TableCell>
                  {guest.valid ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <ul className="text-xs space-y-0.5">
                          {guest.errors.map((err, i) => (
                            <li key={i}>• {err}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  {guest.firstName || <span className="text-red-500 text-xs">Brak</span>}
                </TableCell>
                <TableCell>
                  {guest.lastName || <span className="text-red-500 text-xs">Brak</span>}
                </TableCell>
                <TableCell>
                  {guest.email ? (
                    <span className={!guest.email.includes('@') ? 'text-red-500' : ''}>
                      {guest.email}
                    </span>
                  ) : (
                    <span className="text-red-500 text-xs">Brak</span>
                  )}
                </TableCell>
                <TableCell>{guest.company || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {TICKET_TYPE_LABELS[guest.ticketType] || guest.ticketType}
                  </Badge>
                </TableCell>
                <TableCell>
                  {guest.errors.length > 0 && (
                    <span className="text-xs text-red-600">
                      {guest.errors.length} {guest.errors.length === 1 ? 'błąd' : 'błędów'}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {guests.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Brak danych do wyświetlenia
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GuestPreviewTable;
