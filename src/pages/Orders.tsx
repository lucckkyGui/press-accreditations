
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Package, Calendar, ChevronRight, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockOrders = [
  {
    id: "ORD-2025-001",
    date: "2025-01-28",
    status: "completed",
    total: 980.31,
    items: [
      { name: "Professional - Plan miesięczny", quantity: 1, price: 199 },
      { name: "Bilet VIP - Konferencja Tech 2025", quantity: 2, price: 299 }
    ]
  },
  {
    id: "ORD-2025-002",
    date: "2025-01-15",
    status: "completed",
    total: 499,
    items: [
      { name: "Enterprise - Plan miesięczny", quantity: 1, price: 499 }
    ]
  },
  {
    id: "ORD-2024-089",
    date: "2024-12-20",
    status: "completed",
    total: 150,
    items: [
      { name: "Bilet Standard - Gala Noworoczna", quantity: 3, price: 50 }
    ]
  }
];

const statusConfig = {
  pending: { label: "Oczekuje", variant: "secondary" as const },
  processing: { label: "W realizacji", variant: "default" as const },
  completed: { label: "Zrealizowane", variant: "default" as const },
  cancelled: { label: "Anulowane", variant: "destructive" as const }
};

const Orders = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Moje zamówienia</h1>
              <p className="text-muted-foreground">Historia zakupów i subskrypcji</p>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">Wszystkie</TabsTrigger>
              <TabsTrigger value="subscriptions">Subskrypcje</TabsTrigger>
              <TabsTrigger value="tickets">Bilety</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {mockOrders.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Brak zamówień</h2>
                    <p className="text-muted-foreground mb-6">
                      Nie masz jeszcze żadnych zamówień
                    </p>
                    <Button onClick={() => navigate("/products")}>
                      Przeglądaj produkty
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                mockOrders.map((order) => {
                  const status = statusConfig[order.status as keyof typeof statusConfig];
                  return (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{order.id}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.date).toLocaleDateString("pl-PL", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              })}
                            </CardDescription>
                          </div>
                          <Badge variant={status.variant} className="bg-green-100 text-green-800">
                            {status.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.name} × {item.quantity}
                              </span>
                              <span>{(item.price * item.quantity).toFixed(2)} zł</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <span className="text-muted-foreground text-sm">Razem: </span>
                            <span className="font-bold text-lg">{order.total.toFixed(2)} zł</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <Download className="h-4 w-4" />
                              Faktura
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1" asChild>
                              <Link to={`/orders/${order.id}`}>
                                <Eye className="h-4 w-4" />
                                Szczegóły
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="subscriptions">
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground">Filtrowanie subskrypcji w przygotowaniu</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tickets">
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground">Filtrowanie biletów w przygotowaniu</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Orders;
