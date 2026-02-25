import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-4">
          <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Powrót
          </Button>
        </div>
      </header>

      <main className="container py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Polityka Prywatności</h1>
        <p className="text-muted-foreground mb-6">Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Administrator danych</h2>
            <p className="text-muted-foreground leading-relaxed">
              Administratorem danych osobowych jest operator platformy Press Acreditations. 
              Kontakt w sprawach ochrony danych: privacy@pressacreditations.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Zakres zbieranych danych</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Zbieramy następujące dane:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Dane konta: imię, nazwisko, adres email, telefon</li>
              <li>Dane organizacji: nazwa firmy, NIP</li>
              <li>Dane wydarzeń: lista gości, statusy check-in</li>
              <li>Dane techniczne: adres IP, typ przeglądarki, logi dostępu</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Cel przetwarzania danych</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Świadczenie usług platformy (art. 6 ust. 1 lit. b RODO)</li>
              <li>Zarządzanie akredytacjami i check-inami</li>
              <li>Wysyłka zaproszeń i powiadomień email</li>
              <li>Analityka i ulepszanie usługi</li>
              <li>Realizacja obowiązków prawnych (art. 6 ust. 1 lit. c RODO)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Udostępnianie danych</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dane mogą być udostępniane podmiotom przetwarzającym: Supabase (baza danych), 
              Stripe (płatności), Resend (email). Dane nie są przekazywane do krajów trzecich 
              bez odpowiednich zabezpieczeń.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Prawa użytkownika (RODO)</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Prawo dostępu do danych</li>
              <li>Prawo do sprostowania danych</li>
              <li>Prawo do usunięcia danych („prawo do bycia zapomnianym")</li>
              <li>Prawo do ograniczenia przetwarzania</li>
              <li>Prawo do przenoszenia danych</li>
              <li>Prawo do wniesienia sprzeciwu</li>
              <li>Prawo do wniesienia skargi do organu nadzorczego (UODO)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Pliki cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Platforma wykorzystuje pliki cookies niezbędne do prawidłowego działania (sesja, 
              uwierzytelnianie) oraz analityczne. Użytkownik może zarządzać zgodami 
              na cookies za pomocą banneru wyświetlanego przy pierwszej wizycie.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Okres przechowywania danych</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dane przechowywane są przez okres korzystania z usługi oraz przez okres wymagany 
              przepisami prawa po zakończeniu korzystania z usługi.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
};

export default Privacy;
