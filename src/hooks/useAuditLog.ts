import { createAuditLog } from "@/services/audit/auditService";

type Severity = "info" | "warning" | "error";

export const useAuditLog = () => {
  const log = async (
    action: string,
    resource: string,
    options?: {
      resource_id?: string;
      details?: string;
      severity?: Severity;
      metadata?: Record<string, unknown>;
    }
  ) => {
    try {
      await createAuditLog({
        action,
        resource,
        ...options,
      });
    } catch {
      // Silently fail - audit logging should never break the app
    }
  };

  return {
    logLogin: (email: string) => log("login", "auth", { details: `User logged in: ${email}`, severity: "info" }),
    logLogout: () => log("logout", "auth", { severity: "info" }),
    logEventCreate: (eventId: string, title: string) => log("create", "events", { resource_id: eventId, details: `Created event: ${title}` }),
    logEventUpdate: (eventId: string) => log("update", "events", { resource_id: eventId }),
    logEventDelete: (eventId: string) => log("delete", "events", { resource_id: eventId, severity: "warning" }),
    logGuestCreate: (guestId: string) => log("create", "guests", { resource_id: guestId }),
    logGuestDelete: (guestId: string) => log("delete", "guests", { resource_id: guestId, severity: "warning" }),
    logBulkDelete: (count: number) => log("bulk_delete", "guests", { details: `Deleted ${count} guests`, severity: "warning" }),
    logRoleChange: (userId: string, role: string) => log("role_change", "user_roles", { resource_id: userId, details: `Role changed to: ${role}`, severity: "warning" }),
    logAccreditationApprove: (id: string) => log("approve", "accreditations", { resource_id: id }),
    logAccreditationRevoke: (id: string) => log("revoke", "accreditations", { resource_id: id, severity: "warning" }),
    logSettingsChange: (setting: string) => log("update", "settings", { details: `Changed: ${setting}` }),
    log,
  };
};
