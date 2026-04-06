
import { supabase } from "@/integrations/supabase/client";
import { 
  AccreditationRequest, 
  AccreditationRequestForm, 
  AccreditationRequestsQueryParams 
} from "@/types/accreditation";
import { ApiResponse } from "@/types/api/apiResponse";
import { 
  toAccreditationRequestDb, 
  fromAccreditationRequestDb 
} from "../supabase/transformers";

/**
 * Serwis do obsługi wniosków o akredytację
 */
export const AccreditationRequestService = {
  /**
   * Pobiera listę wniosków o akredytację
   */
  async getAccreditationRequests(params: AccreditationRequestsQueryParams = {}): Promise<ApiResponse<AccreditationRequest[]>> {
    try {
      const { eventId, status, page = 1, limit = 10 } = params;
      let query = supabase.from('accreditation_requests').select('*');
      
      if (eventId) {
        query = query.eq('event_id', eventId);
      }
      
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      return { 
        data: data.map(fromAccreditationRequestDb) 
      };
    } catch (error: unknown) {
      return { 
        error: {
          message: error.message || "Nie udało się pobrać wniosków o akredytację",
          code: error.code || "REQUEST_ERROR"
        }
      };
    }
  },
  
  /**
   * Pobiera pojedynczy wniosek o akredytację
   */
  async getAccreditationRequest(id: string): Promise<ApiResponse<AccreditationRequest>> {
    try {
      const { data, error } = await supabase
        .from('accreditation_requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return { 
        data: fromAccreditationRequestDb(data) 
      };
    } catch (error: unknown) {
      return { 
        error: {
          message: error.message || "Nie udało się pobrać wniosku o akredytację",
          code: error.code || "REQUEST_ERROR"
        }
      };
    }
  },
  
  /**
   * Tworzy nowy wniosek o akredytację
   */
  async createAccreditationRequest(form: AccreditationRequestForm): Promise<ApiResponse<AccreditationRequest>> {
    try {
      // Pobieramy ID zalogowanego użytkownika
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Użytkownik nie jest zalogowany");
      }
      
      const newRequest = {
        ...form,
        userId: user.id,
        status: 'pending' as const
      };
      
      const { data, error } = await supabase
        .from('accreditation_requests')
        .insert(toAccreditationRequestDb(newRequest))
        .select()
        .single();
      
      if (error) throw error;
      
      return { 
        data: fromAccreditationRequestDb(data) 
      };
    } catch (error: unknown) {
      return { 
        error: {
          message: error.message || "Nie udało się utworzyć wniosku o akredytację",
          code: error.code || "INSERT_ERROR"
        }
      };
    }
  },
  
  /**
   * Aktualizuje status wniosku o akredytację
   */
  async updateAccreditationRequestStatus(
    id: string, 
    status: 'approved' | 'rejected',
    approvalNotes?: string
  ): Promise<ApiResponse<AccreditationRequest>> {
    try {
      // Pobieramy ID zalogowanego użytkownika
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Użytkownik nie jest zalogowany");
      }
      
      const updateData = {
        status,
        approval_notes: approvalNotes,
        approval_date: new Date().toISOString(),
        approved_by: user.id
      };
      
      const { data, error } = await supabase
        .from('accreditation_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { 
        data: fromAccreditationRequestDb(data) 
      };
    } catch (error: unknown) {
      return { 
        error: {
          message: error.message || "Nie udało się zaktualizować wniosku o akredytację",
          code: error.code || "UPDATE_ERROR"
        }
      };
    }
  }
};
