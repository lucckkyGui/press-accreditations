import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Users, QrCode, Globe, Shield, BarChart3, Clock, Wifi, WifiOff,
  Smartphone, Mail, ArrowRight, CheckCircle2, TrendingUp, Award,
  Layers, Target, Rocket, FileBarChart, Radio, Brain, Presentation
} from 'lucide-react';

const metrics = [
  { label: 'Czas konfiguracji', value: '< 5 min', icon: Clock, color: 'text-emerald-500' },
  { label: 'Obsłużonych gości', value: '50,000+', icon: Users, color: 'text-blue-500' },
  { label: 'Uptime systemu', value: '99.9%', icon: TrendingUp, color: 'text-purple-500' },
  { label: 'Czas skanowania QR', value: '< 2s', icon: QrCode, color: 'text-amber-500' },
  { label: 'Obsługiwane języki', value: '10', icon: Globe, color: 'text-cyan-500' },
  { label: 'Tryb offline', value: 'Pełny', icon: WifiOff, color: 'text-rose-500' },
];

const modules = [
  {
    title: 'Zarządzanie wydarzeniami',
    desc: 'Tworzenie, publikacja, konfiguracja stref i limitów pojemności',
    icon: Layers,
    demoUrl: '/events',
  },
  {
    title: 'Zarządzanie gośćmi',
    desc: 'Import CSV, masowe operacje, filtrowanie, tabele wirtualizowane',
    icon: Users,
    demoUrl: '/guests',
  },
  {
    title: 'Skaner QR + Offline',
    desc: 'Skanowanie kodów QR z pełnym trybem offline i synchronizacją',
    icon: QrCode,
    demoUrl: '/scanner',
  },
  {
    title: 'RFID & Opaski',
    desc: 'Śledzenie wejść/wyjść ze stref, heatmapy w czasie rzeczywistym',
    icon: Radio,
    demoUrl: '/rfid-scanner',
  },
  {
    title: 'Analityka & Raporty',
    desc: 'Dashboard real-time, porównanie wydarzeń, eksport PDF z wykresami',
    icon: BarChart3,
    demoUrl: '/post-event-report',
  },
  {
    title: 'Mailing & Zaproszenia',
    desc: 'Edytor szablonów, masowa wysyłka, śledzenie otwarć',
    icon: Mail,
    demoUrl: '/invitation-editor',
  },
  {
    title: 'Akredytacje prasowe',
    desc: 'Dedykowany workflow rejestracji, weryfikacji i zatwierdzania mediów',
    icon: Award,
    demoUrl: '/media-portal',
  },
  {
    title: 'AI & Bezpieczeństwo',
    desc: 'Rozpoznawanie twarzy, detekcja oszustw, weryfikacja biometryczna',
    icon: Brain,
    demoUrl: '/advanced-guests',
  },
];

const competitors = [
  { name: 'Eventbrite', weakness: 'Wysokie prowizje (3.7%+), brak offline', ourAdvantage: 'Flat pricing, pełny offline' },
  { name: 'Cvent', weakness: 'Koszt >$10k/rok, złożona konfiguracja', ourAdvantage: '5 min setup, 10x tańszy' },
  { name: 'Bizzabo', weakness: 'Brak wielojęzyczności, brak akredytacji', ourAdvantage: '10 języków, dedykowany workflow' },
  { name: 'Whova', weakness: 'Słaby check-in, brak RFID', ourAdvantage: 'QR+RFID+Face ID, <2s scan' },
];

const techStack = [
  'React 18 + TypeScript', 'Supabase (PostgreSQL)', 'Edge Functions (Deno)',
  'PWA / Offline-first', 'Row-Level Security', 'TanStack React Query',
];

const PitchDeck = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-600/15 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container relative z-10 py-20 px-6">
          <div className="flex items-center gap-3 mb-6">
            <Presentation className="h-5 w-5 text-blue-400" />
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30">
              Investor Pitch Deck
            </Badge>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Press Accreditations
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/60 max-w-2xl mb-12">
            Platforma do zarządzania akredytacjami i wydarzeniami nowej generacji.
            Setup w 5 minut. Offline-first. AI-powered.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 gap-2 shadow-lg shadow-blue-500/25"
              onClick={() => navigate('/dashboard')}
            >
              <Rocket className="h-5 w-5" />
              Uruchom demo
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 gap-2 backdrop-blur-sm"
              onClick={() => navigate('/post-event-report')}
            >
              <FileBarChart className="h-5 w-5" />
              Zobacz raporty
            </Button>
          </div>
        </div>
      </section>

      {/* KPI Metrics */}
      <section className="container px-6 py-16">
        <h2 className="text-3xl font-bold mb-8">Kluczowe metryki</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map(m => (
            <Card key={m.label} className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-5 text-center">
                <m.icon className={`h-8 w-8 mx-auto mb-3 ${m.color}`} />
                <div className="text-2xl font-bold text-white">{m.value}</div>
                <div className="text-white/50 text-sm mt-1">{m.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="container px-6 py-16">
        <h2 className="text-3xl font-bold mb-3">Moduły platformy</h2>
        <p className="text-white/50 mb-8 max-w-xl">Kliknij dowolny moduł, aby zobaczyć go w trybie demo z przykładowymi danymi.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map(mod => (
            <Card
              key={mod.title}
              className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer group"
              onClick={() => navigate(mod.demoUrl)}
            >
              <CardContent className="p-6">
                <mod.icon className="h-8 w-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-2">{mod.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{mod.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-blue-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Zobacz demo <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* USP Section */}
      <section className="container px-6 py-16">
        <h2 className="text-3xl font-bold mb-8">Unikalne przewagi (USP)</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap, title: '5-minutowy setup',
              desc: 'Od rejestracji do pierwszego check-inu w mniej niż 5 minut. Zero skomplikowanej konfiguracji — tworzysz wydarzenie, importujesz gości CSV i startujesz.',
            },
            {
              icon: WifiOff, title: 'Offline-first',
              desc: 'PWA z pełnym trybem offline: skanowanie QR, check-in, przeglądanie listy gości. Synchronizacja automatyczna po przywróceniu połączenia.',
            },
            {
              icon: Shield, title: 'Enterprise Security',
              desc: 'Row-Level Security, szyfrowane dane PII, biometryczna weryfikacja. Gotowość do RODO z granularną kontrolą dostępu do każdej tabeli.',
            },
          ].map(usp => (
            <Card key={usp.title} className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/10">
              <CardContent className="p-6">
                <usp.icon className="h-10 w-10 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{usp.title}</h3>
                <p className="text-white/60 leading-relaxed">{usp.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Competitive Analysis */}
      <section className="container px-6 py-16">
        <h2 className="text-3xl font-bold mb-8">Analiza konkurencji</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/50 font-medium">Konkurent</th>
                <th className="text-left py-3 px-4 text-white/50 font-medium">Słabość</th>
                <th className="text-left py-3 px-4 text-white/50 font-medium">Nasza przewaga</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map(c => (
                <tr key={c.name} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 font-medium text-white">{c.name}</td>
                  <td className="py-3 px-4 text-rose-400/80">{c.weakness}</td>
                  <td className="py-3 px-4 text-emerald-400/80 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {c.ourAdvantage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container px-6 py-16">
        <h2 className="text-3xl font-bold mb-8">Stack technologiczny</h2>
        <div className="flex flex-wrap gap-3">
          {techStack.map(t => (
            <Badge key={t} className="bg-white/10 text-white/80 border-white/20 hover:bg-white/20 py-2 px-4 text-sm">
              {t}
            </Badge>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container px-6 py-20">
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-white/10">
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Gotowy na prezentację?</h2>
            <p className="text-white/60 max-w-lg mx-auto mb-8">
              Kliknij poniżej, aby przejść do trybu demo i zobaczyć platformę w działaniu
              z przykładowymi danymi — bez logowania.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 gap-2 shadow-lg"
                onClick={() => navigate('/dashboard')}
              >
                <Smartphone className="h-5 w-5" />
                Dashboard demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 gap-2"
                onClick={() => navigate('/post-event-report')}
              >
                <BarChart3 className="h-5 w-5" />
                Raporty & Analityka
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 gap-2"
                onClick={() => navigate('/kiosk')}
              >
                <QrCode className="h-5 w-5" />
                Kiosk Check-In
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default PitchDeck;
