import React from "react";
import { Users } from "lucide-react";

/**
 * Zarządzanie użytkownikami zespołu — uczciwy placeholder „wkrótce".
 *
 * Poprzednia wersja trzymała członków zespołu/role/zaproszenia wyłącznie
 * w stanie lokalnym i fałszywie raportowała „Zaproszenie zostało wysłane"
 * bez żadnego backendu. Realne zaproszenia + role wymagają schematu
 * (tabela członków zespołu + RLS) — do zaprojektowania (R2-2).
 */
const UserManagement: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Users className="h-7 w-7" />
    </div>
    <h3 className="text-lg font-semibold text-foreground">Zarządzanie zespołem — wkrótce</h3>
    <p className="mt-1 max-w-md text-sm text-muted-foreground">
      Zapraszanie członków zespołu i przydzielanie ról wymaga backendu
      (osobny schemat + RLS) i jest w przygotowaniu.
    </p>
  </div>
);

export default UserManagement;
