
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, ArrowLeft, CreditCard, Check } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Definicja typów pakietów
const packageDetails = {
  basic: {
    name: "Podstawowy",
    price: "99 PLN",
    priceValue: 99,
    features: [
      "Do 100 gości",
      "Podstawowe zarządzanie wydarzeniami",
      "Skanowanie QR kodów",
      "Eksport listy gości",
    ]
  },
  standard: {
    name: "Standard",
    price: "299 PLN",
    priceValue: 299,
    features: [
      "Do 500 gości",
      "Zaawansowane zarządzanie wydarzeniami",
      "Skanowanie QR kodów",
      "Eksport danych",
      "Dostęp dla 3 organizatorów",
    ]
  },
  premium: {
    name: "Premium",
    price: "599 PLN",
    priceValue: 599,
    features: [
      "Nieograniczona liczba gości",
      "Pełne zarządzanie wydarzeniami",
      "Skanowanie QR kodów",
      "Zaawansowane raporty",
      "Dostęp dla 10 organizatorów",
      "Wsparcie premium",
    ]
  }
};

// Schemat walidacji formularza
const formSchema = z.object({
  firstName: z.string().min(2, { message: "Imię jest wymagane" }),
  lastName: z.string().min(2, { message: "Nazwisko jest wymagane" }),
  email: z.string().email({ message: "Nieprawidłowy adres email" }),
  company: z.string().optional(),
  phone: z.string().min(9, { message: "Numer telefonu powinien mieć co najmniej 9 znaków" }),
});

const Purchase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState("package");
  const [selectedPackage, setSelectedPackage] = useState(location.state?.selectedPackage || "standard");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isPurchaseCompleted, setIsPurchaseCompleted] = useState(false);

  // Inicjalizacja formularza
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      phone: "",
    },
  });

  useEffect(() => {
    // Symulacja ładowania iframe bileterii
    if (currentStep === "ticket") {
      const ticketingContainer = document.getElementById("ticketing-container");
      if (ticketingContainer) {
        const iframe = document.createElement('iframe');
        iframe.src = 'about:blank'; // W rzeczywistości tutaj byłby adres do systemu bileterii
        iframe.width = '100%';
        iframe.height = '400px';
        iframe.style.border = 'none';
        ticketingContainer.appendChild(iframe);
        
        setTimeout(() => {
          // Symulacja załadowania iframe
          toast.success("System bileterii został załadowany");
        }, 1000);
      }
    }

    // Symulacja ładowania iframe płatności
    if (currentStep === "payment") {
      const paymentContainer = document.getElementById("payment-container");
      if (paymentContainer) {
        const iframe = document.createElement('iframe');
        iframe.src = 'about:blank'; // W rzeczywistości tutaj byłby adres do systemu płatności
        iframe.width = '100%';
        iframe.height = '300px';
        iframe.style.border = 'none';
        paymentContainer.appendChild(iframe);
        
        setTimeout(() => {
          // Symulacja załadowania iframe
          toast.success("System płatności został załadowany");
        }, 1000);
      }
    }
  }, [currentStep]);

  const handleSubmitUserData = (data) => {
    console.log("Form data:", data);
    toast.success("Dane zostały zapisane");
    setCurrentStep("ticket");
  };

  const handleTicketingComplete = () => {
    toast.success("Bilety zostały zarezerwowane");
    setCurrentStep("payment");
  };

  const handleProcessPayment = () => {
    setIsPaymentProcessing(true);
    
    // Symulacja przetwarzania płatności
    setTimeout(() => {
      setIsPaymentProcessing(false);
      setIsPurchaseCompleted(true);
      setCurrentStep("confirmation");
      toast.success("Płatność została przetworzona pomyślnie");
    }, 2000);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const renderPackageSelection = () => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Wybierz pakiet</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(packageDetails).map(([key, pkg]) => (
          <Card 
            key={key} 
            className={`cursor-pointer ${selectedPackage === key ? 'border-primary ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedPackage(key)}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{pkg.name}</CardTitle>
                {selectedPackage === key && <Check className="h-5 w-5 text-primary" />}
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{pkg.price}</span>
                <span className="text-muted-foreground"> / miesiąc</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {pkg.features.map((feature, index) => (
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
          </Card>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={() => setCurrentStep("user-data")}>Dalej</Button>
      </div>
    </div>
  );

  const renderUserDataForm = () => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Dane klienta</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitUserData)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imię</FormLabel>
                  <FormControl>
                    <Input placeholder="Twoje imię" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwisko</FormLabel>
                  <FormControl>
                    <Input placeholder="Twoje nazwisko" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="twoj@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Firma (opcjonalnie)</FormLabel>
                <FormControl>
                  <Input placeholder="Nazwa firmy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input placeholder="Numer telefonu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setCurrentStep("package")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Wróć
            </Button>
            <Button type="submit">Dalej</Button>
          </div>
        </form>
      </Form>
    </div>
  );

  const renderTicketing = () => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Bilety / Akredytacje</h2>
      <Card>
        <CardContent className="pt-6">
          <p className="mb-4">Poniżej znajduje się system bileterii, w którym możesz zarezerwować niezbędne bilety:</p>
          <div id="ticketing-container" className="min-h-[400px] border rounded-md flex items-center justify-center bg-muted/30">
            <p className="text-muted-foreground">Ładowanie systemu biletowego...</p>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("user-data")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Wróć
        </Button>
        <Button onClick={handleTicketingComplete}>Kontynuuj do płatności</Button>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Płatność</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Podsumowanie zamówienia</h3>
            <div className="flex justify-between mb-2">
              <span>Pakiet {packageDetails[selectedPackage].name}</span>
              <span>{packageDetails[selectedPackage].price} / miesiąc</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Razem do zapłaty</span>
              <span>{packageDetails[selectedPackage].price}</span>
            </div>
          </div>
          <p className="mb-4">Wybierz metodę płatności i wprowadź dane karty:</p>
          <div id="payment-container" className="min-h-[300px] border rounded-md flex items-center justify-center bg-muted/30">
            <div className="text-center">
              <CreditCard className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Ładowanie systemu płatności...</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("ticket")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Wróć
        </Button>
        <Button 
          onClick={handleProcessPayment} 
          disabled={isPaymentProcessing}
          className="min-w-[150px]"
        >
          {isPaymentProcessing ? "Przetwarzanie..." : "Zapłać"}
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="mb-8 text-center">
      <div className="mb-6 flex justify-center">
        <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full">
          <Check className="h-16 w-16 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <h2 className="text-3xl font-bold mb-2">Zamówienie zrealizowane!</h2>
      <p className="text-lg text-muted-foreground mb-8">
        Twoja płatność została przyjęta i Twój pakiet został aktywowany.
      </p>
      <div className="max-w-md mx-auto bg-muted/30 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Szczegóły zamówienia</h3>
        <div className="space-y-2 text-left">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pakiet:</span>
            <span className="font-medium">{packageDetails[selectedPackage].name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kwota:</span>
            <span className="font-medium">{packageDetails[selectedPackage].price} / miesiąc</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID zamówienia:</span>
            <span className="font-medium">{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
          </div>
        </div>
      </div>
      <p className="mb-6">
        Wysłaliśmy potwierdzenie na Twój adres email. Można teraz zacząć korzystać z systemu.
      </p>
      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={handleBackToHome}>
          Wróć do strony głównej
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate("/login", { state: { role: "organizator" } })}>
          Przejdź do logowania
        </Button>
      </div>
    </div>
  );

  // Główne renderowanie strony w zależności od bieżącego kroku
  const renderCurrentStep = () => {
    switch (currentStep) {
      case "package":
        return renderPackageSelection();
      case "user-data":
        return renderUserDataForm();
      case "ticket":
        return renderTicketing();
      case "payment":
        return renderPayment();
      case "confirmation":
        return renderConfirmation();
      default:
        return renderPackageSelection();
    }
  };

  // Status realizacji zamówienia
  const renderOrderProgress = () => {
    if (isPurchaseCompleted) return null;
    
    return (
      <div className="mb-8">
        <Tabs value={currentStep} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="package" disabled>Pakiet</TabsTrigger>
            <TabsTrigger value="user-data" disabled>Dane</TabsTrigger>
            <TabsTrigger value="ticket" disabled>Bilety</TabsTrigger>
            <TabsTrigger value="payment" disabled>Płatność</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Nagłówek */}
      <header className="border-b bg-background p-4">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Press Acreditations</span>
          </div>
          <Button variant="ghost" onClick={handleBackToHome}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Wróć do strony głównej
          </Button>
        </div>
      </header>

      {/* Główna treść */}
      <main className="flex-1 container py-8 max-w-4xl">
        {renderOrderProgress()}
        {renderCurrentStep()}
      </main>

      {/* Stopka */}
      <footer className="bg-muted py-6 border-t">
        <div className="container text-center">
          <p className="text-muted-foreground">© 2025 Press Acreditations. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
};

export default Purchase;
