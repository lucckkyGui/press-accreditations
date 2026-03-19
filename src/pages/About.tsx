
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Users, Target, Award, Zap, Globe, Shield, 
  QrCode, Mail, BarChart3, Calendar, Smartphone, Wifi, WifiOff,
  FileText, Bell, MessageSquare, Scan, Ticket, MapPin, 
  Lock, Eye, Clock, CheckCircle2, Layers, Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const About = () => {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["about-stats"],
    queryFn: async () => {
      const [eventsRes, guestsRes] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("guests").select("id", { count: "exact", head: true }),
      ]);
      return {
        events: eventsRes.count ?? 0,
        guests: guestsRes.count ?? 0,
      };
    },
  });

  const formatStat = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k+`;
    if (value > 0) return `${value}+`;
    return "0";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-4">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Kim jesteśmy?
              <br />
              <span className="text-primary">Press Accreditations</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Jesteśmy polskim zespołem twórców oprogramowania, specjalizującym się w narzędziach 
              do zarządzania wydarzeniami i akredytacjami. Budujemy platformę, która pozwala organizatorom 
              eventów — od kameralnych konferencji po wielotysięczne festiwale — zarządzać gośćmi, 
              zaproszeniami i check-inem w jednym miejscu, bez zbędnej złożoności.
            </p>
          </div>
        </section>

        {/* Mission & Stats */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Nasza misja</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Naszą misją jest zrewolucjonizowanie sposobu, w jaki organizatorzy zarządzają akredytacjami 
                  i gośćmi na wydarzeniach. Wierzymy, że <strong>konfiguracja eventu powinna zająć 5 minut, 
                  nie 5 godzin</strong>. Dlatego stworzyliśmy platformę, która automatyzuje powtarzalne zadania 
                  — od wysyłki spersonalizowanych zaproszeń z kodem QR, po odprawę gości na bramce.
                </p>
                <p className="text-muted-foreground mb-4">
                  Pozycjonujemy się jako zwinna, wyspecjalizowana alternatywa dla gigantów rynkowych takich jak 
                  Eventbrite (wysokie opłaty transakcyjne), Cvent (ogromna złożoność i koszt) czy Bizzabo (brak 
                  natywnej wielojęzyczności). Nasz system działa w <strong>10 językach</strong>, obsługuje 
                  <strong> tryb offline</strong> i jest gotowy do użycia jako aplikacja PWA na każdym urządzeniu.
                </p>
                <p className="text-muted-foreground">
                  Kluczowym wyróżnikiem jest architektura <strong>offline-first</strong> — skanowanie kodów QR 
                  działa nawet bez połączenia z internetem, a dane synchronizują się automatycznie po 
                  przywróceniu łączności. To krytyczna funkcja dla wydarzeń plenerowych i lokalizacji 
                  o słabym zasięgu sieci.
                </p>
              </div>
              <Card className="bg-primary/5 border-0">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <p className="text-4xl font-bold text-primary">
                        {formatStat(stats?.events ?? 0)}
                      </p>
                      <p className="text-muted-foreground">Wydarzeń</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-primary">
                        {formatStat(stats?.guests ?? 0)}
                      </p>
                      <p className="text-muted-foreground">Gości</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-primary">99.9%</p>
                      <p className="text-muted-foreground">Uptime</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-primary">{"<2s"}</p>
                      <p className="text-muted-foreground">Czas skanowania QR</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-primary">10</p>
                      <p className="text-muted-foreground">Obsługiwanych języków</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-primary">24/7</p>
                      <p className="text-muted-foreground">Wsparcie techniczne</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Layers className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Główne funkcje platformy</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Kompleksowy zestaw narzędzi do zarządzania każdym aspektem wydarzenia
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: QrCode,
                  title: "Skanowanie kodów QR",
                  description: "Weryfikacja gości w mniej niż 2 sekundy. Skaner działa w pełni offline — dane synchronizują się automatycznie po odzyskaniu połączenia. Obsługa kamer urządzeń mobilnych bez konieczności instalacji dodatkowych aplikacji.",
                  color: "bg-primary/10 text-primary"
                },
                {
                  icon: Mail,
                  title: "Smart Mailing",
                  description: "Automatyczna wysyłka spersonalizowanych zaproszeń z unikalnym kodem QR dla każdego gościa. Szablony e-mail, kolejkowanie wysyłki, śledzenie otwarć i ponowne wysyłki do gości, którzy nie otworzyli wiadomości.",
                  color: "bg-secondary/10 text-secondary"
                },
                {
                  icon: Users,
                  title: "Zarządzanie gośćmi",
                  description: "Import gości z plików CSV, kategoryzacja według typu biletu (uczestnik, media, crew, VIP, ochrona, vendor, medyk, promotor), przypisywanie wielu stref dostępu jednocześnie. Pełna historia zmian i statusów.",
                  color: "bg-accent/10 text-accent"
                },
                {
                  icon: BarChart3,
                  title: "Analityka w czasie rzeczywistym",
                  description: "Dashboard na żywo z danymi o frekwencji, tempie check-inów, rozkładzie gości w strefach. Raporty PDF dla sponsorów, porównania między wydarzeniami i predykcje AI dotyczące frekwencji.",
                  color: "bg-primary/10 text-primary"
                },
                {
                  icon: Calendar,
                  title: "Multi-event",
                  description: "Zarządzaj wieloma wydarzeniami jednocześnie z jednego konta. Kopiuj ustawienia, listy gości i szablony między eventami. Dedykowane widoki i statystyki dla każdego wydarzenia.",
                  color: "bg-destructive/10 text-destructive"
                },
                {
                  icon: Shield,
                  title: "Bezpieczeństwo & RODO",
                  description: "Szyfrowanie danych end-to-end, granularna kontrola dostępu oparta na rolach (admin, organizator, staff, gość), audit log wszystkich operacji. Pełna zgodność z RODO — bez zbierania danych wrażliwych (PESEL itp.).",
                  color: "bg-secondary/10 text-secondary"
                },
                {
                  icon: Ticket,
                  title: "Kategorie akredytacji",
                  description: "Elastyczny system typów biletów: uczestnik, media, crew, VIP, ochrona, vendor, medyk, promotor i inne. Każda kategoria może mieć przypisane własne strefy dostępu: Strefa główna, VIP, Backstage, Strefa medialna, techniczna, Scena.",
                  color: "bg-accent/10 text-accent"
                },
                {
                  icon: WifiOff,
                  title: "Tryb offline (PWA)",
                  description: "Aplikacja działa jako Progressive Web App — instaluje się na telefonie jak natywna aplikacja. Skanowanie QR, przeglądanie listy gości i check-in działają bez połączenia z internetem. Automatyczna synchronizacja po reconnect.",
                  color: "bg-primary/10 text-primary"
                },
                {
                  icon: Globe,
                  title: "10 języków natywnie",
                  description: "Interfejs dostępny w: polskim, angielskim, niemieckim, hiszpańskim, portugalskim, rosyjskim, arabskim, chińskim, japońskim i hindi. Każdy organizator może przełączyć język jednym kliknięciem.",
                  color: "bg-destructive/10 text-destructive"
                },
                {
                  icon: FileText,
                  title: "Portal prasowy & dokumenty",
                  description: "Dedykowany portal do rejestracji mediów na wydarzenia. Workflow zatwierdzania rejestracji, upload i weryfikacja dokumentów prasowych, zarządzanie grupami medialnymi i kontaktami.",
                  color: "bg-secondary/10 text-secondary"
                },
                {
                  icon: Bell,
                  title: "System powiadomień",
                  description: "Powiadomienia push w przeglądarce i in-app. Szablony powiadomień, harmonogramowanie wysyłki, centrum powiadomień z historią. Automatyczne alerty o zmianach statusu gościa i nowych rejestracjach.",
                  color: "bg-accent/10 text-accent"
                },
                {
                  icon: Scan,
                  title: "RFID & opaski",
                  description: "Zaawansowany system zarządzania opaskami RFID: przypisywanie do gości, skanowanie stref, śledzenie obecności w strefach w czasie rzeczywistym (zone presence), mapa cieplna lokalizacji gości.",
                  color: "bg-primary/10 text-primary"
                },
                {
                  icon: MessageSquare,
                  title: "Czat w czasie rzeczywistym",
                  description: "Wbudowany system czatu do komunikacji między organizatorami i staffem. Konwersacje przypisane do wydarzeń, historia wiadomości, powiadomienia o nowych wiadomościach.",
                  color: "bg-destructive/10 text-destructive"
                },
                {
                  icon: Fingerprint,
                  title: "Rozpoznawanie twarzy",
                  description: "Opcjonalny moduł biometryczny do weryfikacji tożsamości gości — bulk enrollment zdjęć, automatyczne dopasowanie na bramce. Dodatkowa warstwa bezpieczeństwa dla wydarzeń VIP.",
                  color: "bg-secondary/10 text-secondary"
                },
                {
                  icon: Eye,
                  title: "Kiosk self check-in",
                  description: "Tryb kiosku do samodzielnej odprawy gości — wystarczy umieścić tablet przy wejściu. Gość skanuje swój kod QR lub podaje dane, a system automatycznie rejestruje przybycie.",
                  color: "bg-accent/10 text-accent"
                },
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <Card key={idx} className="group hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                    <CardContent className="p-6">
                      <div className={`inline-flex p-3 rounded-xl mb-4 ${feature.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Jak to działa?</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Od rejestracji do check-inu w 4 prostych krokach
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Utwórz wydarzenie", desc: "Podaj nazwę, datę, lokalizację i kategorię. Konfiguracja zajmuje dosłownie 5 minut." },
                { step: "2", title: "Dodaj gości", desc: "Importuj listę gości z CSV lub dodaj ręcznie. Przypisz typ biletu i strefy dostępu." },
                { step: "3", title: "Wyślij zaproszenia", desc: "Jednym kliknięciem wyślij spersonalizowane e-maile z unikalnym kodem QR dla każdego gościa." },
                { step: "4", title: "Skanuj na wejściu", desc: "Użyj telefonu lub tabletu jako skanera. Działa offline — idealne na eventy plenerowe." },
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Award className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Nasze wartości</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Zap, title: "Prostota", description: "Konfiguracja wydarzenia w 5 minut. Intuicyjny interfejs, który nie wymaga szkolenia." },
                { icon: Shield, title: "Bezpieczeństwo", description: "Szyfrowanie danych, kontrola dostępu, pełna zgodność z RODO. Zero danych wrażliwych." },
                { icon: WifiOff, title: "Offline-first", description: "Krytyczne funkcje działają bez internetu. Żadnych przestojów na wydarzeniu." },
                { icon: Globe, title: "Globalność", description: "10 języków natywnie, wsparcie dla wydarzeń międzynarodowych i wielokulturowych." },
              ].map((value, idx) => {
                const Icon = value.icon;
                return (
                  <Card key={idx} className="text-center">
                    <CardHeader>
                      <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{value.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Gotowy, aby uprościć zarządzanie wydarzeniami?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Dołącz do organizatorów, którzy już korzystają z Press Accreditations. 
              Rozpocznij 14-dniowy okres próbny — bez karty kredytowej.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => navigate("/auth/register")}
              >
                Rozpocznij za darmo
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate("/contact")}
              >
                Skontaktuj się
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Press Accreditations. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
