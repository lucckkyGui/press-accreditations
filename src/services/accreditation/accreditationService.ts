
import { supabase } from "@/integrations/supabase/client";
import { 
  Accreditation, 
  AccreditationForm, 
  AccreditationsQueryParams,
  CheckInData 
} from "@/types/accreditation";
import { ApiResponse } from "@/types/api/apiResponse";
import { 
  toAccreditationDb, 
  fromAccreditationDb 
} from "../supabase/transformers";
import { generateQRCode } from "@/utils/qrCodeGenerator";

/**
 * Serwis do obsługi akredytacji
 */
export const AccreditationService = {
  /**
   * Pobiera listę akredytacji
   */
  async getAccreditations(params: AccreditationsQueryParams = {}): Promise<ApiResponse<Accreditation[]>> {
    try {
      const { eventId, userId, typeId, isCheckedIn, revoked, page = 1, limit = 20 } = params;
      let query = supabase.from('accreditations').select('*');
      
      if (eventId) {
        query = query.eq('event_id', eventId);
      }
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (typeId) {
        query = query.eq('type_id', typeId);
      }
      
      if (isCheckedIn !== undefined) {
        query = query.eq('is_checked_in', isCheckedIn);
      }
      
      if (revoked !== undefined) {
        query = query.eq('revoked', revoked);
      }
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      return { 
        data: data.map(fromAccreditationDb) 
      };
    } catch (error: any) {
      console.error("Error fetching accreditations:", error);
      return { 
        error: {
          message: error.message || "Nie udało się pobrać akredytacji",
          code: error.code || "REQUEST_ERROR"
        }
      };
    }
  },
  
  /**
   * Pobiera pojedynczą akredytację
   */
  async getAccreditation(id: string): Promise<ApiResponse<Accreditation>> {
    try {
      const { data, error } = await supabase
        .from('accreditations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return { 
        data: fromAccreditationDb(data) 
      };
    } catch (error: any) {
      console.error(`Error fetching accreditation ${id}:`, error);
      return { 
        error: {
          message: error.message || "Nie udało się pobrać akredytacji",
          code: error.code || "REQUEST_ERROR"
        }
      };
    }
  },
  
  /**
   * Pobiera akredytację na podstawie kodu QR
   */
  async getAccreditationByQRCode(qrCode: string): Promise<ApiResponse<Accreditation>> {
    try {
      const { data, error } = await supabase
        .from('accreditations')
        .select('*')
        .eq('qr_code', qrCode)
        .single();
      
      if (error) throw error;
      
      return { 
        data: fromAccreditationDb(data) 
      };
    } catch (error: any) {
      console.error(`Error fetching accreditation by QR code:`, error);
      return { 
        error: {
          message: error.message || "Nie udało się pobrać akredytacji",
          code: error.code || "REQUEST_ERROR"
        }
      };
    }
  },
  
  /**
   * Tworzy nową akredytację
   */
  async createAccreditation(form: AccreditationForm): Promise<ApiResponse<Accreditation>> {
    try {
      // Generowanie unikalnego kodu QR
      const qrCodeData = `${form.eventId}-${form.userId}-${Date.now()}`;
      const qrCode = await generateQRCode(qrCodeData);
      
      const newAccreditation = {
        ...form,
        qrCode,
        isCheckedIn: false,
        revoked: false
      };
      
      const { data, error } = await supabase
        .from('accreditations')
        .insert(toAccreditationDb(newAccreditation))
        .select()
        .single();
      
      if (error) throw error;
      
      return { 
        data: fromAccreditationDb(data) 
      };
    } catch (error: any) {
      console.error("Error creating accreditation:", error);
      return { 
        error: {
          message: error.message || "Nie udało się utworzyć akredytacji",
          code: error.code || "INSERT_ERROR"
        }
      };
    }
  },
  
  /**
   * Check-in akredytacji
   */
  async checkInAccreditation(checkInData: CheckInData): Promise<ApiResponse<Accreditation>> {
    try {
      const { accreditationId, checkedInBy } = checkInData;
      
      const { data, error } = await supabase
        .from('accreditations')
        .update({
          is_checked_in: true,
          checked_in_at: new Date().toISOString(),
          checked_in_by: checkedInBy
        })
        .eq('id', accreditationId)
        .select()
        .single();
      
      if (error) throw error;
      
      return { 
        data: fromAccreditationDb(data) 
      };
    } catch (error: any) {
      console.error(`Error checking in accreditation:`, error);
      return { 
        error: {
          message: error.message || "Nie udało się zarejestrować check-in",
          code: error.code || "UPDATE_ERROR"
        }
      };
    }
  },
  
  /**
   * Unieważnia akredytację
   */
  async revokeAccreditation(id: string, reason: string): Promise<ApiResponse<Accreditation>> {
    try {
      const { data, error } = await supabase
        .from('accreditations')
        .update({
          revoked: true,
          revocation_reason: reason
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { 
        data: fromAccreditationDb(data) 
      };
    } catch (error: any) {
      console.error(`Error revoking accreditation ${id}:`, error);
      return { 
        error: {
          message: error.message || "Nie udało się unieważnić akredytacji",
          code: error.code || "UPDATE_ERROR"
        }
      };
    }
  }
};
