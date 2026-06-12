import React from 'react';
import { MapPin } from 'lucide-react';

/**
 * Strefy dostępu — uczciwy placeholder.
 *
 * Poprzednia wersja trzymała zaszyte (seed) strefy w stanie lokalnym z
 * dodawaniem/edycją/usuwaniem bez backendu i fałszywymi toastami sukcesu.
 * Realny builder stref (mapa, pojemności, podgląd wypełnienia) = R2-1.
 */
const ZoneManagement: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <MapPin className="h-7 w-7" />
    </div>
    <h2 className="text-lg font-semibold text-foreground">Strefy dostępu — wkrótce</h2>
    <p className="mt-1 max-w-md text-sm text-muted-foreground">
      Wizualny edytor stref (mapa, pojemności, podgląd wypełnienia) jest w przygotowaniu.
      Goście już dziś mają realne pole stref przy akredytacji.
    </p>
  </div>
);

export default ZoneManagement;
