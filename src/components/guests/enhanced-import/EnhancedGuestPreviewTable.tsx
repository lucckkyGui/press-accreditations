
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, X } from 'lucide-react';
import { GuestZone } from '@/types';

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

interface EnhancedGuestPreviewTableProps {
  guests: ProcessedGuest[];
  selectedCount: number;
  validCount: number;
  onSelectAll: (checked: boolean) => void;
  onSelectGuest: (index: number, checked: boolean) => void;
}

const EnhancedGuestPreviewTable: React.FC<EnhancedGuestPreviewTableProps> = ({
  guests,
  selectedCount,
  validCount,
  onSelectAll,
  onSelectGuest
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="max-h-[400px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={selectedCount > 0 && selectedCount === validCount}
                  onCheckedChange={onSelectAll}
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
            {guests.map((guest, index) => (
              <TableRow key={index} className={!guest.valid ? 'bg-red-50' : ''}>
                <TableCell>
                  <Checkbox 
                    checked={guest.selected}
                    onCheckedChange={(checked) => onSelectGuest(index, !!checked)}
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
            {guests.length === 0 && (
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
  );
};

export default EnhancedGuestPreviewTable;
