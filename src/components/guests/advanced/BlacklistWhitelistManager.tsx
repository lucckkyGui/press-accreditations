import React from 'react';
import { Shield } from 'lucide-react';

/**
 * Lista kontroli dostępu (blacklist/whitelist) — uczciwy placeholder.
 *
 * Poprzednia wersja miała zaszyte (seed) wpisy z fikcyjnymi gośćmi oraz
 * dodawanie/usuwanie tylko w stanie lokalnym + fałszywe toasty sukcesu.
 * Realna lista wymaga backendu (osobna tabela + RLS) — do zaprojektowania.
 */
const BlacklistWhitelistManager: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Shield className="h-7 w-7" />
    </div>
    <h2 className="text-lg font-semibold text-foreground">Lista kontroli dostępu — wkrótce</h2>
    <p className="mt-1 max-w-md text-sm text-muted-foreground">
      Blacklista / whitelista gości wymaga backendu (osobna tabela + RLS) i jest
      w przygotowaniu.
    </p>
  </div>
);

export default BlacklistWhitelistManager;
