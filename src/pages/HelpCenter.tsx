
import React, { useState } from 'react';
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, BookOpen, Users, QrCode, Mail, Shield, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
  {
    title: 'Rozpoczęcie pracy',
    icon: Zap,
    color: 'text-primary',
    items: [
      { q: 'Jak stworzyć pierwsze wydarzenie?', a: 'Przejdź do zakładki "Wydarzenia" w panelu bocznym i kliknij "Nowe wydarzenie". Wypełnij formularz z nazwą, datą i lokalizacją.' },
      { q: 'Jak dodać gości do wydarzenia?', a: 'W zakładce "Goście" możesz dodawać gości ręcznie lub importować listę z pliku CSV/Excel. System automatycznie wygeneruje kody QR.' },
      { q: 'Jak wysłać zaproszenia?', a: 'Przejdź do zakładki "Dashboard" → "Zaproszenia". Wybierz gości i szablon e-mail, a następnie wyślij zaproszenia masowo.' },
    ]
  },
  {
    title: 'Zarządzanie gośćmi',
    icon: Users,
    color: 'text-secondary',
    items: [
      { q: 'Jak importować gości z pliku?', a: 'Kliknij "Importuj gości" i przeciągnij plik CSV lub Excel. System rozpozna kolumny automatycznie: imię, nazwisko, email, firma, telefon.' },
      { q: 'Jak edytować dane gościa?', a: 'Kliknij na wiersz gościa w tabeli, aby otworzyć formularz edycji. Możesz zmienić dane kontaktowe, strefę i status.' },
      { q: 'Jak usunąć gości masowo?', a: 'Zaznacz checkboxy przy wybranych gościach i użyj przycisku "Akcje masowe" → "Usuń zaznaczonych".' },
    ]
  },
  {
    title: 'Skaner QR i check-in',
    icon: QrCode,
    color: 'text-info',
    items: [
      { q: 'Jak działa skaner QR?', a: 'Otwórz zakładkę "Skaner QR", zezwól na dostęp do kamery i nakieruj ją na kod QR gościa. System automatycznie zweryfikuje i zarejestruje check-in.' },
      { q: 'Czy skaner działa offline?', a: 'Tak! Skaner zapisuje dane check-in lokalnie i synchronizuje je po przywróceniu połączenia internetowego.' },
      { q: 'Jak obsłużyć self-check-in kiosk?', a: 'Przejdź do /kiosk — tryb pełnoekranowy umożliwia gościom samodzielne skanowanie kodów QR.' },
    ]
  },
  {
    title: 'E-mail i komunikacja',
    icon: Mail,
    color: 'text-accent',
    items: [
      { q: 'Jak skonfigurować wysyłkę e-maili?', a: 'W Ustawieniach → Integracja e-mail dodaj swój klucz API Resend i skonfiguruj domenę nadawczą.' },
      { q: 'Jak śledzić otwarcia e-maili?', a: 'System automatycznie śledzi otwarcia zaproszeń. Statystyki widoczne są w kolumnie "Status e-mail" w tabeli gości.' },
      { q: 'Jak ponowić nieudane wysyłki?', a: 'Przejdź do zakładki "Kolejka e-mail" w panelu gości. Nieudane wiadomości można ponowić ręcznie lub ustawić automatyczną ponowną próbę.' },
    ]
  },
  {
    title: 'Bezpieczeństwo i RODO',
    icon: Shield,
    color: 'text-success',
    items: [
      { q: 'Czy platforma jest zgodna z RODO?', a: 'Tak. Dane osobowe gości są przetwarzane zgodnie z RODO. Stosujemy szyfrowanie, kontrolę dostępu opartą na rolach (RBAC) i Row-Level Security w bazie danych.' },
      { q: 'Kto ma dostęp do danych gości?', a: 'Tylko organizator wydarzenia i administratorzy mają dostęp do danych gości danego wydarzenia dzięki polityce RLS.' },
      { q: 'Jak usunąć dane po wydarzeniu?', a: 'W ustawieniach wydarzenia możesz wyeksportować dane, a następnie usunąć wydarzenie wraz ze wszystkimi danymi gości.' },
    ]
  },
];

const HelpCenter = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Centrum pomocy</h1>
        <p className="text-muted-foreground mt-1">Znajdź odpowiedzi na najczęściej zadawane pytania</p>
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj w pomocy..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6">
        {filtered.map((cat) => (
          <Card key={cat.title}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <cat.icon className={`h-5 w-5 ${cat.color}`} />
                {cat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {cat.items.map((item, i) => (
                  <AccordionItem key={i} value={`${cat.title}-${i}`}>
                    <AccordionTrigger className="text-sm font-medium text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Brak wyników dla "{search}"</p>
            <Button variant="link" onClick={() => setSearch('')}>Wyczyść wyszukiwanie</Button>
          </div>
        )}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-center justify-between py-6">
          <div>
            <h3 className="font-semibold text-foreground">Potrzebujesz więcej pomocy?</h3>
            <p className="text-sm text-muted-foreground">Porozmawiaj z naszym AI asystentem</p>
          </div>
          <Button onClick={() => navigate('/ai-support')} className="gap-2">
            AI Support <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpCenter;
