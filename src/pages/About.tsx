
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Users, Target, Award, Zap, Globe, Shield, 
  QrCode, Mail, BarChart3, Calendar, WifiOff,
  TrendingUp, DollarSign, MapPin, Rocket, LineChart,
  Layers, CheckCircle2, Building2, Briefcase
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
        <div className="container py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót
          </Button>
          <Button onClick={() => navigate("/pitch")} className="gap-2">
            <Briefcase className="h-4 w-4" />
            Pitch Deck
          </Button>
        </div>
      </header>

      <main>
        {/* Hero — investor-focused */}
        <section className="py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Rocket className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Dla Inwestora</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Budujemy europejskiego lidera
              <br />
              <span className="text-primary">zarządzania akredytacjami eventowymi</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Press Accreditations to polska platforma SaaS, która automatyzuje cały proces zarządzania 
              gośćmi na wydarzeniach — od zaproszenia po check-in na bramce. Cel: <strong>10 mln PLN ARR 
              w 3 lata</strong> i ekspansja na 10 rynków europejskich.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button size="lg" onClick={() => navigate("/pitch")}>
                Zobacz Pitch Deck
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/contact")}>
                Umów rozmowę
              </Button>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-2">Kluczowe liczby</h2>
              <p className="text-muted-foreground">Metryki potwierdzające gotowość produktu</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { value: formatStat(stats?.events ?? 0), label: "Wydarzeń w systemie" },
                { value: formatStat(stats?.guests ?? 0), label: "Zarządzanych gości" },
                { value: "<2s", label: "Czas skanowania QR" },
                { value: "99.9%", label: "Uptime platformy" },
                { value: "10", label: "Języków natywnie" },
                { value: "15+", label: "Modułów funkcjonalnych" },
              ].map((stat, idx) => (
                <Card key={idx} className="text-center border-0 bg-primary/5">
                  <CardContent className="p-6">
                    <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Who We Are */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Building2 className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Kim jesteśmy</h2>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Jesteśmy <strong className="text-foreground">polskim zespołem produktowo-technologicznym</strong>, 
                    który od podstaw zbudował platformę do zarządzania akredytacjami i gośćmi na wydarzeniach. 
                    Łączymy głębokie zrozumienie branży eventowej z nowoczesnym podejściem do budowy oprogramowania SaaS.
                  </p>
                  <p>
                    Nasz produkt powstał z realnej potrzeby rynkowej — organizatorzy wydarzeń w Europie Środkowej 
                    nie mają dostępu do narzędzi, które byłyby jednocześnie <strong className="text-foreground">proste, 
                    przystępne cenowo i wielojęzyczne</strong>. Istniejące rozwiązania (Eventbrite, Cvent, Bizzabo) 
                    są albo zbyt drogie, zbyt złożone, albo nie obsługują rynków lokalnych.
                  </p>
                  <p>
                    Wyróżnia nas <strong className="text-foreground">architektura offline-first</strong> — krytyczna 
                    dla eventów plenerowych, gdzie zasięg sieci jest niepewny. Nasz skaner QR działa bez internetu, 
                    a dane synchronizują się automatycznie. To przewaga, której nie oferuje żaden z konkurentów.
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Target className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Problem i rozwiązanie</h2>
                </div>
                <div className="space-y-4">
                  <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-destructive mb-2">❌ Problem</h3>
                      <p className="text-sm text-muted-foreground">
                        Organizatorzy eventów tracą godziny na ręczne zarządzanie listami gości, 
                        wysyłkę zaproszeń i odprawę na bramce. Istniejące narzędzia są drogie 
                        (Cvent: od $2000/mies.), skomplikowane lub nie działają offline.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-primary mb-2">✅ Rozwiązanie</h3>
                      <p className="text-sm text-muted-foreground">
                        Press Accreditations automatyzuje cały workflow: 5-minutowa konfiguracja, 
                        import gości z CSV, automatyczny mailing z QR, skaner offline na telefonie. 
                        Wszystko w jednym narzędziu, od 99 PLN/mies.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Competitive Advantages */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Award className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Przewagi konkurencyjne (USP)</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Dlaczego wygrywamy z Eventbrite, Cvent, Bizzabo i Whova
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: WifiOff,
                  title: "Offline-first",
                  desc: "Jedyna platforma na rynku, gdzie skanowanie QR i check-in działają w pełni bez internetu. Krytyczne dla festiwali i eventów plenerowych.",
                },
                {
                  icon: Globe,
                  title: "10 języków natywnie",
                  desc: "PL, EN, DE, ES, PT, RU, AR, ZH, JA, HI — gotowość na ekspansję europejską i globalną bez konieczności lokalizacji.",
                },
                {
                  icon: Zap,
                  title: "5-minutowy setup",
                  desc: "Od rejestracji do wysyłki pierwszych zaproszeń w 5 minut. Cvent wymaga wielogodzinnego onboardingu.",
                },
                {
                  icon: DollarSign,
                  title: "10x niższa cena",
                  desc: "Plany od 99 PLN/mies. vs Cvent ($2000+/mies.) i Bizzabo ($1000+/mies.). Dostępność dla SMB i mid-market.",
                },
                {
                  icon: QrCode,
                  title: "Skaner <2 sekundy",
                  desc: "Najszybszy czas skanowania w branży. PWA — bez instalacji aplikacji. Działa na każdym telefonie z kamerą.",
                },
                {
                  icon: Shield,
                  title: "RODO by design",
                  desc: "Zero danych wrażliwych (brak PESEL), szyfrowanie, audit log, role-based access. Gotowość na europejskie regulacje.",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Card key={idx} className="group hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="inline-flex p-3 rounded-xl mb-4 bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Product Modules */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Layers className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">15+ modułów w jednej platformie</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Pełny stack eventowy — od zaproszenia po raport post-event
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { icon: QrCode, name: "Skaner QR" },
                { icon: Mail, name: "Smart Mailing" },
                { icon: Users, name: "Zarządzanie gośćmi" },
                { icon: BarChart3, name: "Analityka real-time" },
                { icon: Calendar, name: "Multi-event" },
                { icon: Shield, name: "Bezpieczeństwo" },
                { icon: Globe, name: "10 języków" },
                { icon: WifiOff, name: "Tryb offline" },
                { icon: Layers, name: "Portal prasowy" },
                { icon: MapPin, name: "Strefy & RFID" },
                { icon: CheckCircle2, name: "Self check-in kiosk" },
                { icon: TrendingUp, name: "Predykcje AI" },
                { icon: LineChart, name: "Raporty PDF" },
                { icon: Zap, name: "Powiadomienia push" },
                { icon: Users, name: "Czat zespołowy" },
              ].map((mod, idx) => {
                const Icon = mod.icon;
                return (
                  <Card key={idx} className="text-center p-4 hover:border-primary/40 transition-colors">
                    <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-xs font-medium">{mod.name}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Growth Strategy */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Strategia wzrostu</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Rok 1: Polska</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Walidacja product-market fit na rynku polskim</p>
                  <p>• Pierwsi płacący klienci, bootstrapping</p>
                  <p>• Cel: 100k PLN MRR przed rundą</p>
                  <p>• Ekspansja do UK (miesiąc 3)</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Rok 2: Europa Zachodnia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Wejście na rynki DE, ES, PT, FR</p>
                  <p>• Budowa zespołów sprzedażowych</p>
                  <p>• AI Chatbot obsługujący 70-80% supportu</p>
                  <p>• Runda Pre-seed/Seed: 800k–1,2 mln PLN</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Rok 3: Skala</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• 10 rynków europejskich</p>
                  <p>• Cel: 10 mln PLN ARR</p>
                  <p>• Marża netto ~50%</p>
                  <p>• Docelowa wycena: 50 mln PLN</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Investment Ask */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Runda inwestycyjna</h2>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Planujemy pozyskanie <strong className="text-foreground">800 tys. – 1,2 mln PLN</strong> w 
                    rundzie Pre-seed/Seed w zamian za <strong className="text-foreground">10–20% udziałów</strong>.
                  </p>
                  <p>
                    Strategia zakłada bootstrapping do poziomu ~100k PLN MRR przed pozyskaniem inwestora, 
                    co maksymalizuje wycenę i minimalizuje rozwodnienie udziałów założyciela.
                  </p>
                  <p className="font-medium text-foreground">Przeznaczenie środków:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                      <span>Budowa zespołów sprzedażowych na rynkach UE</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                      <span>Marketing międzynarodowy i pozycjonowanie marki</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                      <span>Compliance GDPR/RODO na nowych rynkach</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                      <span>Rozwój modułów AI (chatbot, predykcje frekwencji)</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Card className="border-0 bg-primary/5">
                <CardContent className="p-8 space-y-6">
                  <h3 className="font-bold text-lg text-center mb-6">Kluczowe parametry</h3>
                  {[
                    { label: "Runda", value: "Pre-seed / Seed" },
                    { label: "Kwota", value: "800k–1,2 mln PLN" },
                    { label: "Udziały", value: "10–20%" },
                    { label: "Docelowy ARR (rok 3)", value: "10 mln PLN" },
                    { label: "Docelowa wycena", value: "50 mln PLN" },
                    { label: "Marża netto (rok 3)", value: "~50%" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-border/50 pb-3 last:border-0">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="font-bold text-primary">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Zainteresowany współpracą?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto text-lg">
              Zapraszamy do kontaktu w celu omówienia szczegółów inwestycji, 
              prezentacji demo platformy i poznania naszego zespołu.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => navigate("/pitch")}
                className="gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Pitch Deck
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate("/contact")}
              >
                Skontaktuj się z nami
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
