
import { supabase } from "@/integrations/supabase/client";
import { 
  AccreditationType, 
  AccreditationTypeForm, 
  AccreditationTypesQueryParams 
} from "@/types/accreditation";
import { ApiResponse } from "@/types/api/apiResponse";
import { 
  toAccreditationTypeDb, 
  fromAccreditationTypeDb 
} from "../supabase/transformers";

/**
 * Serwis do obsługi typów akredytacji
 */
export const AccreditationTypeService = {
  /**
   * Pobiera listę typów akredytacji
   */
  async getAccreditationTypes(params: AccreditationTypesQueryParams = {}): Promise<ApiResponse<AccreditationType[]>> {
    try {
      const { eventId, page = 1, limit = 20 } = params;
      let query = supabase.from('accreditation_types').select('*');
      
      if (eventId) {
        query = query.eq('event_id', eventId);
      }
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error } = await query
        .order('name', { ascending: true })
        .range(from, to);
      
      if (error) throw error;
      
      return { 
        data: data.map(fromAccreditationTypeDb) 
      };
    } catch (error: Error | unknown) {
      return { 
        error: {
          message: error.message || "Nie udało się pobrać typów akredytacji",
          code: error.code || "REQUEST_ERROR"
        }
      };
    }
  },
  
  /**
   * Pobiera pojedynczy typ akredytacji
   */
  async getAccreditationType(id: string): Promise<ApiResponse<AccreditationType>> {
    try {
      const { data, error } = await supabase
        .from('accreditation_types')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return { 
        data: fromAccreditationTypeDb(data) 
      };
    } catch (error: Error | unknown) {
      return { 
        error: {
          message: error.message || "Nie udało się pobrać typu akredytacji",
          code: error.code || "REQUEST_ERROR"
        }
      };
    }
  },
  
  /**
   * Tworzy nowy typ akredytacji
   */
  async createAccreditationType(form: AccreditationTypeForm): Promise<ApiResponse<AccreditationType>> {
    try {
      // Pobieramy ID zalogowanego użytkownika
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Użytkownik nie jest zalogowany");
      }
      
      const newType = {
        ...form,
        createdBy: user.id
      };
      
      const { data, error } = await supabase
        .from('accreditation_types')
        .insert(toAccreditationTypeDb(newType))
        .select()
        .single();
      
      if (error) throw error;
      
      return { 
        data: fromAccreditationTypeDb(data) 
      };
    } catch (error: Error | unknown) {
      return { 
        error: {
          message: error.message || "Nie udało się utworzyć typu akredytacji",
          code: error.code || "INSERT_ERROR"
        }
      };
    }
  },
  
  /**
   * Aktualizuje typ akredytacji
   */
  async updateAccreditationType(
    id: string, 
    updates: Partial<AccreditationTypeForm>
  ): Promise<ApiResponse<AccreditationType>> {
    try {
      const { data, error } = await supabase
        .from('accreditation_types')
        .update(toAccreditationTypeDb(updates))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { 
        data: fromAccreditationTypeDb(data) 
      };
    } catch (error: Error | unknown) {
      return { 
        error: {
          message: error.message || "Nie udało się zaktualizować typu akredytacji",
          code: error.code || "UPDATE_ERROR"
        }
      };
    }
  },
  
  /**
   * Usuwa typ akredytacji
   */
  async deleteAccreditationType(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('accreditation_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { data: undefined };
    } catch (error: Error | unknown) {
      return { 
        error: {
          message: error.message || "Nie udało się usunąć typu akredytacji",
          code: error.code || "DELETE_ERROR"
        }
      };
    }
  }
};
