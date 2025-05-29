
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import GuestForm from "@/components/guests/GuestForm";
import BulkEmailSender from "@/components/guests/BulkEmailSender";
import { GuestsTable } from "@/components/guests/GuestsTable";
import EnhancedBulkGuestImport from "@/components/guests/EnhancedBulkGuestImport";
import { GuestsPageHeader, GuestsFilters, GuestsBulkActions, GuestsInvitationManager, useGuestsPage } from "./guests";
import { Users, Mail, FileImage } from 'lucide-react';

const Guests = () => {
  const [activeTab, setActiveTab] = useState('guests');

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

  const handleInvitationsSent = () => {
    // Odśwież listę gości po wysłaniu zaproszeń
    setSelectedGuests([]);
    // Trigger refetch if needed
  };

  if (!selectedEvent) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Wybierz wydarzenie aby zarządzać gośćmi</p>
      </div>
    );
  }

  return (
    <div>
      <GuestsPageHeader
        selectedEvent={selectedEvent}
        onImportClick={() => setShowImportDialog(true)}
        onCreateClick={handleCreateGuest}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guests" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lista gości
            <Badge variant="secondary">{guests.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Zaproszenia z QR
          </TabsTrigger>
          <TabsTrigger value="bulk-email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Wysyłka masowa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guests" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="invitations">
          <GuestsInvitationManager
            guests={guests}
            event={selectedEvent}
            onInvitationsSent={handleInvitationsSent}
          />
        </TabsContent>

        <TabsContent value="bulk-email">
          <BulkEmailSender
            open={true}
            onOpenChange={(open) => {
              if (!open) {
                setActiveTab('guests');
              }
            }}
            selectedGuests={guests}
            eventId={selectedEvent?.id || ''}
            onEmailSent={handleEmailSent}
          />
        </TabsContent>
      </Tabs>

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
