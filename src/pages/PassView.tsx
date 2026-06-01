/**
 * Publiczny widok QR pass — `/pass/:token`.
 *
 * Link z e-maila decyzyjnego. Renderuje kod QR z tokenu zawartego w URL (token jest
 * niezgadywalny — 160 bitów — więc pełni rolę bearer-linku). Nie wymaga logowania
 * ani odczytu z bazy: QR == token, a check-in i tak dopasowuje go po stronie skanera.
 * Dzięki temu strona działa też offline po pierwszym otwarciu i nie obchodzi RLS.
 */
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { qrToDataURL } from "@/utils/qrDataUrl";
import { isValidAccreditationToken } from "@/lib/accreditation/decisionFlow";
import { usePageTitle } from "@/hooks/usePageTitle";

const PassView = () => {
  usePageTitle("QR pass");
  const { token = "" } = useParams<{ token: string }>();

  const validToken = isValidAccreditationToken(token);
  const qrDataUrl = useMemo(() => (token ? qrToDataURL(token, 260) : ""), [token]);

  if (!validToken) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30 p-6">
        <div className="max-w-sm w-full rounded-xl border border-border bg-background p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <h1 className="font-semibold text-lg">Nieprawidłowy link do passu</h1>
          <p className="text-sm text-muted-foreground mt-1">Sprawdź, czy adres jest kompletny.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-muted/30 p-6">
      <div className="max-w-sm w-full rounded-xl border border-border bg-background p-6 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2 text-primary mb-3">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-semibold">QR pass — akredytacja prasowa</span>
        </div>

        <div className="bg-white rounded-lg p-3 inline-block border border-border my-2">
          {qrDataUrl
            ? <img src={qrDataUrl} alt="QR pass" className="h-56 w-56" />
            : <div className="h-56 w-56 grid place-items-center text-xs text-muted-foreground">Brak QR</div>}
        </div>

        <code className="mt-3 block break-all rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground">{token}</code>
        <p className="text-xs text-muted-foreground mt-3">
          Pokaż ten kod przy wejściu (check-in). Pass jest personalny — nie udostępniaj go.
        </p>
      </div>
    </div>
  );
};

export default PassView;
