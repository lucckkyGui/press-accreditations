import React from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Bell } from "lucide-react";

/**
 * Centrum powiadomień (pełna strona) — uczciwy placeholder „wkrótce".
 *
 * Poprzednia wersja była zbudowana w całości na zmyślonych danych (fikcyjni
 * goście, wymyślona historia wysyłki) z fałszywym „Powiadomienie zostało
 * wysłane". Realny kanał powiadomień działa: dzwonek w nagłówku
 * (NotificationCenter → tabela user_notifications). Pełna strona zarządzania
 * powiadomieniami zostanie zbudowana na tym realnym źródle.
 */
const Notifications = () => {
  usePageTitle("Powiadomienia");

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Bell className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-semibold text-foreground">Centrum powiadomień — wkrótce</h1>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Bieżące powiadomienia znajdziesz pod dzwonkiem w prawym górnym rogu.
        Pełna strona zarządzania powiadomieniami jest w przygotowaniu.
      </p>
    </div>
  );
};

export default Notifications;
