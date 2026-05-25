
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Ticket, Users, Calendar, QrCode } from "lucide-react";

interface Ticket {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  date?: Date;
}

interface TicketingSystemProps {
  eventId?: string;
  onCheckout?: (selectedTickets: SelectedTicket[]) => void;
  standalone?: boolean;
  searchQuery?: string;
  sortOrder?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

interface SelectedTicket {
  ticketId: string;
  quantity: number;
  name: string;
  price: number;
}

const TicketingSystem = ({ 
  eventId, 
  onCheckout, 
  standalone = false, 
  searchQuery = '',
  sortOrder = '',
  priceRange = { min: 0, max: Infinity }
}: TicketingSystemProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("select");
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  // Fetch available tickets (mock data for now)
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const mockTickets: Ticket[] = [
        {
          id: "ticket-1",
          name: "General Admission",
          price: 50,
          description: "Standard entry to the event",
          available: 100,
          date: new Date(2025, 5, 15)
        },
        {
          id: "ticket-2",
          name: "VIP Experience",
          price: 150,
          description: "Premium entry with exclusive perks",
          available: 20,
          date: new Date(2025, 6, 20)
        },
        {
          id: "ticket-3",
          name: "Early Bird",
          price: 35,
          description: "Limited time discount entry",
          available: 50,
          date: new Date(2025, 4, 10)
        }
      ];
      setTickets(mockTickets);
      setFilteredTickets(mockTickets);
      setLoading(false);
    }, 1000);
  }, [eventId]);

  // Apply filters when search query, sort order or price range changes
  useEffect(() => {
    let filtered = [...tickets];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(ticket => 
        ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply price range filter
    filtered = filtered.filter(ticket => 
      ticket.price >= priceRange.min && ticket.price <= priceRange.max
    );
    
    // Apply sort order
    if (sortOrder) {
      switch(sortOrder) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'date-asc':
          filtered.sort((a, b) => (a.date && b.date) ? a.date.getTime() - b.date.getTime() : 0);
          break;
        case 'date-desc':
          filtered.sort((a, b) => (a.date && b.date) ? b.date.getTime() - a.date.getTime() : 0);
          break;
      }
    }
    
    setFilteredTickets(filtered);
  }, [tickets, searchQuery, sortOrder, priceRange]);

  const handleQuantityChange = (ticketId: string, quantity: number) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    setSelectedTickets(prev => {
      // Check if this ticket is already in the selectedTickets
      const existingTicketIndex = prev.findIndex(t => t.ticketId === ticketId);
      
      if (quantity === 0 && existingTicketIndex !== -1) {
        // Remove ticket if quantity is 0
        return prev.filter(t => t.ticketId !== ticketId);
      } else if (existingTicketIndex !== -1) {
        // Update quantity if ticket is already selected
        return prev.map((t, index) => 
          index === existingTicketIndex 
            ? { ...t, quantity } 
            : t
        );
      } else if (quantity > 0) {
        // Add new ticket to selection
        return [...prev, { 
          ticketId, 
          quantity, 
          name: ticket.name, 
          price: ticket.price 
        }];
      }
      return prev;
    });
  };

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const getTotalPrice = () => {
    return selectedTickets.reduce((total, ticket) => {
      return total + (ticket.price * ticket.quantity);
    }, 0);
  };

  const handleProceedToInfo = () => {
    if (selectedTickets.length === 0) {
      toast.error("Wybierz co najmniej jeden bilet aby kontynuować");
      return;
    }
    setActiveTab("info");
  };

  const handleProceedToSummary = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate customer info
    const { firstName, lastName, email, phone } = customerInfo;
    if (!firstName || !lastName || !email) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }
    setActiveTab("summary");
  };

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout(selectedTickets);
    } else {
      // Mock checkout process
      toast.success("Zakup biletów zakończony pomyślnie!");
      // Reset the form
      setSelectedTickets([]);
      setCustomerInfo({
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
      });
      setActiveTab("select");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className={standalone ? "max-w-2xl mx-auto" : ""}>
      {standalone && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" /> System Biletowy
          </CardTitle>
          <CardDescription>Zarezerwuj bilety na wybrane wydarzenia</CardDescription>
        </CardHeader>
      )}
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="select">Wybór biletów</TabsTrigger>
            <TabsTrigger value="info" disabled={selectedTickets.length === 0}>Dane kontaktowe</TabsTrigger>
            <TabsTrigger value="summary" disabled={!customerInfo.firstName || !customerInfo.email}>Podsumowanie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="select">
            <div className="space-y-4">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{ticket.name}</h3>
                          <p className="text-sm text-muted-foreground">{ticket.description}</p>
                          {ticket.date && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              {ticket.date.toLocaleDateString("pl-PL")}
                            </p>
                          )}
                        </div>
                        <div className="text-lg font-bold">{ticket.price} PLN</div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-muted-foreground">
                          Dostępne: {ticket.available}
                        </div>
                        <div className="flex items-center">
                          <Label htmlFor={`quantity-${ticket.id}`} className="mr-2">Ilość:</Label>
                          <Select 
                            onValueChange={(value) => handleQuantityChange(ticket.id, parseInt(value))}
                            defaultValue="0"
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder="0" />
                            </SelectTrigger>
                            <SelectContent>
                              {[...Array(11).keys()].map(num => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Brak biletów spełniających kryteria wyszukiwania</p>
                </div>
              )}
              
              {selectedTickets.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center font-medium mb-4">
                    <span>Suma:</span>
                    <span>{getTotalPrice()} PLN</span>
                  </div>
                  <Button onClick={handleProceedToInfo} className="w-full">
                    Kontynuuj
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="info">
            <form onSubmit={handleProceedToSummary} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Imię *</Label>
                  <Input 
                    id="firstName"
                    name="firstName"
                    value={customerInfo.firstName}
                    onChange={handleCustomerInfoChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nazwisko *</Label>
                  <Input 
                    id="lastName"
                    name="lastName"
                    value={customerInfo.lastName}
                    onChange={handleCustomerInfoChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={handleCustomerInfoChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input 
                  id="phone"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleCustomerInfoChange}
                />
              </div>
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("select")}>
                  Wróć
                </Button>
                <Button type="submit">
                  Podsumowanie
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="summary">
            <div className="space-y-6">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Podsumowanie zamówienia</h3>
                <div className="space-y-2">
                  {selectedTickets.map((ticket) => (
                    <div key={ticket.ticketId} className="flex justify-between">
                      <span>{ticket.name} x {ticket.quantity}</span>
                      <span>{ticket.price * ticket.quantity} PLN</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                    <span>Razem:</span>
                    <span>{getTotalPrice()} PLN</span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Dane kontaktowe</h3>
                <p>{customerInfo.firstName} {customerInfo.lastName}</p>
                <p>{customerInfo.email}</p>
                {customerInfo.phone && <p>{customerInfo.phone}</p>}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setActiveTab("info")}>
                  Wróć
                </Button>
                <Button onClick={handleCheckout} className="gap-2">
                  <Check className="h-4 w-4" />
                  Potwierdź zakup
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TicketingSystem;
