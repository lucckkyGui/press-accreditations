import React, { useState, useEffect, useCallback } from 'react';
import { guestService } from "@/services/guestService";
import { Guest, GuestStatus, GuestZone, Event } from "@/types";
import { GuestsQueryParams } from "@/types/guest/guest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Mail, CheckCheck, UserPlus, Upload } from 'lucide-react';
import { toast } from "sonner";
import { confirm } from "@/components/ui/confirm-dialog"
import GuestForm from "@/components/guests/GuestForm";
import BulkEmailSender from "@/components/guests/BulkEmailSender";
import { GuestsTable } from "@/components/guests/GuestsTable";
import EnhancedBulkGuestImport from "@/components/guests/EnhancedBulkGuestImport";

interface GuestsProps {
  eventId: string;
  event?: Event;
}

const Guests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<GuestStatus | 'all'>('all');
  const [zoneFilter, setZoneFilter] = useState<GuestZone | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [selectedGuests, setSelectedGuests] = useState<Guest[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchGuests = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: GuestsQueryParams = {
        page,
        pageSize,
        search,
        status: statusFilter,
        zone: zoneFilter,
        eventId: selectedEvent?.id
      };

      const result = await guestService.getGuests(params);
      if (result.data) {
        setGuests(result.data);
        setTotal(result.pagination?.total || 0);
      } else if (result.error) {
        toast.error(result.error.message);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Wystąpił błąd podczas pobierania gości');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter, zoneFilter, selectedEvent]);

  useEffect(() => {
    if (selectedEvent) {
      fetchGuests();
    }
  }, [fetchGuests, selectedEvent]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (status: GuestStatus | 'all') => {
    setStatusFilter(status);
    setPage(0);
  };

  const handleZoneFilterChange = (zone: GuestZone | 'all') => {
    setZoneFilter(zone);
    setPage(0);
  };

  const handleCreateGuest = () => {
    setSelectedGuest(null);
    setShowFormDialog(true);
  };

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowFormDialog(true);
  };

  const handleDeleteGuest = async (id: string) => {
    const confirmed = await confirm({
      title: 'Usuń gościa',
      description: 'Czy na pewno chcesz usunąć tego gościa? Tej operacji nie można cofnąć.',
    });

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await guestService.deleteGuest(id);
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Gość został usunięty');
        fetchGuests();
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast.error('Wystąpił błąd podczas usuwania gościa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGuest = async (guest: Partial<Guest> & { eventId: string }) => {
    setIsLoading(true);
    try {
      let result;
      if (selectedGuest) {
        result = await guestService.updateGuest(selectedGuest.id, guest);
      } else {
        result = await guestService.createGuest(guest);
      }

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success(selectedGuest ? 'Gość został zaktualizowany' : 'Gość został dodany');
        setShowFormDialog(false);
        fetchGuests();
      }
    } catch (error) {
      console.error('Error saving guest:', error);
      toast.error('Wystąpił błąd podczas zapisywania gościa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDeleteGuests = async () => {
    if (selectedGuests.length === 0) {
      toast.error('Nie wybrano żadnych gości do usunięcia');
      return;
    }

    const confirmed = await confirm({
      title: 'Usuń gości',
      description: 'Czy na pewno chcesz usunąć wybranych gości? Tej operacji nie można cofnąć.',
    });

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    try {
      const ids = selectedGuests.map(guest => guest.id);
      const result = await guestService.deleteGuests(ids);
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Wybrani goście zostali usunięci');
        setSelectedGuests([]);
        fetchGuests();
      }
    } catch (error) {
      console.error('Error deleting guests:', error);
      toast.error('Wystąpił błąd podczas usuwania gości');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status: GuestStatus) => {
    if (selectedGuests.length === 0) {
      toast.error('Nie wybrano żadnych gości do aktualizacji');
      return;
    }

    setIsLoading(true);
    try {
      const ids = selectedGuests.map(guest => guest.id);
      const result = await guestService.updateGuestsStatus(ids, status);
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Status wybranych gości został zaktualizowany');
        setSelectedGuests([]);
        fetchGuests();
      }
    } catch (error) {
      console.error('Error updating guests status:', error);
      toast.error('Wystąpił błąd podczas aktualizacji statusu gości');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkZoneUpdate = async (zone: GuestZone) => {
    if (selectedGuests.length === 0) {
      toast.error('Nie wybrano żadnych gości do aktualizacji');
      return;
    }

    setIsLoading(true);
    try {
      const ids = selectedGuests.map(guest => guest.id);
      const result = await guestService.updateGuestsZone(ids, zone);
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Strefa wybranych gości została zaktualizowana');
        setSelectedGuests([]);
        fetchGuests();
      }
    } catch (error) {
      console.error('Error updating guests zone:', error);
      toast.error('Wystąpił błąd podczas aktualizacji strefy gości');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvitations = async () => {
    if (selectedGuests.length === 0) {
      toast.error('Nie wybrano żadnych gości do wysłania zaproszeń');
      return;
    }

    setIsLoading(true);
    try {
      const ids = selectedGuests.map(guest => guest.id);
      const result = await guestService.sendInvitations(ids);
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Zaproszenia zostały wysłane do wybranych gości');
        setSelectedGuests([]);
        fetchGuests();
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Wystąpił błąd podczas wysyłania zaproszeń');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkEmail = () => {
    if (selectedGuests.length === 0) {
      toast.error('Nie wybrano żadnych gości do wysłania wiadomości email');
      return;
    }
    setShowEmailDialog(true);
  };

  const handleBulkImport = async (guests: Array<Partial<Guest> & { eventId: string }>) => {
    setIsLoading(true);
    try {
      const result = await guestService.createGuests(guests);
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success(`Zaimportowano ${guests.length} gości`);
        setShowImportDialog(false);
        if (selectedEvent) {
          fetchGuests();
        }
      }
    } catch (error) {
      console.error('Error importing guests:', error);
      toast.error('Wystąpił błąd podczas importowania gości');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSent = () => {
    setShowEmailDialog(false);
    setSelectedGuests([]);
    fetchGuests();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Goście</h1>
        <div className="space-x-2">
          <Button onClick={() => setShowImportDialog(true)} disabled={!selectedEvent}>
            <Upload className="mr-2 h-4 w-4" />
            Importuj
          </Button>
          <Button onClick={handleCreateGuest} disabled={!selectedEvent}>
            <Plus className="mr-2 h-4 w-4" />
            Dodaj gościa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          type="text"
          placeholder="Szukaj gościa..."
          value={search}
          onChange={handleSearchChange}
        />

        <Select value={statusFilter} onValueChange={(value: GuestStatus | 'all') => handleStatusFilterChange(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Wszystkie statusy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            <SelectItem value="invited">Zaproszony</SelectItem>
            <SelectItem value="confirmed">Potwierdzony</SelectItem>
            <SelectItem value="declined">Odrzucony</SelectItem>
            <SelectItem value="checked-in">Obecny</SelectItem>
          </SelectContent>
        </Select>

        <Select value={zoneFilter} onValueChange={(value: GuestZone | 'all') => handleZoneFilterChange(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Wszystkie strefy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie strefy</SelectItem>
            <SelectItem value="general">Ogólna</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="press">Press</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={handleBulkEmail} disabled={selectedGuests.length === 0}>
          <Mail className="mr-2 h-4 w-4" />
          Wyślij email
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleBulkStatusUpdate('confirmed')} disabled={selectedGuests.length === 0}>
          <CheckCheck className="mr-2 h-4 w-4" />
          Potwierdź
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleBulkZoneUpdate('vip')} disabled={selectedGuests.length === 0}>
          <UserPlus className="mr-2 h-4 w-4" />
          Ustaw VIP
        </Button>
        <Button variant="destructive" size="sm" onClick={handleBulkDeleteGuests} disabled={selectedGuests.length === 0}>
          <Trash2 className="mr-2 h-4 w-4" />
          Usuń
        </Button>
      </div>

      <GuestsTable
        guests={guests}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleEditGuest}
        onDelete={handleDeleteGuest}
        selectedGuests={selectedGuests}
        setSelectedGuests={setSelectedGuests}
        isLoading={isLoading}
      />

      <GuestForm
        isOpen={showFormDialog}
        onOpenChange={setShowFormDialog}
        guest={selectedGuest}
        eventId={selectedEvent?.id || ''}
        onSubmit={handleSaveGuest}
        onCancel={() => setShowFormDialog(false)}
        isSubmitting={isLoading}
      />

      <EnhancedBulkGuestImport
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleBulkImport}
        eventId={selectedEvent?.id || ''}
        isSubmitting={isLoading}
      />

      <BulkEmailSender
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        selectedGuests={selectedGuests}
        eventId={selectedEvent?.id || ''}
        onEmailSent={handleEmailSent}
      />
    </div>
  );
};

export default Guests;
