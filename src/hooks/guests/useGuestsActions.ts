
import { useState } from 'react';
import { Guest, GuestStatus, GuestZone } from "@/types";
import { guestService } from "@/services/guestService";
import { toast } from "sonner";
import { confirm } from "@/components/ui/confirm-dialog";

export const useGuestsActions = (refetchGuests: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveGuest = async (guest: Partial<Guest> & { eventId: string }) => {
    setIsLoading(true);
    try {
      let result;
      if (guest.id) {
        result = await guestService.updateGuest(guest.id, guest);
      } else {
        result = await guestService.createGuest(guest);
      }

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success(guest.id ? 'Gość został zaktualizowany' : 'Gość został dodany');
        refetchGuests();
      }
    } catch (error) {
      console.error('Error saving guest:', error);
      toast.error('Wystąpił błąd podczas zapisywania gościa');
    } finally {
      setIsLoading(false);
    }
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
        refetchGuests();
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast.error('Wystąpił błąd podczas usuwania gościa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDeleteGuests = async (selectedGuests: Guest[]) => {
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
        refetchGuests();
      }
    } catch (error) {
      console.error('Error deleting guests:', error);
      toast.error('Wystąpił błąd podczas usuwania gości');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (selectedGuests: Guest[], status: GuestStatus) => {
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
        refetchGuests();
      }
    } catch (error) {
      console.error('Error updating guests status:', error);
      toast.error('Wystąpił błąd podczas aktualizacji statusu gości');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkZoneUpdate = async (selectedGuests: Guest[], zone: GuestZone) => {
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
        refetchGuests();
      }
    } catch (error) {
      console.error('Error updating guests zone:', error);
      toast.error('Wystąpił błąd podczas aktualizacji strefy gości');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvitations = async (selectedGuests: Guest[]) => {
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
        refetchGuests();
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Wystąpił błąd podczas wysyłania zaproszeń');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkImport = async (guests: Array<Partial<Guest> & { eventId: string }>) => {
    setIsLoading(true);
    try {
      const result = await guestService.createGuests(guests);
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success(`Zaimportowano ${guests.length} gości`);
        refetchGuests();
      }
    } catch (error) {
      console.error('Error importing guests:', error);
      toast.error('Wystąpił błąd podczas importowania gości');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSaveGuest,
    handleDeleteGuest,
    handleBulkDeleteGuests,
    handleBulkStatusUpdate,
    handleBulkZoneUpdate,
    handleSendInvitations,
    handleBulkImport
  };
};
