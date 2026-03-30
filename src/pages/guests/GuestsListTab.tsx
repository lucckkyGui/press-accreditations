
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
  ticketTypeFilter: any;
  zoneFilter: string;
  selectedGuests: any[];
  isLoading: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (status: any) => void;
  setTicketTypeFilter: (ticketType: any) => void;
  setZoneFilter: (zone: string) => void;
  setSelectedGuests: (guests: any[]) => void;
  handleEditGuest: (guest: any) => void;
  handleDeleteGuest: (id: string) => void;
  handleBulkEmail: () => void;
  handleBulkStatusUpdate: (status: any) => void;
  handleBulkTicketTypeUpdate: (ticketType: any) => void;
  handleBulkDeleteGuests: () => void;
}

const GuestsListTab: React.FC<GuestsListTabProps> = ({
  guests, total, page, pageSize, search, statusFilter, ticketTypeFilter, zoneFilter,
  selectedGuests, isLoading,
  setPage, setPageSize, setSearch, setStatusFilter, setTicketTypeFilter, setZoneFilter,
  setSelectedGuests, handleEditGuest, handleDeleteGuest,
  handleBulkEmail, handleBulkStatusUpdate, handleBulkTicketTypeUpdate, handleBulkDeleteGuests
}) => {
  return (
    <div className="space-y-4">
      <GuestsFilters
        search={search}
        statusFilter={statusFilter}
        ticketTypeFilter={ticketTypeFilter}
        zoneFilter={zoneFilter}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        onStatusFilterChange={(s) => { setStatusFilter(s); setPage(0); }}
        onTicketTypeFilterChange={(t) => { setTicketTypeFilter(t); setPage(0); }}
        onZoneFilterChange={(z) => { setZoneFilter(z); setPage(0); }}
      />

      <GuestsBulkActions
        selectedGuests={selectedGuests}
        onBulkEmail={handleBulkEmail}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkTicketTypeUpdate={handleBulkTicketTypeUpdate}
        onBulkDelete={handleBulkDeleteGuests}
      />

      <GuestsTable
        guests={guests}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
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
