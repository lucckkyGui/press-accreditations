
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeTerms) {
      toast.error("Musisz zaakceptować regulamin");
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success("Płatność zakończona sukcesem!");
    navigate("/orders");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container py-4">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate("/cart")}
          >
            <ArrowLeft className="h-4 w-4" />
            Wróć do koszyka
          </Button>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Lock className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Bezpieczna płatność</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
              {/* Payment Form */}
              <div className="space-y-6">
                {/* Billing Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dane do faktury</CardTitle>
                    <CardDescription>Wprowadź dane do wystawienia faktury</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Imię</Label>
                        <Input id="firstName" placeholder="Jan" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nazwisko</Label>
                        <Input id="lastName" placeholder="Kowalski" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="jan@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Firma (opcjonalnie)</Label>
                      <Input id="company" placeholder="Nazwa firmy" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nip">NIP (opcjonalnie)</Label>
                      <Input id="nip" placeholder="1234567890" />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Metoda płatności</CardTitle>
                    <CardDescription>Wybierz preferowaną metodę płatności</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            <span>Karta płatnicza</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="blik" id="blik" />
                        <Label htmlFor="blik" className="flex-1 cursor-pointer">
                          <span>BLIK</span>
                          <p className="text-sm text-muted-foreground">Szybka płatność kodem BLIK</p>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="transfer" id="transfer" />
                        <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                          <span>Przelew bankowy</span>
                          <p className="text-sm text-muted-foreground">Przelew online przez Twój bank</p>
                        </Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === "card" && (
                      <div className="mt-6 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Numer karty</Label>
                          <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Data ważności</Label>
                            <Input id="expiry" placeholder="MM/RR" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "blik" && (
                      <div className="mt-6 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="blikCode">Kod BLIK</Label>
                          <Input id="blikCode" placeholder="123 456" maxLength={7} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:sticky lg:top-6 h-fit">
                <Card>
                  <CardHeader>
                    <CardTitle>Twoje zamówienie</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Professional (1x)</span>
                        <span>199,00 zł</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Bilet VIP (2x)</span>
                        <span>598,00 zł</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Suma częściowa</span>
                      <span>797,00 zł</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VAT (23%)</span>
                      <span>183,31 zł</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Razem</span>
                      <span>980,31 zł</span>
                    </div>

                    <div className="flex items-start space-x-2 pt-4">
                      <Checkbox 
                        id="terms" 
                        checked={agreeTerms}
                        onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                        Akceptuję <a href="#" className="text-primary underline">regulamin</a> i{" "}
                        <a href="#" className="text-primary underline">politykę prywatności</a>
                      </Label>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full gap-2" 
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>Przetwarzanie...</>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Zapłać 980,31 zł
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" />
                  Płatność zabezpieczona szyfrowaniem SSL
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
