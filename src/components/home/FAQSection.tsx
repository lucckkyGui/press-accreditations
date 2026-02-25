import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "Jak szybko mogę skonfigurować system?",
    answer: "W mniej niż 5 minut. Załóż konto, dodaj szczegóły wydarzenia, wgraj listę gości (CSV lub ręcznie) i zacznij wysyłać zaproszenia. Nie potrzebujesz żadnej wiedzy technicznej — intuicyjny interfejs przeprowadzi Cię przez każdy krok."
  },
  {
    question: "Jak działa system zaproszeń?",
    answer: "To proste: 1) Wybierz profesjonalny szablon e-mail lub stwórz własny, 2) Zaimportuj listę gości, 3) Kliknij wyślij. Każde zaproszenie zawiera unikalny kod QR do check-inu. Otworzenia, dostawy i odpowiedzi śledzisz w dashboardzie w czasie rzeczywistym."
  },
  {
    question: "Czy mogę dostosować szablony zaproszeń?",
    answer: "Oczywiście! Oferujemy gotowe szablony na konferencje, gale, eventy prasowe i więcej. Możesz w pełni dostosować kolory, logotypy, tekst i układ do swojej marki. Szablony zapisujesz na przyszłość — konfiguracja raz, użycie wielokrotne."
  },
  {
    question: "A co z masowymi zaproszeniami?",
    answer: "Wyślij tysiące spersonalizowanych zaproszeń jednym kliknięciem. System obsługuje dostawy e-mail, wykrywa bouncy i automatycznie ponawia nieudane wysyłki. Możesz zaplanować wysyłki na optymalny czas i segmentować listę gości."
  },
  {
    question: "Jak działa weryfikacja kodem QR?",
    answer: "Każdy gość otrzymuje unikalny kod QR w zaproszeniu. Na miejscu wystarczy zeskanować go telefonem lub naszym skanerem. Check-in trwa mniej niż 2 sekundy — nawet offline. Dane synchronizują się automatycznie po przywróceniu połączenia."
  },
  {
    question: "Czy system jest bezpieczny i zgodny z RODO?",
    answer: "Tak. Stosujemy szyfrowanie AES-256, bezpieczny hosting w chmurze i pełną zgodność z RODO. Każdy kod QR jest kryptograficznie unikalny. Kontrola dostępu pozwala precyzyjnie określić, kto widzi jakie dane."
  },
  {
    question: "Jakie integracje są dostępne?",
    answer: "Łącz się z narzędziami, których używasz: Google Calendar, Outlook, Slack i popularne systemy CRM. Eksportuj dane w wielu formatach (CSV, Excel, PDF). API umożliwia własne integracje dla klientów Enterprise."
  },
  {
    question: "Czy muszę coś instalować?",
    answer: "Nie! Press Accreditations to aplikacja webowa działająca na każdym urządzeniu z przeglądarką. Do check-inu na evencie wystarczy nasza Progressive Web App, która działa offline — dodaj ją do ekranu głównego telefonu."
  }
];

const FAQSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Najczęściej zadawane pytania
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Wszystko co musisz wiedzieć o Press Accreditations. 
            Nie znalazłeś odpowiedzi? <a href="/contact" className="text-primary hover:underline">Napisz do nas</a>.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-background border rounded-lg px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-medium hover:no-underline py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
