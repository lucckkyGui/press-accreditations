
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Users, Calendar } from "lucide-react";

const PricingCard = ({ title, price, features, buttonText, isPrimary = false }) => (
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
      <Button className="w-full" variant={isPrimary ? "default" : "outline"}>
        {buttonText}
      </Button>
    </CardFooter>
  </Card>
);

const HomePage = () => {
  const navigate = useNavigate();

  const handleOrganizatorLogin = () => {
    navigate("/login", { state: { role: "organizator" } });
  };

  const handleGuestLogin = () => {
    navigate("/login", { state: { role: "guest" } });
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
      <main className="flex-1 container py-8 md:py-12">
        {/* Hero Section */}
        <section className="text-center mb-16 md:mb-24">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">System Zarządzania Akredytacjami</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Zarządzaj akredytacjami prasowymi i wejściówkami na wydarzenia w prosty i efektywny sposób
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={handleOrganizatorLogin}>
              Zaloguj się jako Organizator
            </Button>
            <Button size="lg" variant="outline" onClick={handleGuestLogin}>
              Zaloguj się jako Gość
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16 md:mb-24">
          <h2 className="text-3xl font-bold text-center mb-8">Główne funkcjonalności</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Zarządzanie wydarzeniami</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Twórz i zarządzaj wydarzeniami, wydawaj akredytacje i monitoruj frekwencję w czasie rzeczywistym.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Baza gości</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Zarządzaj listą gości, przydzielaj im odpowiednie strefy i śledź ich status potwierdzenia.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <QrCode className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Skanowanie QR</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Szybka weryfikacja gości poprzez skanowanie kodów QR, działające również w trybie offline.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pricing */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Cennik</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
            Wybierz pakiet dopasowany do wielkości Twojego wydarzenia
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              title="Podstawowy"
              price="99 PLN"
              features={[
                "Do 100 gości",
                "Podstawowe zarządzanie wydarzeniami",
                "Skanowanie QR kodów",
                "Eksport listy gości",
              ]}
              buttonText="Wybierz pakiet"
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
              ]}
              buttonText="Wybierz pakiet"
              isPrimary={true}
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
                "Wsparcie premium",
              ]}
              buttonText="Wybierz pakiet"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-6 border-t">
        <div className="container text-center">
          <p className="text-muted-foreground">© 2025 Press Acreditations. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
