
import { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { eventService } from '@/services/eventService';
import { Event } from '@/types';
import { EventsQueryParams } from '@/types/event/event';
import { toast } from 'sonner';

export const useEvents = () => {
  const [queryParams, setQueryParams] = useState<EventsQueryParams>({
    page: 0,
    pageSize: 10,
    status: 'upcoming'
  });

  // Query for fetching events
  const {
    data: eventsResponse,
    isLoading: isEventsLoading,
    isError: isEventsError,
    refetch: refetchEvents
  } = useApiQuery(
    ['events', queryParams],
    () => eventService.getEvents(queryParams),
    {
      onError: (err) => {
        toast.error('Failed to load events');
        console.error('Error loading events:', err);
      }
    }
  );

  // Mutation for creating an event
  const {
    mutateAsync: createEvent,
    isLoading: isCreating
  } = useApiMutation(
    ['events', 'create'],
    (event: Partial<Event>) => eventService.createEvent(event),
    {
      onSuccess: () => {
        toast.success('Event created successfully!');
        refetchEvents();
      },
      onError: (err) => {
        toast.error('Failed to create event');
        console.error('Error creating event:', err);
      }
    }
  );

  // Mutation for updating an event
  const {
    mutateAsync: updateEvent,
    isLoading: isUpdating
  } = useApiMutation(
    ['events', 'update'],
    ({ id, event }: { id: string; event: Partial<Event> }) => eventService.updateEvent(id, event),
    {
      onSuccess: () => {
        toast.success('Event updated successfully!');
        refetchEvents();
      },
      onError: (err) => {
        toast.error('Failed to update event');
        console.error('Error updating event:', err);
      }
    }
  );

  // Mutation for deleting an event
  const {
    mutateAsync: deleteEvent,
    isLoading: isDeleting
  } = useApiMutation(
    ['events', 'delete'],
    (id: string) => eventService.deleteEvent(id),
    {
      onSuccess: () => {
        toast.success('Event deleted successfully!');
        refetchEvents();
      },
      onError: (err) => {
        toast.error('Failed to delete event');
        console.error('Error deleting event:', err);
      }
    }
  );

  // Mutation for toggling event publish state
  const {
    mutateAsync: toggleEventPublishState,
    isLoading: isTogglingPublishState
  } = useApiMutation(
    ['events', 'togglePublish'],
    ({ id, isPublished }: { id: string; isPublished: boolean }) => 
      eventService.toggleEventPublishState(id, isPublished),
    {
      onSuccess: (response) => {
        const status = response?.isPublished ? 'published' : 'unpublished';
        toast.success(`Event ${status} successfully!`);
        refetchEvents();
      },
      onError: (err) => {
        toast.error('Failed to update event publish state');
        console.error('Error updating event publish state:', err);
      }
    }
  );

  return {
    events: Array.isArray(eventsResponse) ? eventsResponse : eventsResponse?.data || [],
    pagination: eventsResponse?.pagination,
    isEventsLoading,
    isEventsError,
    queryParams,
    setQueryParams,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventPublishState,
    isCreating,
    isUpdating,
    isDeleting,
    isTogglingPublishState
  };
};
