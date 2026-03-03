
import { useState } from 'react';
import { GuestStatus, GuestTicketType } from "@/types";

export const useGuestsFilters = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<GuestStatus | 'all'>('all');
  const [ticketTypeFilter, setTicketTypeFilter] = useState<GuestTicketType | 'all'>('all');

  const resetFilters = () => {
    setPage(0);
    setSearch('');
    setStatusFilter('all');
    setTicketTypeFilter('all');
  };

  return {
    page,
    pageSize,
    search,
    statusFilter,
    ticketTypeFilter,
    setPage,
    setPageSize,
    setSearch,
    setStatusFilter,
    setTicketTypeFilter,
    resetFilters
  };
};
