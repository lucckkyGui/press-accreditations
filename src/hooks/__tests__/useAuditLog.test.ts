import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuditLog } from '@/hooks/useAuditLog';

vi.mock('@/services/audit/auditService', () => ({
  createAuditLog: vi.fn().mockResolvedValue({ id: '1' }),
}));

describe('useAuditLog', () => {
  it('should return audit log functions', () => {
    const { result } = renderHook(() => useAuditLog());
    
    expect(result.current.logLogin).toBeDefined();
    expect(result.current.logLogout).toBeDefined();
    expect(result.current.logEventCreate).toBeDefined();
    expect(result.current.logEventUpdate).toBeDefined();
    expect(result.current.logEventDelete).toBeDefined();
    expect(result.current.logGuestCreate).toBeDefined();
    expect(result.current.logGuestDelete).toBeDefined();
    expect(result.current.logBulkDelete).toBeDefined();
    expect(result.current.logRoleChange).toBeDefined();
    expect(result.current.logAccreditationApprove).toBeDefined();
    expect(result.current.logAccreditationRevoke).toBeDefined();
    expect(result.current.logSettingsChange).toBeDefined();
    expect(result.current.log).toBeDefined();
  });

  it('logLogin should not throw', async () => {
    const { result } = renderHook(() => useAuditLog());
    await expect(result.current.logLogin('test@example.com')).resolves.not.toThrow();
  });
});
