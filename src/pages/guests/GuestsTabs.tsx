
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, FileImage, Lock } from 'lucide-react';
import GuestsListTab from './GuestsListTab';
import GuestsInvitationTab from './GuestsInvitationTab';
import GuestsBulkEmailTab from './GuestsBulkEmailTab';
import UpgradeBanner from '@/components/common/UpgradeBanner';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

interface GuestsTabsProps {
  guests: any[];
  total: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  search: string;
  statusFilter: any;
  ticketTypeFilter: any;
  zoneFilter: string;
  selectedGuests: any[];
  selectedEvent: any;
  isLoading: boolean;
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
  handleEmailSent: () => void;
}

const GuestsTabs: React.FC<GuestsTabsProps> = (props) => {
  const [activeTab, setActiveTab] = useState('guests');
  const { canUseFeature, getRequiredTierForFeature } = useFeatureAccess();
  const hasBulkEmail = canUseFeature('bulkEmail');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-3 bg-primary/5 p-1 rounded-xl border border-border h-12">
        <TabsTrigger value="guests" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Lista gości</span>
          <Badge variant="secondary" className="rounded-md text-[10px] h-5 bg-primary/10 text-primary border-0 data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground">
            {props.total}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="invitations" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
          <FileImage className="h-4 w-4" />
          <span className="hidden sm:inline">Zaproszenia QR</span>
        </TabsTrigger>
        <TabsTrigger value="bulk-email" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Wysyłka</span>
          {!hasBulkEmail && <Lock className="h-3 w-3 text-muted-foreground" />}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="guests">
        <GuestsListTab
          guests={props.guests}
          total={props.total}
          hasMore={props.hasMore}
          isLoadingMore={props.isLoadingMore}
          onLoadMore={props.onLoadMore}
          search={props.search}
          statusFilter={props.statusFilter}
          ticketTypeFilter={props.ticketTypeFilter}
          zoneFilter={props.zoneFilter}
          selectedGuests={props.selectedGuests}
          isLoading={props.isLoading}
          setSearch={props.setSearch}
          setStatusFilter={props.setStatusFilter}
          setTicketTypeFilter={props.setTicketTypeFilter}
          setZoneFilter={props.setZoneFilter}
          setSelectedGuests={props.setSelectedGuests}
          handleEditGuest={props.handleEditGuest}
          handleDeleteGuest={props.handleDeleteGuest}
          handleBulkEmail={props.handleBulkEmail}
          handleBulkStatusUpdate={props.handleBulkStatusUpdate}
          handleBulkTicketTypeUpdate={props.handleBulkTicketTypeUpdate}
          handleBulkDeleteGuests={props.handleBulkDeleteGuests}
        />
      </TabsContent>

      <TabsContent value="invitations">
        <GuestsInvitationTab
          guests={props.guests}
          event={props.selectedEvent}
          onInvitationsSent={() => props.setSelectedGuests([])}
        />
      </TabsContent>

      <TabsContent value="bulk-email">
        {hasBulkEmail ? (
          <GuestsBulkEmailTab
            guests={props.guests}
            selectedEvent={props.selectedEvent}
            onEmailSent={props.handleEmailSent}
            onTabChange={setActiveTab}
          />
        ) : (
          <UpgradeBanner
            requiredTier={getRequiredTierForFeature('bulkEmail')}
            featureLabel="Wysyłka masowa e-maili"
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default GuestsTabs;
