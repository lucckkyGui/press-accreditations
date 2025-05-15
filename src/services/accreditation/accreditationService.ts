import { supabase } from "@/integrations/supabase/client";
import { 
  Accreditation, 
  AccreditationForm, 
  AccreditationsQueryParams,
  CheckInData,
  AccreditationStats,
  AccessAreaEntry,
  AccreditationBadgeData
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
  },
  
  /**
   * Pobiera statystyki akredytacji dla wydarzenia
   */
  async getAccreditationStats(eventId: string): Promise<ApiResponse<AccreditationStats>> {
    try {
      // Pobieranie wszystkich akredytacji dla wydarzenia - w prawdziwej aplikacji zrobilibyśmy to przez SQL
      const { data: accreditations, error } = await supabase
        .from('accreditations')
        .select('*, accreditation_types(id, name)')
        .eq('event_id', eventId);
      
      if (error) throw error;
      
      // Agregacja danych do statystyk
      const stats: AccreditationStats = {
        total: accreditations.length,
        active: accreditations.filter(a => !a.revoked && new Date(a.validity_end) >= new Date()).length,
        pending: accreditations.filter(a => a.status === 'pending').length,
        issued: accreditations.filter(a => a.status === 'issued').length,
        checkedIn: accreditations.filter(a => a.is_checked_in).length,
        revoked: accreditations.filter(a => a.revoked).length,
        byType: []
      };
      
      // Grupowanie według typów
      const typeGroups = accreditations.reduce((groups, acc) => {
        const typeId = acc.type_id;
        const typeName = (acc.accreditation_types as any)?.name || 'Unknown';
        
        if (!groups[typeId]) {
          groups[typeId] = { 
            typeId, 
            typeName, 
            count: 0 
          };
        }
        
        groups[typeId].count++;
        return groups;
      }, {} as Record<string, { typeId: string; typeName: string; count: number; }>);
      
      stats.byType = Object.values(typeGroups);
      
      return { data: stats };
    } catch (error: any) {
      console.error("Error fetching accreditation stats:", error);
      return { 
        error: {
          message: error.message || "Nie udało się pobrać statystyk akredytacji",
          code: error.code || "REQUEST_ERROR"
        }
      };
    }
  },

  /**
   * Rejestruje wejście do strefy dostępu
   */
  async recordAreaAccess(entry: AccessAreaEntry): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('access_area_entries')
        .insert({
          area_id: entry.areaId,
          timestamp: entry.timestamp || new Date().toISOString(),
          user_id: entry.userId,
          accreditation_id: entry.accreditationId,
          device_id: entry.deviceId,
          status: entry.status,
          reason: entry.reason
        });
      
      if (error) throw error;
      
      return { data: undefined };
    } catch (error: any) {
      console.error("Error recording area access:", error);
      return { 
        error: {
          message: error.message || "Nie udało się zarejestrować wejścia do strefy",
          code: error.code || "INSERT_ERROR"
        }
      };
    }
  },

  /**
   * Generuje dane identyfikatora na podstawie akredytacji
   */
  async generateBadgeData(accreditationId: string): Promise<ApiResponse<AccreditationBadgeData>> {
    try {
      const { data: accreditation, error: accError } = await supabase
        .from('accreditations')
        .select(`
          *,
          types:accreditation_types(id, name, access_areas),
          users:profiles(first_name, last_name, organization_name, avatar_url),
          events(title, logo_url)
        `)
        .eq('id', accreditationId)
        .single();
      
      if (accError) throw accError;
      
      if (!accreditation) {
        return { 
          error: {
            message: "Nie znaleziono akredytacji",
            code: "NOT_FOUND"
          }
        };
      }
      
      const badgeData: AccreditationBadgeData = {
        id: accreditation.id,
        firstName: (accreditation.users as any)?.first_name || '',
        lastName: (accreditation.users as any)?.last_name || '',
        organization: (accreditation.users as any)?.organization_name || '',
        typeId: accreditation.type_id,
        typeName: (accreditation.types as any)?.name || '',
        validFrom: accreditation.validity_start,
        validTo: accreditation.validity_end,
        qrCode: accreditation.qr_code,
        badgeNumber: accreditation.badgeNumber,
        photoUrl: (accreditation.users as any)?.avatar_url,
        accessAreas: (accreditation.types as any)?.access_areas || [],
        eventName: (accreditation.events as any)?.title || '',
        eventLogo: (accreditation.events as any)?.logo_url
      };
      
      return { data: badgeData };
    } catch (error: any) {
      console.error("Error generating badge data:", error);
      return { 
        error: {
          message: error.message || "Nie udało się wygenerować danych identyfikatora",
          code: error.code || "REQUEST_ERROR"
        }
      };
    }
  },

  /**
   * Aktualizuje status akredytacji
   */
  async updateAccreditationStatus(
    id: string, 
    status: string,
    notes?: string
  ): Promise<ApiResponse<Accreditation>> {
    try {
      const { data, error } = await supabase
        .from('accreditations')
        .update({
          status: status,
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { 
        data: fromAccreditationDb(data) 
      };
    } catch (error: any) {
      console.error(`Error updating accreditation status ${id}:`, error);
      return { 
        error: {
          message: error.message || "Nie udało się zaktualizować statusu akredytacji",
          code: error.code || "UPDATE_ERROR"
        }
      };
    }
  },

  /**
   * Oznacza identyfikator jako wydrukowany
   */
  async markBadgePrinted(
    id: string, 
    badgeNumber?: string
  ): Promise<ApiResponse<Accreditation>> {
    try {
      const updateData: any = {
        badge_printed: true,
        badge_printed_at: new Date().toISOString()
      };
      
      if (badgeNumber) {
        updateData.badge_number = badgeNumber;
      }
      
      const { data, error } = await supabase
        .from('accreditations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { 
        data: fromAccreditationDb(data) 
      };
    } catch (error: any) {
      console.error(`Error marking badge as printed ${id}:`, error);
      return { 
        error: {
          message: error.message || "Nie udało się oznaczyć identyfikatora jako wydrukowany",
          code: error.code || "UPDATE_ERROR"
        }
      };
    }
  }
};
