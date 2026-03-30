
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filters = useGuestsFilters();
  const dialogs = useGuestsDialogs();
  const selection = useGuestsSelection();

  // Reset and fetch first page when filters or event change
  const fetchFirstPage = useCallback(async () => {
    if (!selectedEvent) return;

    try {
      const params: GuestsQueryParams = {
        page: 0,
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
        setPage(0);
        setHasMore(result.data.length >= PAGE_SIZE);
      } else if (result.error) {
        toast.error(result.error.message);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Wystąpił błąd podczas pobierania gości');
    }
  }, [filters.search, filters.statusFilter, filters.ticketTypeFilter, filters.zoneFilter, selectedEvent]);

  const actions = useGuestsActions(fetchFirstPage);

  useEffect(() => {
    if (selectedEvent) {
      fetchFirstPage();
    }
  }, [fetchFirstPage, selectedEvent]);

  // Load next page (called by infinite scroll sentinel)
  const loadMore = useCallback(async () => {
    if (!selectedEvent || isLoadingMore || !hasMore) return;

    const nextPage = page + 1;
    setIsLoadingMore(true);

    try {
      const params: GuestsQueryParams = {
        page: nextPage,
        pageSize: PAGE_SIZE,
        search: filters.search,
        status: filters.statusFilter,
        ticketType: filters.ticketTypeFilter,
        zone: filters.zoneFilter as any,
        eventId: selectedEvent.id
      };

      const result = await guestService.getGuests(params);
      if (result.data) {
        setGuests(prev => [...prev, ...result.data!]);
        setTotal(result.pagination?.total || 0);
        setPage(nextPage);
        setHasMore(result.data.length >= PAGE_SIZE);
      }
    } catch (error) {
      console.error('Error loading more guests:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [selectedEvent, isLoadingMore, hasMore, page, filters.search, filters.statusFilter, filters.ticketTypeFilter, filters.zoneFilter]);

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
    fetchFirstPage();
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

  const handleBulkStatusUpdate = async (status: any) => {
    await actions.handleBulkStatusUpdate(selection.selectedGuests, status);
    selection.clearSelection();
  };

  const handleBulkTicketTypeUpdate = async (ticketType: any) => {
    await actions.handleBulkTicketTypeUpdate(selection.selectedGuests, ticketType);
    selection.clearSelection();
  };

  return {
    // State
    guests,
    total,
    hasMore,
    isLoadingMore,
    selectedEvent,
    
    // Filters
    ...filters,
    
    // Dialogs
    ...dialogs,
    
    // Selection
    ...selection,
    
    // Loading
    isLoading: actions.isLoading,
    
    // Setters
    setSelectedEvent,
    
    // Handlers
    loadMore,
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
