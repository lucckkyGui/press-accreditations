/**
 * Security & GDPR — strona dla klienta B2B.
 *
 * Opisuje realny stan: audit logs, role-based access, data retention, processors,
 * consent records, export/delete request. NIE obiecuje certyfikatów, których
 * produkt nie ma (brak twierdzeń o SOC2/ISO).
 */
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield, KeyRound, Clock, Server, FileCheck2, Download, Trash2, ScrollText, Lock,
} from "lucide-react";

const PROCESSORS = [
  { name: "Supabase", role: "Baza danych, autoryzacja, storage", region: "UE (region projektu)" },
  { name: "Vercel", role: "Hosting aplikacji (frontend)", region: "Globalny CDN" },
  { name: "Resend", role: "Wysyłka e-maili transakcyjnych", region: "USA / UE" },
  { name: "Stripe", role: "Płatności (jeśli subskrypcja aktywna)", region: "USA / UE" },
];

const RETENTION = [
  { data: "Zgłoszenia akredytacyjne", period: "Do 24 miesięcy po wydarzeniu", note: "lub do żądania usunięcia" },
  { data: "Akredytacje i check-in", period: "Do 24 miesięcy po wydarzeniu", note: "dane operacyjne wydarzenia" },
  { data: "Media CRM (kontakty)", period: "Do odwołania zgody / żądania usunięcia", note: "anonimizacja na żądanie" },
  { data: "Logi audytowe", period: "12 miesięcy", note: "bezpieczeństwo i rozliczalność" },
  { data: "Coverage / publikacje", period: "Do 24 miesięcy po wydarzeniu", note: "raportowanie wartości medialnej" },
];

const ROLES = [
  { role: "admin", access: "Pełny dostęp + audyt + eksport/usuwanie danych" },
  { role: "organizer", access: "Własne wydarzenia: zgłoszenia, decyzje, check-in, coverage, raporty" },
  { role: "staff / moderator", access: "Operacyjny check-in i przegląd (ograniczony)" },
  { role: "user / guest", access: "Tylko własne dane / publiczne formularze" },
];

const Section = ({ icon: Icon, title, desc, children }: {
  icon: React.ElementType; title: string; desc?: string; children: React.ReactNode;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /> {title}</CardTitle>
      {desc && <CardDescription>{desc}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const SecurityGdprPage = () => {
  usePageTitle("Bezpieczeństwo i RODO");

  return (
    <div className="max-w-4xl mx-auto space-y-5 py-2">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold tracking-tight">Bezpieczeństwo i ochrona danych (RODO)</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          PressOps przetwarza dane mediów i uczestników wydarzeń zgodnie z RODO.
          Poniżej opisujemy realne mechanizmy ochrony, które stosujemy.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Section icon={KeyRound} title="Kontrola dostępu (role-based access)"
          desc="Dostęp do danych zależy od roli użytkownika.">
          <ul className="space-y-2">
            {ROLES.map((r) => (
              <li key={r.role} className="flex items-start gap-2 text-sm">
                <Badge variant="outline" className="shrink-0">{r.role}</Badge>
                <span className="text-muted-foreground">{r.access}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            Egzekwowane na poziomie bazy (Row Level Security) — nie tylko w interfejsie.
          </p>
        </Section>

        <Section icon={ScrollText} title="Logi audytowe (audit logs)"
          desc="Rejestrujemy istotne operacje na danych.">
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>• Zgłoszenia i decyzje akredytacyjne</li>
            <li>• Generowanie QR / akredytacji</li>
            <li>• Check-in i cofnięcia akredytacji</li>
            <li>• Weryfikacja coverage</li>
            <li>• Eksport i usuwanie danych (RODO)</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            Dostępne dla administratorów w panelu „Bezpieczeństwo", z filtrowaniem
            po typie zdarzenia, wydarzeniu i rekordzie.
          </p>
        </Section>

        <Section icon={Clock} title="Retencja danych (data retention)">
          <div className="space-y-2">
            {RETENTION.map((r) => (
              <div key={r.data} className="text-sm border-l-2 border-border pl-3">
                <div className="font-medium">{r.data}</div>
                <div className="text-muted-foreground text-xs">{r.period} · {r.note}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Server} title="Podmioty przetwarzające (processors)"
          desc="Korzystamy z zaufanych dostawców infrastruktury.">
          <div className="space-y-2">
            {PROCESSORS.map((p) => (
              <div key={p.name} className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  <Badge variant="outline" className="text-[10px]">{p.region}</Badge>
                </div>
                <div className="text-muted-foreground text-xs">{p.role}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={FileCheck2} title="Zgody (consent records)"
          desc="Zgody zapisujemy razem ze zgłoszeniem.">
          <p className="text-sm text-muted-foreground">
            Każde zgłoszenie medialne zawiera znacznik zgody na przetwarzanie danych
            (wymagana) oraz opcjonalnej zgody marketingowej. Zgody przechowujemy jako
            część rekordu zgłoszenia (consent snapshot) wraz z datą złożenia.
          </p>
        </Section>

        <Section icon={Lock} title="Żądania eksportu / usunięcia (export / delete request)"
          desc="Realizujemy prawa osób, których dane dotyczą.">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><Download className="h-4 w-4 text-primary" />
              <strong className="text-foreground">Eksport:</strong> administrator może wyeksportować
              wszystkie dane kontaktu medialnego (dane osoby, historia, coverage).</p>
            <p className="flex items-center gap-2"><Trash2 className="h-4 w-4 text-destructive" />
              <strong className="text-foreground">Usunięcie / anonimizacja:</strong> dane osobowe
              kontaktu są usuwane/anonimizowane, z zachowaniem zanonimizowanych statystyk.</p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Operacje dostępne w panelu Media CRM (admin) i logowane w audycie.
          </p>
        </Section>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Uwaga:</strong> ta strona opisuje stosowane mechanizmy
          ochrony danych. Nie stanowi deklaracji posiadania zewnętrznych certyfikatów
          (np. SOC 2, ISO 27001). W razie pytań dotyczących umowy powierzenia przetwarzania
          danych (DPA) skontaktuj się z administratorem.
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityGdprPage;
