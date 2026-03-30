
import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Guest, GuestTicketType, TICKET_TYPE_LABELS } from "@/types";
import { Card } from "@/components/ui/card";

interface GuestsTableProps {
  guests: Guest[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (id: string) => void;
  selectedGuests: Guest[];
  setSelectedGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
  isLoading: boolean;
}

const ticketTypeLabels = TICKET_TYPE_LABELS;

const ticketTypeColors: Partial<Record<GuestTicketType, string>> = {
  uczestnik: 'bg-muted text-muted-foreground border-0',
  media: 'bg-info/15 text-info border-0',
  crew: 'bg-success/15 text-success border-0',
  promotor: 'bg-primary/15 text-primary border-0',
  ochrona: 'bg-warning/15 text-warning border-0',
  vendor: 'bg-accent/15 text-accent-foreground border-0',
  medyk: 'bg-destructive/15 text-destructive border-0',
  vip: 'bg-primary/20 text-primary border-0',
  other: 'bg-muted text-muted-foreground border-0',
};

export const GuestsTable = ({
  guests, total, page, pageSize, onPageChange,
  onEdit, onDelete, selectedGuests, setSelectedGuests, isLoading
}: GuestsTableProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Generate visible page numbers with ellipsis
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(0);

      if (page > 2) pages.push('ellipsis');

      const start = Math.max(1, page - 1);
      const end = Math.min(totalPages - 2, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (page < totalPages - 3) pages.push('ellipsis');

      // Always show last page
      pages.push(totalPages - 1);
    }

    return pages;
  }, [page, totalPages]);

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
      invited: "Zaproszony", confirmed: "Potwierdzony",
      declined: "Odrzucony", "checked-in": "Obecny"
    };
    const c = config[status] || { variant: "outline" as const, className: "" };
    return <Badge variant={c.variant} className={`rounded-lg text-xs ${c.className}`}>{labels[status] || status}</Badge>;
  };

  const getTicketTypeBadge = (ticketType: GuestTicketType) => {
    return (
      <Badge className={`rounded-lg text-xs ${ticketTypeColors[ticketType] || "bg-muted text-muted-foreground"}`}>
        {ticketTypeLabels[ticketType] || ticketType}
      </Badge>
    );
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

  const rangeStart = page * pageSize + 1;
  const rangeEnd = Math.min((page + 1) * pageSize, total);

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
            <TableHead className="font-semibold text-foreground">Firma</TableHead>
            <TableHead className="font-semibold text-foreground">Telefon</TableHead>
            <TableHead className="font-semibold text-foreground">Typ biletu</TableHead>
            <TableHead className="font-semibold text-foreground">Strefy</TableHead>
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
                <TableCell className="text-muted-foreground">{guest.company || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{guest.phone || '—'}</TableCell>
                <TableCell>{getTicketTypeBadge(guest.ticketType)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {guest.zones.length > 0 ? guest.zones.map(z => (
                      <Badge key={z} variant="outline" className="rounded-lg text-xs">{z}</Badge>
                    )) : <span className="text-muted-foreground text-xs">—</span>}
                  </div>
                </TableCell>
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

      {/* Pagination footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-border bg-muted/20">
        <span className="text-sm text-muted-foreground">
          {total > 0 ? `${rangeStart}–${rangeEnd} z ${total}` : '0 wyników'}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* First page */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(0)}
              disabled={page === 0}
              className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {pageNumbers.map((p, i) =>
              p === 'ellipsis' ? (
                <span key={`e${i}`} className="px-1 text-muted-foreground text-sm select-none">…</span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange(p)}
                  className={`rounded-lg h-8 w-8 p-0 text-sm font-medium ${
                    p === page
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
                  }`}
                >
                  {p + 1}
                </Button>
              )
            )}

            {/* Next */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last page */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
