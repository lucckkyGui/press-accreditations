import React, { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Search, Filter, ExternalLink, Star, Clock } from "lucide-react";

const EventMarketplace = () => {
  usePageTitle("Marketplace Wydarzeń");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  const events = [
    { id: 1, title: "Gala Medialna 2026", date: "2026-05-15", location: "Warszawa", category: "media", attendees: 350, rating: 4.8, price: "Bezpłatne", image: "🎭", featured: true },
    { id: 2, title: "Tech Press Summit", date: "2026-06-20", location: "Kraków", category: "tech", attendees: 200, rating: 4.5, price: "149 PLN", image: "💻", featured: true },
    { id: 3, title: "Film Festival Press Day", date: "2026-07-10", location: "Łódź", category: "entertainment", attendees: 500, rating: 4.9, price: "Bezpłatne", image: "🎬", featured: false },
    { id: 4, title: "Sports Media Conference", date: "2026-08-05", location: "Gdańsk", category: "sport", attendees: 150, rating: 4.2, price: "99 PLN", image: "⚽", featured: false },
    { id: 5, title: "Music Industry Press Meet", date: "2026-09-12", location: "Poznań", category: "entertainment", attendees: 280, rating: 4.6, price: "Bezpłatne", image: "🎵", featured: false },
    { id: 6, title: "AI & Media Forum", date: "2026-10-01", location: "Wrocław", category: "tech", attendees: 400, rating: 4.7, price: "199 PLN", image: "🤖", featured: true },
  ];

  const filtered = events.filter(e => {
    if (category !== "all" && e.category !== category) return false;
    if (searchQuery && !e.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketplace Wydarzeń</h1>
        <p className="text-muted-foreground">Odkryj i zarejestruj się na wydarzenia prasowe</p>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Szukaj wydarzeń..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="tech">Technologia</SelectItem>
            <SelectItem value="entertainment">Rozrywka</SelectItem>
            <SelectItem value="sport">Sport</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Featured */}
      {filtered.some(e => e.featured) && (
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /> Polecane</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {filtered.filter(e => e.featured).map(event => (
              <Card key={event.id} className="border-primary/30 overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-5xl">
                  {event.image}
                </div>
                <CardContent className="pt-4 space-y-2">
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {event.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary"><Users className="h-3 w-3 mr-1" /> {event.attendees}</Badge>
                      <Badge variant="outline"><Star className="h-3 w-3 mr-1" /> {event.rating}</Badge>
                    </div>
                    <span className="font-bold text-primary">{event.price}</span>
                  </div>
                  <Button className="w-full mt-2">Zarejestruj się</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Events */}
      <div>
        <h2 className="text-lg font-bold mb-3">Wszystkie wydarzenia ({filtered.length})</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(event => (
            <Card key={event.id}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{event.image}</div>
                  <div className="flex-1">
                    <h3 className="font-bold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" /> {event.date} · <MapPin className="h-3 w-3" /> {event.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <Badge variant="secondary">{event.category}</Badge>
                    <Badge variant="outline"><Users className="h-3 w-3 mr-1" /> {event.attendees}</Badge>
                  </div>
                  <span className="font-bold">{event.price}</span>
                </div>
                <Button variant="outline" className="w-full">Szczegóły</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventMarketplace;
