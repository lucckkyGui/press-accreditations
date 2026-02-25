import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
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
        <h1 className="text-3xl font-bold mb-8">Regulamin serwisu</h1>
        <p className="text-muted-foreground mb-6">Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Postanowienia ogólne</h2>
            <p className="text-muted-foreground leading-relaxed">
              Niniejszy regulamin określa zasady korzystania z platformy Press Acreditations dostępnej pod adresem pressacreditations.com. 
              Platforma służy do zarządzania akredytacjami mediów i gości na wydarzeniach.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Definicje</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Usługodawca</strong> — operator platformy Press Acreditations.</li>
              <li><strong>Użytkownik</strong> — osoba fizyczna lub prawna korzystająca z platformy.</li>
              <li><strong>Organizator</strong> — użytkownik tworzący i zarządzający wydarzeniami.</li>
              <li><strong>Gość</strong> — osoba zaproszona na wydarzenie przez Organizatora.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Warunki korzystania z usługi</h2>
            <p className="text-muted-foreground leading-relaxed">
              Korzystanie z platformy wymaga utworzenia konta i akceptacji niniejszego regulaminu. 
              Użytkownik zobowiązuje się do podania prawdziwych danych oraz korzystania z platformy zgodnie z jej przeznaczeniem.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Płatności i subskrypcje</h2>
            <p className="text-muted-foreground leading-relaxed">
              Platforma oferuje plany subskrypcyjne z 14-dniowym bezpłatnym okresem próbnym. 
              Płatności są przetwarzane za pośrednictwem Stripe. Szczegóły cennika dostępne są na stronie z planami.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Odpowiedzialność</h2>
            <p className="text-muted-foreground leading-relaxed">
              Usługodawca dokłada wszelkich starań, aby platforma działała poprawnie i bezpiecznie. 
              Usługodawca nie ponosi odpowiedzialności za treści wprowadzane przez Użytkowników.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Rozwiązanie umowy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Użytkownik może w każdej chwili usunąć swoje konto i zaprzestać korzystania z platformy. 
              Usługodawca zastrzega sobie prawo do zawieszenia konta w przypadku naruszenia regulaminu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Postanowienia końcowe</h2>
            <p className="text-muted-foreground leading-relaxed">
              Regulamin wchodzi w życie z dniem publikacji. Usługodawca zastrzega sobie prawo do zmian regulaminu, 
              o czym Użytkownicy zostaną poinformowani drogą elektroniczną.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
};

export default Terms;
