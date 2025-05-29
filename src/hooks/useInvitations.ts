
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { invitationService, InvitationData, CreateInvitationRequest } from '@/services/invitation/invitationService';
import { emailCampaignService, EmailCampaignData, CreateCampaignRequest } from '@/services/email/emailCampaignService';
import { toast } from 'sonner';

export const useInvitations = (eventId?: string) => {
  // Query for fetching invitations
  const {
    data: invitations,
    isLoading: isInvitationsLoading,
    isError: isInvitationsError,
    refetch: refetchInvitations
  } = useApiQuery(
    ['invitations', eventId],
    () => eventId ? invitationService.getEventInvitations(eventId) : Promise.resolve({ data: [] }),
    {
      enabled: !!eventId,
      onError: (err) => {
        toast.error('Failed to load invitations');
        console.error('Error loading invitations:', err);
      }
    }
  );

  // Mutation for creating single invitation
  const {
    mutateAsync: createInvitation,
    isLoading: isCreatingInvitation
  } = useApiMutation(
    ['invitations', 'create'],
    (request: CreateInvitationRequest) => invitationService.createInvitation(request),
    {
      onSuccess: () => {
        toast.success('Invitation created successfully!');
        refetchInvitations();
      },
      onError: (err) => {
        toast.error('Failed to create invitation');
        console.error('Error creating invitation:', err);
      }
    }
  );

  // Mutation for creating bulk invitations
  const {
    mutateAsync: createBulkInvitations,
    isLoading: isCreatingBulkInvitations
  } = useApiMutation(
    ['invitations', 'createBulk'],
    (requests: CreateInvitationRequest[]) => invitationService.createBulkInvitations(requests),
    {
      onSuccess: (response) => {
        const count = Array.isArray(response) ? response.length : 0;
        toast.success(`${count} invitations created successfully!`);
        refetchInvitations();
      },
      onError: (err) => {
        toast.error('Failed to create bulk invitations');
        console.error('Error creating bulk invitations:', err);
      }
    }
  );

  // Mutation for using invitation (check-in)
  const {
    mutateAsync: useInvitation,
    isLoading: isUsingInvitation
  } = useApiMutation(
    ['invitations', 'use'],
    (invitationId: string) => invitationService.useInvitation(invitationId),
    {
      onSuccess: () => {
        toast.success('Guest checked in successfully!');
        refetchInvitations();
      },
      onError: (err) => {
        toast.error('Failed to check in guest');
        console.error('Error using invitation:', err);
      }
    }
  );

  // Mutation for creating email campaign
  const {
    mutateAsync: createCampaign,
    isLoading: isCreatingCampaign
  } = useApiMutation(
    ['campaigns', 'create'],
    (request: CreateCampaignRequest) => emailCampaignService.createCampaign(request),
    {
      onSuccess: () => {
        toast.success('Campaign created successfully!');
      },
      onError: (err) => {
        toast.error('Failed to create campaign');
        console.error('Error creating campaign:', err);
      }
    }
  );

  return {
    invitations: Array.isArray(invitations) ? invitations : [],
    isInvitationsLoading,
    isInvitationsError,
    createInvitation,
    createBulkInvitations,
    useInvitation,
    createCampaign,
    isCreatingInvitation,
    isCreatingBulkInvitations,
    isUsingInvitation,
    isCreatingCampaign,
    refetchInvitations
  };
};

export const useInvitationByQR = (qrCodeData?: string) => {
  return useApiQuery(
    ['invitation', 'qr', qrCodeData],
    () => qrCodeData ? invitationService.getInvitationByQR(qrCodeData) : Promise.resolve({ data: null }),
    {
      enabled: !!qrCodeData,
      onError: (err) => {
        toast.error('Invalid QR code');
        console.error('Error getting invitation by QR:', err);
      }
    }
  );
};
