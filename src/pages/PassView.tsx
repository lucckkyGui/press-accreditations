/**
 * Publiczny widok QR pass — `/pass/:token`.
 *
 * Param URL to `pass_token` (160-bit, niezgadywalny bearer-link z e-maila decyzyjnego).
 * QR koduje NUMERYCZNY `guests.qr_code` (poświadczenie skanu), rozwiązywany z tokenu przez
 * publiczny RPC `get_pass_by_token` (SECURITY DEFINER). Token nigdy nie jest skanowany.
 * Jeśli akredytacja jest cofnięta/nieaktywna — brak skanowalnego QR, komunikat „pass nieważny".
 */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { qrToDataURL } from "@/utils/qrDataUrl";
import { isValidAccreditationToken } from "@/lib/accreditation/decisionFlow";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";

interface PassData {
  qr_code: string;
  first_name: string | null;
  last_name: string | null;
  event_name: string | null;
  status: string | null;
}

// Statusy, przy których pass NIE jest ważny (brak skanowalnego QR).
const INVALID_STATUSES = new Set(["revoked"]);

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen grid place-items-center bg-muted/30 p-6">
    <div className="max-w-sm w-full rounded-xl border border-border bg-background p-6 text-center shadow-sm">
      {children}
    </div>
  </div>
);

const PassView = () => {
  usePageTitle("QR pass");
  const { token = "" } = useParams<{ token: string }>();
  const validToken = isValidAccreditationToken(token);

  const [loading, setLoading] = useState(true);
  const [pass, setPass] = useState<PassData | null>(null);

  useEffect(() => {
    if (!validToken) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const { data } = await supabase.rpc("get_pass_by_token", { _token: token });
        if (active) setPass(data?.[0] ?? null);
      } catch {
        if (active) setPass(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [token, validToken]);

  const isRevoked = pass ? INVALID_STATUSES.has(String(pass.status)) : false;
  const qrDataUrl = useMemo(
    () => (pass && !isRevoked ? qrToDataURL(pass.qr_code, 260) : ""),
    [pass, isRevoked],
  );

  if (!validToken) {
    return (
      <Shell>
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
        <h1 className="font-semibold text-lg">Nieprawidłowy link do passu</h1>
        <p className="text-sm text-muted-foreground mt-1">Sprawdź, czy adres jest kompletny.</p>
      </Shell>
    );
  }

  if (loading) {
    return (
      <Shell>
        <Loader2 className="h-7 w-7 text-primary mx-auto mb-3 animate-spin" />
        <p className="text-sm text-muted-foreground">Wczytywanie passu…</p>
      </Shell>
    );
  }

  if (!pass) {
    return (
      <Shell>
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
        <h1 className="font-semibold text-lg">Pass nie został znaleziony</h1>
        <p className="text-sm text-muted-foreground mt-1">Link może być nieaktualny.</p>
      </Shell>
    );
  }

  if (isRevoked) {
    return (
      <Shell>
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
        <h1 className="font-semibold text-lg">Pass nieważny</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Akredytacja została cofnięta. Skontaktuj się z organizatorem.
        </p>
      </Shell>
    );
  }

  const guestName = `${pass.first_name ?? ""} ${pass.last_name ?? ""}`.trim();

  return (
    <Shell>
      <div className="flex items-center justify-center gap-2 text-primary mb-3">
        <ShieldCheck className="h-5 w-5" />
        <span className="font-semibold">QR pass — akredytacja prasowa</span>
      </div>

      {guestName && <p className="text-sm font-medium">{guestName}</p>}
      {pass.event_name && <p className="text-xs text-muted-foreground">{pass.event_name}</p>}

      <div className="bg-white rounded-lg p-3 inline-block border border-border my-2">
        {qrDataUrl
          ? <img src={qrDataUrl} alt="QR pass" className="h-56 w-56" />
          : <div className="h-56 w-56 grid place-items-center text-xs text-muted-foreground">Brak QR</div>}
      </div>

      <code className="mt-3 block break-all rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground">{pass.qr_code}</code>
      <p className="text-xs text-muted-foreground mt-3">
        Pokaż ten kod przy wejściu (check-in). Pass jest personalny — nie udostępniaj go.
      </p>
    </Shell>
  );
};

export default PassView;
