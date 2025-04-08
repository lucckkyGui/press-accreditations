
import React from "react";
import { Guest, GuestStatus, GuestZone } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, QrCode } from "lucide-react";

interface GuestTableProps {
  guests: Guest[];
  onViewQR: (guest: Guest) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onResendInvite: (guest: Guest) => void;
}

const GuestTable = ({
  guests,
  onViewQR,
  onEdit,
  onDelete,
  onResendInvite,
}: GuestTableProps) => {
  const getStatusBadge = (status: GuestStatus) => {
    switch (status) {
      case "invited":
        return <Badge variant="outline">Zaproszony</Badge>;
      case "confirmed":
        return <Badge variant="secondary">Potwierdzony</Badge>;
      case "declined":
        return <Badge variant="destructive">Odrzucony</Badge>;
      case "checked-in":
        return <Badge variant="default">Obecny</Badge>;
      default:
        return null;
    }
  };

  const getZoneBadge = (zone: GuestZone) => {
    switch (zone) {
      case "vip":
        return <Badge className="bg-amber-500">VIP</Badge>;
      case "press":
        return <Badge className="bg-blue-500">Press</Badge>;
      case "staff":
        return <Badge className="bg-purple-500">Staff</Badge>;
      case "general":
      default:
        return <Badge className="bg-green-500">General</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imię i Nazwisko</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Firma</TableHead>
            <TableHead>Strefa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">QR</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest) => (
            <TableRow key={guest.id}>
              <TableCell>
                {guest.firstName} {guest.lastName}
              </TableCell>
              <TableCell>{guest.email}</TableCell>
              <TableCell>{guest.company || "-"}</TableCell>
              <TableCell>{getZoneBadge(guest.zone)}</TableCell>
              <TableCell>{getStatusBadge(guest.status)}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onViewQR(guest)}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(guest)}>
                      Edytuj
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onResendInvite(guest)}>
                      Wyślij zaproszenie ponownie
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => onDelete(guest)}
                    >
                      Usuń
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GuestTable;
