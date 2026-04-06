import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types";
import { EventDB, EventsQueryParams } from "@/types/event/event";
import { ApiResponse } from "@/types/api/apiResponse";

/**
 * Service for managing events with Supabase
 */
export const eventService = {
  /**
   * Get events with optional filtering
   */
  async getEvents(params?: EventsQueryParams): Promise<ApiResponse<Event[]>> {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      // In organizer context always scope data to owner to avoid cross-account leakage
      const organizerId = params?.organizerId ?? currentUser?.id;
      if (!organizerId) {
        return { data: [] };
      }

      let query = supabase
        .from('events')
        .select('*')
        .eq('organizer_id', organizerId)
        .order('start_date', { ascending: false });

      // Apply filters if provided
      if (params) {
        if (params.status === 'upcoming') {
          query = query.gte('start_date', new Date().toISOString());
        } else if (params.status === 'past') {
          query = query.lt('start_date', new Date().toISOString());
        }

        if (params.published !== undefined) {
          query = query.eq('is_published', params.published);
        }

        if (params.startDate) {
          query = query.gte('start_date', params.startDate);
        }

        if (params.endDate) {
          query = query.lte('end_date', params.endDate);
        }

        if (params.categoryId) {
          query = query.eq('category', params.categoryId);
        }

        if (params.search) {
          const sanitized = params.search.replace(/[%_\\]/g, '\\$&').slice(0, 100);
          query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
        }

        // Handle pagination
        if (params.page !== undefined && params.pageSize !== undefined) {
          const start = params.page * params.pageSize;
          const end = start + params.pageSize - 1;
          query = query.range(start, end);
        }
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: (data ?? []).map((item: any) => mapDbEventToEvent(item)),
        pagination: typeof count === 'number' ? {
          total: count,
          page: params?.page || 0,
          pageSize: params?.pageSize || 10
        } : undefined
      };
    } catch (error: any) {
      return { error: { message: error.message, code: 'FETCH_EVENTS_ERROR' } };
    }
  },

  /**
   * Get a single event by ID
   */
  async getEventById(id: string): Promise<ApiResponse<Event>> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: mapDbEventToEvent(data) };
    } catch (error: any) {
      return { error: { message: error.message, code: 'FETCH_EVENT_ERROR' } };
    }
  },

  /**
   * Create a new event
   */
  async createEvent(event: Partial<Event>): Promise<ApiResponse<Event>> {
    try {
      const dbEvent = mapEventToDbEvent(event);
      
      // Ensure required fields are present
      // Get current user for organizer_id
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const insertData = {
        title: dbEvent.title || '',
        start_date: dbEvent.start_date || new Date().toISOString(),
        end_date: dbEvent.end_date || new Date().toISOString(),
        description: dbEvent.description,
        location: dbEvent.location,
        organizer_id: dbEvent.organizer_id || currentUser?.id,
        is_published: dbEvent.is_published,
        image_url: dbEvent.image_url,
        category: dbEvent.category,
        max_guests: dbEvent.max_guests
      };

      const { data, error } = await supabase
        .from('events')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      return { data: mapDbEventToEvent(data) };
    } catch (error: any) {
      return { error: { message: error.message, code: 'CREATE_EVENT_ERROR' } };
    }
  },

  /**
   * Update an existing event
   */
  async updateEvent(id: string, event: Partial<Event>): Promise<ApiResponse<Event>> {
    try {
      const dbEvent = mapEventToDbEvent(event);
      
      const { data, error } = await supabase
        .from('events')
        .update(dbEvent)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: mapDbEventToEvent(data) };
    } catch (error) {
      return { error: { message: error.message, code: 'UPDATE_EVENT_ERROR' } };
    }
  },

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { data: undefined };
    } catch (error) {
      return { error: { message: error.message, code: 'DELETE_EVENT_ERROR' } };
    }
  },

  /**
   * Publish or unpublish an event
   */
  async toggleEventPublishState(id: string, isPublished: boolean): Promise<ApiResponse<Event>> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ is_published: isPublished })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: mapDbEventToEvent(data) };
    } catch (error) {
      return { error: { message: error.message, code: 'TOGGLE_PUBLISH_ERROR' } };
    }
  }
};

/**
 * Map database event to our frontend Event type
 */
function mapDbEventToEvent(dbEvent: any): Event {
  return {
    id: dbEvent.id,
    name: dbEvent.title,
    description: dbEvent.description || "",
    location: dbEvent.location || "",
    startDate: new Date(dbEvent.start_date),
    endDate: dbEvent.end_date ? new Date(dbEvent.end_date) : new Date(dbEvent.start_date),
    organizerId: dbEvent.organizer_id || "",
    organizationId: dbEvent.organizer_id || "", // Map to organizationId for compatibility
    isPublished: dbEvent.is_published || false,
    imageUrl: dbEvent.image_url,
    category: dbEvent.category,
    maxGuests: dbEvent.max_guests,
    createdAt: new Date(dbEvent.created_at || Date.now()),
    updatedAt: new Date(dbEvent.updated_at || Date.now()),
    createdBy: dbEvent.organizer_id || "" // Use organizer_id as createdBy
  };
}

/**
 * Map frontend Event type to database format
 */
function mapEventToDbEvent(event: Partial<Event>): Record<string, any> {
  const dbEvent: Record<string, any> = {};
  
  if (event.name !== undefined) dbEvent.title = event.name;
  if (event.description !== undefined) dbEvent.description = event.description;
  if (event.location !== undefined) dbEvent.location = event.location;
  if (event.startDate !== undefined) dbEvent.start_date = event.startDate.toISOString();
  if (event.endDate !== undefined) dbEvent.end_date = event.endDate.toISOString();
  if (event.organizerId !== undefined) dbEvent.organizer_id = event.organizerId;
  if (event.isPublished !== undefined) dbEvent.is_published = event.isPublished;
  if (event.imageUrl !== undefined) dbEvent.image_url = event.imageUrl;
  if (event.category !== undefined) dbEvent.category = event.category;
  if (event.maxGuests !== undefined) dbEvent.max_guests = event.maxGuests;

  return dbEvent;
}
