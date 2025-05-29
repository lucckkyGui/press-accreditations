
import { useState } from 'react';
import { GuestStatus, GuestZone } from "@/types";

export const useGuestsFilters = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<GuestStatus | 'all'>('all');
  const [zoneFilter, setZoneFilter] = useState<GuestZone | 'all'>('all');

  const resetFilters = () => {
    setPage(0);
    setSearch('');
    setStatusFilter('all');
    setZoneFilter('all');
  };

  return {
    page,
    pageSize,
    search,
    statusFilter,
    zoneFilter,
    setPage,
    setPageSize,
    setSearch,
    setStatusFilter,
    setZoneFilter,
    resetFilters
  };
};
