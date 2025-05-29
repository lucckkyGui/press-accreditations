
import React from 'react';
import { GuestsFilters, GuestsBulkActions } from "./";
import { GuestsTable } from "@/components/guests/GuestsTable";

interface GuestsListTabProps {
  guests: any[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  statusFilter: any;
  zoneFilter: any;
  selectedGuests: any[];
  isLoading: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (status: any) => void;
  setZoneFilter: (zone: any) => void;
  setSelectedGuests: (guests: any[]) => void;
  handleEditGuest: (guest: any) => void;
  handleDeleteGuest: (id: string) => void;
  handleBulkEmail: () => void;
  handleBulkStatusUpdate: (status: any) => void;
  handleBulkZoneUpdate: (zone: any) => void;
  handleBulkDeleteGuests: () => void;
}

const GuestsListTab: React.FC<GuestsListTabProps> = ({
  guests,
  total,
  page,
  pageSize,
  search,
  statusFilter,
  zoneFilter,
  selectedGuests,
  isLoading,
  setPage,
  setPageSize,
  setSearch,
  setStatusFilter,
  setZoneFilter,
  setSelectedGuests,
  handleEditGuest,
  handleDeleteGuest,
  handleBulkEmail,
  handleBulkStatusUpdate,
  handleBulkZoneUpdate,
  handleBulkDeleteGuests
}) => {
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleStatusFilterChange = (status: typeof statusFilter) => {
    setStatusFilter(status);
    setPage(0);
  };

  const handleZoneFilterChange = (zone: typeof zoneFilter) => {
    setZoneFilter(zone);
    setPage(0);
  };

  return (
    <div className="space-y-4">
      <GuestsFilters
        search={search}
        statusFilter={statusFilter}
        zoneFilter={zoneFilter}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onZoneFilterChange={handleZoneFilterChange}
      />

      <GuestsBulkActions
        selectedGuests={selectedGuests}
        onBulkEmail={handleBulkEmail}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkZoneUpdate={handleBulkZoneUpdate}
        onBulkDelete={handleBulkDeleteGuests}
      />

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
    </div>
  );
};

export default GuestsListTab;
