
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "kontakt@pressaccreditations.com",
    description: "Odpowiadamy w ciągu 24h"
  },
  {
    icon: Phone,
    title: "Telefon",
    value: "+48 123 456 789",
    description: "Pon-Pt: 9:00 - 17:00"
  },
  {
    icon: MapPin,
    title: "Adres",
    value: "ul. Przykładowa 123",
    description: "00-001 Warszawa, Polska"
  },
  {
    icon: Clock,
    title: "Godziny pracy",
    value: "Pon - Pt: 9:00 - 17:00",
    description: "Weekendy: nieczynne"
  }
];

const Contact = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    topic: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Wiadomość została wysłana! Odpowiemy najszybciej jak to możliwe.");
    setFormData({ name: "", email: "", subject: "", topic: "", message: "" });
    setIsSubmitting(false);
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

      <main className="container py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Skontaktuj się z nami</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Masz pytania? Chętnie na nie odpowiemy. Skorzystaj z formularza 
              lub jednej z poniższych metod kontaktu.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Wyślij wiadomość</CardTitle>
                <CardDescription>
                  Wypełnij formularz, a skontaktujemy się z Tobą najszybciej jak to możliwe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Imię i nazwisko</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Jan Kowalski"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jan@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic">Temat</Label>
                    <Select 
                      value={formData.topic} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, topic: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz temat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Pytanie ogólne</SelectItem>
                        <SelectItem value="sales">Sprzedaż</SelectItem>
                        <SelectItem value="support">Wsparcie techniczne</SelectItem>
                        <SelectItem value="billing">Rozliczenia</SelectItem>
                        <SelectItem value="partnership">Współpraca</SelectItem>
                        <SelectItem value="other">Inne</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Tytuł wiadomości</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="W czym możemy pomóc?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Wiadomość</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Opisz szczegółowo swoje pytanie lub problem..."
                      className="min-h-[150px]"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Wysyłanie..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Wyślij wiadomość
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-4">
              {contactInfo.map((info, idx) => {
                const Icon = info.icon;
                return (
                  <Card key={idx}>
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{info.title}</h3>
                        <p className="text-sm">{info.value}</p>
                        <p className="text-xs text-muted-foreground">{info.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* FAQ Link */}
              <Card className="bg-primary/5 border-0">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Szukasz szybkiej odpowiedzi?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sprawdź naszą sekcję FAQ, gdzie znajdziesz odpowiedzi na najczęściej zadawane pytania.
                  </p>
                  <Button variant="outline" onClick={() => navigate("/home#faq")}>
                    Zobacz FAQ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 mt-12">
        <div className="container text-center text-muted-foreground">
          <p>© 2025 Press Accreditations. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
