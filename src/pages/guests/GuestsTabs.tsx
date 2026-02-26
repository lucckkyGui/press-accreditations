
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
  page: number;
  pageSize: number;
  search: string;
  statusFilter: any;
  zoneFilter: any;
  selectedGuests: any[];
  selectedEvent: any;
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
  handleEmailSent: () => void;
}

const GuestsTabs: React.FC<GuestsTabsProps> = (props) => {
  const [activeTab, setActiveTab] = useState('guests');
  const { canUseFeature, getRequiredTierForFeature } = useFeatureAccess();
  
  const hasBulkEmail = canUseFeature('bulkEmail');
  const hasMassEmail = canUseFeature('massEmail');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="guests" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Lista gości
          <Badge variant="secondary">{props.guests.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="invitations" className="flex items-center gap-2">
          <FileImage className="h-4 w-4" />
          Zaproszenia z QR
        </TabsTrigger>
        <TabsTrigger value="bulk-email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Wysyłka masowa
          {!hasBulkEmail && <Lock className="h-3 w-3 text-muted-foreground" />}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="guests">
        <GuestsListTab {...props} />
      </TabsContent>

      <TabsContent value="invitations">
        <GuestsInvitationTab 
          guests={props.guests}
          event={props.selectedEvent}
          onInvitationsSent={() => {
            props.setSelectedGuests([]);
          }}
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
