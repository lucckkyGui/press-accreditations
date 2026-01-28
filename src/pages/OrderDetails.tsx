
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, Calendar, MapPin, User, Mail, FileText, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock order data
  const order = {
    id: id || "ORD-2025-001",
    date: "2025-01-28",
    status: "completed",
    paymentMethod: "Karta płatnicza",
    total: 980.31,
    subtotal: 797,
    tax: 183.31,
    items: [
      { 
        name: "Professional - Plan miesięczny", 
        description: "Dostęp do wszystkich funkcji Professional",
        quantity: 1, 
        price: 199,
        type: "subscription"
      },
      { 
        name: "Bilet VIP - Konferencja Tech 2025", 
        description: "Dostęp do wszystkich stref + catering",
        quantity: 2, 
        price: 299,
        type: "ticket"
      }
    ],
    billing: {
      name: "Jan Kowalski",
      email: "jan.kowalski@example.com",
      company: "Tech Solutions Sp. z o.o.",
      nip: "1234567890",
      address: "ul. Przykładowa 123, 00-001 Warszawa"
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container py-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft className="h-4 w-4" />
            Wróć do zamówień
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              Drukuj
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Pobierz PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{order.id}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(order.date).toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">Zrealizowane</Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Billing Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Dane płatnika
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{order.billing.name}</p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {order.billing.email}
                </p>
                {order.billing.company && (
                  <p>{order.billing.company}</p>
                )}
                {order.billing.nip && (
                  <p className="text-muted-foreground">NIP: {order.billing.nip}</p>
                )}
                <p className="text-muted-foreground flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  {order.billing.address}
                </p>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Informacje o płatności
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metoda płatności</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="bg-green-50">Opłacone</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numer transakcji</span>
                  <span className="font-mono text-xs">TXN-{Date.now()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Zamówione produkty</CardTitle>
              <CardDescription>Szczegółowa lista zakupionych produktów</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {item.type === "subscription" ? "Subskrypcja" : "Bilet"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Ilość: {item.quantity} × {item.price.toFixed(2)} zł
                      </p>
                    </div>
                    <span className="font-bold">
                      {(item.price * item.quantity).toFixed(2)} zł
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Suma częściowa</span>
                  <span>{order.subtotal.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (23%)</span>
                  <span>{order.tax.toFixed(2)} zł</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Razem</span>
                  <span>{order.total.toFixed(2)} zł</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate("/orders")}>
              Wróć do zamówień
            </Button>
            <Button onClick={() => navigate("/products")}>
              Kontynuuj zakupy
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;
