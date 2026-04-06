
import { useState, useEffect, useCallback } from 'react';
import { Guest, Event } from "@/types";
import { GuestsQueryParams } from "@/types/guest/guest";
import { guestService } from "@/services/guestService";
import { toast } from "sonner";
import { useGuestsFilters } from "@/hooks/guests/useGuestsFilters";
import { useGuestsDialogs } from "@/hooks/guests/useGuestsDialogs";
import { useGuestsActions } from "@/hooks/guests/useGuestsActions";
import { useGuestsSelection } from "@/hooks/guests/useGuestsSelection";

const PAGE_SIZE = 50;

export const useGuestsPage = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filters = useGuestsFilters();
  const dialogs = useGuestsDialogs();
  const selection = useGuestsSelection();

  const fetchGuests = useCallback(async (targetPage?: number) => {
    if (!selectedEvent) return;

    const p = targetPage ?? page;

    try {
      const params: GuestsQueryParams = {
        page: p,
        pageSize: PAGE_SIZE,
        search: filters.search,
        status: filters.statusFilter,
        ticketType: filters.ticketTypeFilter,
        zone: filters.zoneFilter as any,
        eventId: selectedEvent.id
      };

      const result = await guestService.getGuests(params);
      if (result.data) {
        setGuests(result.data);
        setTotal(result.pagination?.total || result.data.length);
      } else if (result.error) {
        toast.error(result.error.message);
      }
    } catch (error) {
      toast.error('Wystąpił błąd podczas pobierania gości');
    }
  }, [page, filters.search, filters.statusFilter, filters.ticketTypeFilter, filters.zoneFilter, selectedEvent]);

  const actions = useGuestsActions(fetchGuests);

  useEffect(() => {
    if (selectedEvent) {
      fetchGuests();
    }
  }, [fetchGuests, selectedEvent]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [filters.search, filters.statusFilter, filters.ticketTypeFilter, filters.zoneFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleCreateGuest = () => {
    dialogs.openFormDialog();
  };

  const handleEditGuest = (guest: Guest) => {
    dialogs.openFormDialog(guest);
  };

  const handleBulkEmail = () => {
    if (selection.selectedGuests.length === 0) {
      toast.error('Nie wybrano żadnych gości do wysłania wiadomości email');
      return;
    }
    dialogs.openEmailDialog();
  };

  const handleEmailSent = () => {
    dialogs.closeEmailDialog();
    selection.clearSelection();
    fetchGuests();
  };

  const handleSaveGuest = async (guest: Partial<Guest> & { eventId: string }) => {
    await actions.handleSaveGuest(guest);
    dialogs.closeFormDialog();
  };

  const handleBulkImport = async (guests: Array<Partial<Guest> & { eventId: string }>) => {
    await actions.handleBulkImport(guests);
    dialogs.closeImportDialog();
  };

  const handleBulkDeleteGuests = async () => {
    await actions.handleBulkDeleteGuests(selection.selectedGuests);
    selection.clearSelection();
  };

  const handleBulkStatusUpdate = async (status: Error) => {
    await actions.handleBulkStatusUpdate(selection.selectedGuests, status);
    selection.clearSelection();
  };

  const handleBulkTicketTypeUpdate = async (ticketType: Error) => {
    await actions.handleBulkTicketTypeUpdate(selection.selectedGuests, ticketType);
    selection.clearSelection();
  };

  return {
    guests,
    total,
    page,
    pageSize: PAGE_SIZE,
    selectedEvent,

    ...filters,
    ...dialogs,
    ...selection,

    isLoading: actions.isLoading,

    setSelectedEvent,
    handlePageChange,
    handleCreateGuest,
    handleEditGuest,
    handleDeleteGuest: actions.handleDeleteGuest,
    handleSaveGuest,
    handleBulkDeleteGuests,
    handleBulkStatusUpdate,
    handleBulkTicketTypeUpdate,
    handleSendInvitations: actions.handleSendInvitations,
    handleBulkEmail,
    handleBulkImport,
    handleEmailSent
  };
};
