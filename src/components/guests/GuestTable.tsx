
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Guest } from "@/types";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, QrCode, Edit, Trash, Send, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GuestTableProps {
  guests: Guest[];
  onViewQR: (guest: Guest) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onResendInvite: (guest: Guest) => void;
  onViewDetails: (guest: Guest) => void;
}

const GuestTable = ({ 
  guests, 
  onViewQR, 
  onEdit, 
  onDelete, 
  onResendInvite,
  onViewDetails 
}: GuestTableProps) => {
  // Helper functions to render badges with appropriate colors
  const renderZoneBadge = (zone: string) => {
    const zoneColors = {
      general: "bg-gray-500",
      vip: "bg-purple-500",
      press: "bg-blue-500",
      staff: "bg-green-500",
    };

    const color = zoneColors[zone as keyof typeof zoneColors] || "bg-gray-500";
    const label = {
      general: "Ogólna",
      vip: "VIP",
      press: "Press",
      staff: "Staff",
    }[zone as keyof typeof zoneColors] || zone;

    return <Badge className={`${color}`}>{label}</Badge>;
  };

  const renderStatusBadge = (status: string) => {
    const statusColors = {
      invited: "bg-yellow-500",
      confirmed: "bg-green-500",
      declined: "bg-red-500",
      "checked-in": "bg-blue-500",
    };

    const color = statusColors[status as keyof typeof statusColors] || "bg-gray-500";
    const label = {
      invited: "Zaproszony",
      confirmed: "Potwierdzony",
      declined: "Odrzucony",
      "checked-in": "Obecny",
    }[status as keyof typeof statusColors] || status;

    return <Badge className={`${color}`}>{label}</Badge>;
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imię i nazwisko</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">Firma</TableHead>
            <TableHead className="hidden sm:table-cell">Strefa</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Brak gości do wyświetlenia
              </TableCell>
            </TableRow>
          ) : (
            guests.map((guest) => (
              <TableRow key={guest.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewDetails(guest)}>
                <TableCell>
                  <div className="font-medium">
                    {guest.firstName} {guest.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground md:hidden">
                    {guest.email}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{guest.email}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {guest.company || "-"}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {renderZoneBadge(guest.zone)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {renderStatusBadge(guest.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Otwórz menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>Akcje</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onViewDetails(guest)}>
                          <User className="mr-2 h-4 w-4" />
                          Szczegóły
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewQR(guest)}>
                          <QrCode className="mr-2 h-4 w-4" />
                          Pokaż QR
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(guest)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edytuj
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onResendInvite(guest)}>
                          <Send className="mr-2 h-4 w-4" />
                          Wyślij ponownie
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => onDelete(guest)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Usuń
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default GuestTable;
