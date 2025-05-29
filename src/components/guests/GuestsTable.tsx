
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from 'lucide-react';
import { Guest } from "@/types";

interface GuestsTableProps {
  guests: Guest[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (id: string) => void;
  selectedGuests: Guest[];
  setSelectedGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
  isLoading: boolean;
}

export const GuestsTable = ({
  guests,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  selectedGuests,
  setSelectedGuests,
  isLoading
}: GuestsTableProps) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGuests(guests);
    } else {
      setSelectedGuests([]);
    }
  };

  const handleSelectGuest = (guest: Guest, checked: boolean) => {
    if (checked) {
      setSelectedGuests(prev => [...prev, guest]);
    } else {
      setSelectedGuests(prev => prev.filter(g => g.id !== guest.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      invited: "outline",
      confirmed: "default",
      declined: "destructive",
      "checked-in": "secondary"
    };
    
    const labels: Record<string, string> = {
      invited: "Zaproszony",
      confirmed: "Potwierdzony", 
      declined: "Odrzucony",
      "checked-in": "Obecny"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getZoneBadge = (zone: string) => {
    const colors: Record<string, string> = {
      vip: "bg-purple-100 text-purple-800",
      press: "bg-blue-100 text-blue-800",
      staff: "bg-green-100 text-green-800",
      general: "bg-gray-100 text-gray-800"
    };

    const labels: Record<string, string> = {
      vip: "VIP",
      press: "Press",
      staff: "Staff",
      general: "Ogólna"
    };

    return (
      <Badge className={colors[zone] || "bg-gray-100 text-gray-800"}>
        {labels[zone] || zone}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="text-center py-4">Ładowanie...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedGuests.length === guests.length && guests.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Imię i nazwisko</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>PESEL</TableHead>
            <TableHead>Firma</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Strefa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                Brak gości do wyświetlenia
              </TableCell>
            </TableRow>
          ) : (
            guests.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedGuests.some(g => g.id === guest.id)}
                    onCheckedChange={(checked) => handleSelectGuest(guest, !!checked)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {guest.firstName} {guest.lastName}
                </TableCell>
                <TableCell>{guest.email}</TableCell>
                <TableCell>{guest.pesel || '-'}</TableCell>
                <TableCell>{guest.company || '-'}</TableCell>
                <TableCell>{guest.phone || '-'}</TableCell>
                <TableCell>{getZoneBadge(guest.zone)}</TableCell>
                <TableCell>{getStatusBadge(guest.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(guest)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(guest.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Pokazano {guests.length} z {total} gości
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Poprzednia
          </Button>
          <span className="text-sm">
            Strona {page + 1} z {Math.ceil(total / pageSize)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={(page + 1) * pageSize >= total}
          >
            Następna
          </Button>
        </div>
      </div>
    </div>
  );
};
