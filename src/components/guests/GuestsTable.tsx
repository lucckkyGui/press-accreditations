
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Guest } from "@/types";
import { Card } from "@/components/ui/card";

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
    setSelectedGuests(checked ? guests : []);
  };

  const handleSelectGuest = (guest: Guest, checked: boolean) => {
    if (checked) {
      setSelectedGuests(prev => [...prev, guest]);
    } else {
      setSelectedGuests(prev => prev.filter(g => g.id !== guest.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      invited: { variant: "outline", className: "border-primary/30 text-primary" },
      confirmed: { variant: "default", className: "bg-success text-success-foreground" },
      declined: { variant: "destructive", className: "" },
      "checked-in": { variant: "secondary", className: "bg-secondary/15 text-secondary border-0" }
    };
    const labels: Record<string, string> = {
      invited: "Zaproszony",
      confirmed: "Potwierdzony",
      declined: "Odrzucony",
      "checked-in": "Obecny"
    };
    const c = config[status] || { variant: "outline" as const, className: "" };
    return <Badge variant={c.variant} className={`rounded-lg text-xs ${c.className}`}>{labels[status] || status}</Badge>;
  };

  const getZoneBadge = (zone: string) => {
    const config: Record<string, string> = {
      vip: "bg-primary/15 text-primary border-0",
      press: "bg-info/15 text-info border-0",
      staff: "bg-success/15 text-success border-0",
      general: "bg-muted text-muted-foreground border-0"
    };
    const labels: Record<string, string> = {
      vip: "VIP", press: "Press", staff: "Staff", general: "Ogólna"
    };
    return <Badge className={`rounded-lg text-xs ${config[zone] || "bg-muted text-muted-foreground"}`}>{labels[zone] || zone}</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl border-border">
        <div className="space-y-3 p-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedGuests.length === guests.length && guests.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="font-semibold text-foreground">Imię i nazwisko</TableHead>
            <TableHead className="font-semibold text-foreground">Email</TableHead>
            <TableHead className="font-semibold text-foreground">PESEL</TableHead>
            <TableHead className="font-semibold text-foreground">Firma</TableHead>
            <TableHead className="font-semibold text-foreground">Telefon</TableHead>
            <TableHead className="font-semibold text-foreground">Strefa</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                Brak gości do wyświetlenia
              </TableCell>
            </TableRow>
          ) : (
            guests.map((guest) => (
              <TableRow key={guest.id} className="group hover:bg-primary/5 transition-colors">
                <TableCell>
                  <Checkbox
                    checked={selectedGuests.some(g => g.id === guest.id)}
                    onCheckedChange={(checked) => handleSelectGuest(guest, !!checked)}
                  />
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {guest.firstName} {guest.lastName}
                </TableCell>
                <TableCell className="text-muted-foreground">{guest.email}</TableCell>
                <TableCell className="text-muted-foreground">{guest.pesel || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{guest.company || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{guest.phone || '—'}</TableCell>
                <TableCell>{getZoneBadge(guest.zone)}</TableCell>
                <TableCell>{getStatusBadge(guest.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(guest)} className="rounded-lg h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(guest.id)} className="rounded-lg h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-muted/20">
        <span className="text-sm text-muted-foreground">
          Pokazano {guests.length} z {total}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="rounded-lg h-8 gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Wstecz
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {page + 1} / {Math.max(1, Math.ceil(total / pageSize))}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={(page + 1) * pageSize >= total}
            className="rounded-lg h-8 gap-1"
          >
            Dalej
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
