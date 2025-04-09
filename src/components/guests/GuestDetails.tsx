
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Guest } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Mail, Phone, Building, QrCode, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface GuestDetailsProps {
  guest: Guest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GuestDetails = ({ guest, open, onOpenChange }: GuestDetailsProps) => {
  if (!guest) return null;

  const zoneLabels = {
    general: { label: 'Ogólna', color: 'bg-gray-500' },
    vip: { label: 'VIP', color: 'bg-purple-500' },
    press: { label: 'Press', color: 'bg-blue-500' },
    staff: { label: 'Staff', color: 'bg-green-500' }
  };

  const statusLabels = {
    invited: { label: 'Zaproszony', color: 'bg-yellow-500' },
    confirmed: { label: 'Potwierdzony', color: 'bg-green-500' },
    declined: { label: 'Odrzucony', color: 'bg-red-500' },
    'checked-in': { label: 'Obecny', color: 'bg-blue-500' }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Brak danych";
    return format(date, "dd.MM.yyyy HH:mm");
  };

  const getZoneInfo = (zone: string) => {
    return zoneLabels[zone as keyof typeof zoneLabels] || { label: zone, color: 'bg-gray-500' };
  };

  const getStatusInfo = (status: string) => {
    return statusLabels[status as keyof typeof statusLabels] || { label: status, color: 'bg-gray-500' };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {guest.firstName} {guest.lastName}
          </DialogTitle>
          <DialogDescription>
            Szczegółowe informacje o gościu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Badge className={`${getZoneInfo(guest.zone).color} hover:${getZoneInfo(guest.zone).color}`}>
                {getZoneInfo(guest.zone).label}
              </Badge>
              <Badge className={`ml-2 ${getStatusInfo(guest.status).color} hover:${getStatusInfo(guest.status).color}`}>
                {getStatusInfo(guest.status).label}
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="flex items-center">
              <QrCode className="mr-2 h-4 w-4" />
              Pokaż kod QR
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{guest.email}</span>
            </div>
            
            {guest.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{guest.phone}</span>
              </div>
            )}
            
            {guest.company && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{guest.company}</span>
              </div>
            )}
          </div>

          <div className="border-t pt-3 mt-3">
            <h4 className="text-sm font-medium mb-2">Historia</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Zaproszenie wysłane:</span>
                <span>{formatDate(guest.invitationSentAt)}</span>
              </div>
              
              {guest.invitationOpenedAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Zaproszenie otwarte:</span>
                  <span>{formatDate(guest.invitationOpenedAt)}</span>
                </div>
              )}
              
              {guest.checkedInAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Sprawdzony:</span>
                  <span>{formatDate(guest.checkedInAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-3 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Zamknij</Button>
            <Button>Edytuj dane</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuestDetails;
