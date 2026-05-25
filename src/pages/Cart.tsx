
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Mock cart items
const mockCartItems = [
  {
    id: "1",
    name: "Professional",
    description: "Plan miesięczny",
    price: 199,
    quantity: 1,
    type: "subscription"
  },
  {
    id: "2", 
    name: "Bilet VIP - Konferencja Tech 2025",
    description: "Dostęp do wszystkich stref",
    price: 299,
    quantity: 2,
    type: "ticket"
  }
];

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = React.useState(mockCartItems);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.23;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container py-4">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Wróć
          </Button>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Koszyk</h1>
            <Badge variant="secondary">{cartItems.length} produkty</Badge>
          </div>

          {cartItems.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Twój koszyk jest pusty</h2>
                <p className="text-muted-foreground mb-6">
                  Dodaj produkty do koszyka, aby kontynuować zakupy
                </p>
                <Button onClick={() => navigate("/products")}>
                  Przeglądaj produkty
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {item.type === "subscription" ? "Subskrypcja" : "Bilet"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <p className="text-lg font-bold mt-2">{item.price} zł</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:sticky lg:top-6 h-fit">
                <Card>
                  <CardHeader>
                    <CardTitle>Podsumowanie</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Suma częściowa</span>
                      <span>{subtotal.toFixed(2)} zł</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VAT (23%)</span>
                      <span>{tax.toFixed(2)} zł</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Razem</span>
                      <span>{total.toFixed(2)} zł</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full gap-2" size="lg" asChild>
                      <Link to="/checkout">
                        <CreditCard className="h-4 w-4" />
                        Przejdź do płatności
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cart;
