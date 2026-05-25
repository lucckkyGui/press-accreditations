
import { guestQueryService } from "./guest/guestQueryService";
import { guestMutationService } from "./guest/guestMutationService";
import { guestBulkService } from "./guest/guestBulkService";
import { guestEmailService } from "./guest/guestEmailService";

/**
 * Main guest service that combines all guest-related services
 */
export const guestService = {
  // Query operations
  ...guestQueryService,
  
  // Single guest mutations
  ...guestMutationService,
  
  // Bulk operations
  ...guestBulkService,
  
  // Email operations
  ...guestEmailService
};
