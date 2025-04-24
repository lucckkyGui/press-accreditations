import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Users, Calendar, CheckCircle2, BarChart3, Cpu, Zap, Ticket } from "lucide-react";
import FAQSection from "@/components/home/FAQSection";

const PricingCard = ({ title, price, features, buttonText, isPrimary = false, onSelect }) => (
  <Card className={`flex flex-col ${isPrimary ? 'border-primary shadow-lg' : ''}`}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>Dla {title.toLowerCase()}</CardDescription>
      <div className="mt-2">
        <span className="text-3xl font-bold">{price}</span>
        {price !== "Darmowy" && <span className="text-muted-foreground"> / miesiąc</span>}
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="h-5 w-5 text-primary shrink-0 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button 
        className="w-full" 
        variant={isPrimary ? "default" : "outline"}
        onClick={onSelect}
      >
        {buttonText}
      </Button>
    </CardFooter>
  </Card>
);

const FeatureCard = ({ icon, title, description }) => (
  <Card className="h-full">
    <CardHeader>
      {icon}
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>{description}</p>
    </CardContent>
  </Card>
);

const Testimonial = ({ quote, author, role, company }) => (
  <div className="bg-background border rounded-lg p-6 shadow-sm">
    <p className="italic text-muted-foreground mb-4">{quote}</p>
    <div>
      <p className="font-medium">{author}</p>
      <p className="text-sm text-muted-foreground">{role}, {company}</p>
    </div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();

  const handleOrganizatorLogin = () => {
    navigate("/login", { state: { role: "organizator" } });
  };

  const handleGuestLogin = () => {
    navigate("/login", { state: { role: "guest" } });
  };
  
  const handleSelectPackage = (packageName) => {
    navigate("/purchase", { state: { selectedPackage: packageName } });
  };

  const handleViewTicketing = () => {
    navigate("/ticketing");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nagłówek */}
      <header className="border-b bg-background p-4">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Press Acreditations</span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" onClick={handleGuestLogin}>Zaloguj jako Gość</Button>
            <Button onClick={handleOrganizatorLogin}>Zaloguj jako Organizator</Button>
          </div>
        </div>
      </header>

      {/* Główna treść */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="container text-center max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">System Zarządzania Akredytacjami</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Zarządzaj akredytacjami prasowymi i wejściówkami na wydarzenia w prosty i efektywny sposób
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="gap-2" onClick={handleOrganizatorLogin}>
                <CheckCircle2 className="h-5 w-5" />
                Zaloguj się jako Organizator
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={() => handleSelectPackage('free-trial')}>
                <Zap className="h-5 w-5" />
                Wypróbuj za darmo
              </Button>
              <Button size="lg" variant="secondary" className="gap-2" onClick={handleViewTicketing}>
                <Ticket className="h-5 w-5" />
                System Biletowy
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 container">
          <h2 className="text-3xl font-bold text-center mb-12">Główne funkcjonalności</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Calendar className="h-8 w-8 text-primary mb-2" />}
              title="Zarządzanie wydarzeniami"
              description="Twórz i zarządzaj wydarzeniami, wydawaj akredytacje i monitoruj frekwencję w czasie rzeczywistym. Zyskaj pełną kontrolę nad listą gości."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-primary mb-2" />}
              title="Baza gości"
              description="Zarządzaj listą gości, przydzielaj im odpowiednie strefy i śledź ich status potwierdzenia. Personalizuj zaproszenia dla każdej grupy."
            />
            <FeatureCard 
              icon={<QrCode className="h-8 w-8 text-primary mb-2" />}
              title="Skanowanie QR"
              description="Szybka weryfikacja gości poprzez skanowanie kodów QR, działające również w trybie offline. Synchronizacja danych po ponownym połączeniu."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-8 w-8 text-primary mb-2" />}
              title="Szczegółowe statystyki"
              description="Analizuj dane uczestników, śledź potwierdzeń i obecności. Generuj raporty dla sponsorów i interesariuszy."
            />
            <FeatureCard 
              icon={<Cpu className="h-8 w-8 text-primary mb-2" />}
              title="Praca offline"
              description="Aplikacja działa również bez dostępu do internetu, a dane są synchronizowane automatycznie po przywróceniu połączenia."
            />
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-primary mb-2" />}
              title="Automatyczne powiadomienia"
              description="Wysyłaj automatyczne przypomnienia i aktualizacje do gości. Zwiększ frekwencję dzięki proaktywnemu informowaniu."
            />
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Co mówią nasi klienci</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Testimonial 
                quote="Press Acreditations znacznie usprawnił proces zarządzania akredytacjami na naszych konferencjach. Oszczędzamy mnóstwo czasu dzięki automatyzacji." 
                author="Anna Kowalska"
                role="Event Manager"
                company="TechConf"
              />
              <Testimonial 
                quote="Praca w trybie offline to zbawienie podczas wydarzeń z słabym zasięgiem. System działa bezbłędnie i synchronizuje dane po odzyskaniu połączenia." 
                author="Piotr Nowak"
                role="PR Director"
                company="MediaGroup"
              />
              <Testimonial 
                quote="Statystyki i raporty dają nam cenny wgląd w nasze wydarzenia. Teraz dokładnie wiemy, które sesje cieszą się największym zainteresowaniem." 
                author="Marta Lewandowska"
                role="CEO"
                company="EventPro"
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />

        {/* Pricing */}
        <section className="py-16 container">
          <h2 className="text-3xl font-bold text-center mb-4">Cennik</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Wybierz pakiet dopasowany do wielkości Twojego wydarzenia
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard
              title="Podstawowy"
              price="99 PLN"
              features={[
                "Do 100 gości",
                "Podstawowe zarządzanie wydarzeniami",
                "Skanowanie QR kodów",
                "Eksport listy gości",
                "1 organizator",
                "Email support",
              ]}
              buttonText="Wybierz pakiet"
              onSelect={() => handleSelectPackage("basic")}
            />
            <PricingCard
              title="Standard"
              price="299 PLN"
              features={[
                "Do 500 gości",
                "Zaawansowane zarządzanie wydarzeniami",
                "Skanowanie QR kodów",
                "Eksport danych",
                "Dostęp dla 3 organizatorów",
                "Priorytetowe wsparcie",
              ]}
              buttonText="Wybierz pakiet"
              isPrimary={true}
              onSelect={() => handleSelectPackage("standard")}
            />
            <PricingCard
              title="Premium"
              price="599 PLN"
              features={[
                "Nieograniczona liczba gości",
                "Pełne zarządzanie wydarzeniami",
                "Skanowanie QR kodów",
                "Zaawansowane raporty",
                "Dostęp dla 10 organizatorów",
                "Wsparcie premium 24/7",
              ]}
              buttonText="Wybierz pakiet"
              onSelect={() => handleSelectPackage("premium")}
            />
          </div>
          <div className="text-center mt-8">
            <Button variant="link" size="lg" onClick={() => handleSelectPackage("enterprise")}>
              Potrzebujesz rozwiązania dla większej organizacji? Sprawdź nasz pakiet Enterprise
            </Button>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6">Gotowy, by usprawnić zarządzanie wydarzeniami?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Dołącz do setek organizatorów, którzy już korzystają z Press Acreditations
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white hover:bg-white/90 text-primary hover:text-primary/90 border-primary-foreground"
              onClick={() => handleSelectPackage("free-trial")}
            >
              Rozpocznij 14-dniowy okres próbny
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12 border-t">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Press Acreditations</span>
              </div>
              <p className="text-muted-foreground">
                Kompleksowe rozwiązanie do zarządzania akredytacjami i wejściówkami na wydarzenia.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Produkt</h3>
              <ul className="space-y-2">
                <li><Button variant="link" className="p-0 h-auto">Funkcje</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Cennik</Button></li>
                <li><Button variant="link" className="p-0 h-auto">FAQ</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Dla kogo</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Wsparcie</h3>
              <ul className="space-y-2">
                <li><Button variant="link" className="p-0 h-auto">Centrum pomocy</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Kontakt</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Dokumentacja</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Status systemu</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Firma</h3>
              <ul className="space-y-2">
                <li><Button variant="link" className="p-0 h-auto">O nas</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Blog</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Kariera</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Prywatność</Button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2025 Press Acreditations. Wszelkie prawa zastrzeżone.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Button variant="ghost" size="icon">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                </svg>
              </Button>
              <Button variant="ghost" size="icon">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.286C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"></path>
                </svg>
              </Button>
              <Button variant="ghost" size="icon">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                </svg>
              </Button>
              <Button variant="ghost" size="icon">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
