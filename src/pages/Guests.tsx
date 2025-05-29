
import React from 'react';
import GuestForm from "@/components/guests/GuestForm";
import BulkEmailSender from "@/components/guests/BulkEmailSender";
import { GuestsTable } from "@/components/guests/GuestsTable";
import EnhancedBulkGuestImport from "@/components/guests/EnhancedBulkGuestImport";
import { GuestsPageHeader, GuestsFilters, GuestsBulkActions, useGuestsPage } from "./guests";

const Guests = () => {
  const {
    // State
    guests,
    total,
    page,
    pageSize,
    search,
    statusFilter,
    zoneFilter,
    isLoading,
    showFormDialog,
    showImportDialog,
    showEmailDialog,
    selectedGuest,
    selectedGuests,
    selectedEvent,
    
    // Setters
    setPage,
    setPageSize,
    setSearch,
    setStatusFilter,
    setZoneFilter,
    setShowFormDialog,
    setShowImportDialog,
    setShowEmailDialog,
    setSelectedGuests,
    
    // Handlers
    handleCreateGuest,
    handleEditGuest,
    handleDeleteGuest,
    handleSaveGuest,
    handleBulkDeleteGuests,
    handleBulkStatusUpdate,
    handleBulkZoneUpdate,
    handleBulkEmail,
    handleBulkImport,
    handleEmailSent
  } = useGuestsPage();

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
    <div>
      <GuestsPageHeader
        selectedEvent={selectedEvent}
        onImportClick={() => setShowImportDialog(true)}
        onCreateClick={handleCreateGuest}
      />

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
