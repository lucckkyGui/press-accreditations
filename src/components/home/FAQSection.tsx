
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Czym jest system Press Acreditations?",
    answer: "Press Acreditations to kompleksowe narzędzie do zarządzania akredytacjami prasowymi i wejściówkami na wydarzenia. Pozwala organizatorom na łatwe zarządzanie listą gości, wysyłanie zaproszeń, weryfikację uczestników za pomocą kodów QR oraz śledzenie frekwencji w czasie rzeczywistym."
  },
  {
    question: "Jakie funkcje oferuje system?",
    answer: "System oferuje m.in.: zarządzanie wydarzeniami, zarządzanie listą gości, personalizowane zaproszenia, weryfikację gości za pomocą kodów QR (także w trybie offline), statystyki i raporty, powiadomienia dla gości oraz wiele innych."
  },
  {
    question: "Czy można korzystać z systemu bez dostępu do internetu?",
    answer: "Tak, aplikacja posiada tryb offline, który umożliwia skanowanie kodów QR i weryfikację gości nawet bez dostępu do internetu. Dane synchronizują się automatycznie po przywróceniu połączenia."
  },
  {
    question: "Czy mogę zintegrować system z innymi narzędziami?",
    answer: "Tak, Press Acreditations oferuje możliwości integracji z popularnymi narzędziami do zarządzania wydarzeniami, systemami e-mail marketingu oraz kalendarzami. Szczegóły dostępne są w panelu administracyjnym."
  },
  {
    question: "Ile kosztuje korzystanie z systemu?",
    answer: "Oferujemy różne pakiety cenowe dopasowane do potrzeb różnych rodzajów wydarzeń - od małych spotkań po duże konferencje. Szczegółowy cennik znajdziesz w sekcji 'Cennik' na naszej stronie."
  },
  {
    question: "Czy mogę wypróbować system przed zakupem?",
    answer: "Tak, oferujemy darmowy okres próbny, podczas którego możesz przetestować wszystkie funkcje systemu. Aby rozpocząć darmowy okres próbny, zarejestruj się i wybierz opcję 'Wypróbuj za darmo'."
  },
  {
    question: "Jak zabezpieczone są dane w systemie?",
    answer: "Bezpieczeństwo danych jest naszym priorytetem. Stosujemy najnowsze technologie szyfrowania, regularne audyty bezpieczeństwa i zgodność z RODO/GDPR. Wszystkie dane są przechowywane na bezpiecznych serwerach z regularnym tworzeniem kopii zapasowych."
  }
];

const FAQSection = () => {
  return (
    <div className="py-12 bg-muted/30">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Najczęściej zadawane pytania</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Odpowiedzi na najczęstsze pytania dotyczące systemu Press Acreditations.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg">{item.question}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
