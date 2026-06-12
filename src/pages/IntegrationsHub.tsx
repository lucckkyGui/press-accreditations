import React from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Plug } from "lucide-react";

/**
 * Integracje — uczciwy placeholder „wkrótce".
 *
 * Poprzednia wersja była zmyślonym katalogiem integracji (Salesforce/HubSpot/
 * Pipedrive/Google Calendar…) z fałszywymi statusami „połączony" i przełącznikiem,
 * który zmieniał tylko stan lokalny i toastował sukces — bez żadnego backendu.
 * Realne integracje (publiczne API + klucze) są w Ustawienia → API.
 */
const IntegrationsHub = () => {
  usePageTitle("Integracje");

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Plug className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-semibold text-foreground">Integracje — wkrótce</h1>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Katalog gotowych integracji jest w przygotowaniu. Już dziś możesz
        zintegrować się przez publiczne API i klucze: Ustawienia → API.
      </p>
    </div>
  );
};

export default IntegrationsHub;
