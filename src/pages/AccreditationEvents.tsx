
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, MapPin, Users, Clock, Info, Tag, Award, Star } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { pl, enUS } from "date-fns/locale";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Rozszerzone przykładowe dane wydarzeń dla różnych kategorii
const getMockEvents = (categoryId: string) => {
  const allEvents = [
    // Festiwale - 16 wydarzeń
    {
      id: "f1",
      title: "Summer Music Festival 2025",
      titlePl: "Letni Festiwal Muzyczny 2025",
      location: "Warsaw, Poland",
      locationPl: "Warszawa, Polska",
      startDate: "2025-06-15T10:00:00",
      endDate: "2025-06-17T22:00:00",
      description: "The biggest summer music festival in Eastern Europe",
      descriptionPl: "Największy letni festiwal muzyczny w Europie Wschodniej",
      category: "festivals",
      registrationOpen: true,
      deadline: "2025-05-15T23:59:59",
      attendees: 5000,
      type: "music",
      featured: true
    },
    {
      id: "f2",
      title: "International Film Festival",
      titlePl: "Międzynarodowy Festiwal Filmowy",
      location: "Krakow, Poland",
      locationPl: "Kraków, Polska",
      startDate: "2025-07-10T09:00:00",
      endDate: "2025-07-20T23:00:00",
      description: "Annual cinema celebration featuring works from around the world",
      descriptionPl: "Doroczne święto kina prezentujące dzieła z całego świata",
      category: "festivals",
      registrationOpen: true,
      deadline: "2025-06-01T23:59:59",
      attendees: 3000,
      type: "film",
      featured: true
    },
    {
      id: "f3",
      title: "Culinary Arts Festival",
      titlePl: "Festiwal Sztuki Kulinarnej",
      location: "Gdansk, Poland",
      locationPl: "Gdańsk, Polska",
      startDate: "2025-08-05T11:00:00",
      endDate: "2025-08-07T21:00:00",
      description: "A celebration of global cuisine with top chefs from around the world",
      descriptionPl: "Święto światowej kuchni z udziałem najlepszych szefów kuchni z całego świata",
      category: "festivals",
      registrationOpen: true,
      deadline: "2025-07-15T23:59:59",
      attendees: 2000,
      type: "food",
      featured: false
    },
    {
      id: "f4",
      title: "Contemporary Art Biennale",
      titlePl: "Biennale Sztuki Współczesnej",
      location: "Wroclaw, Poland",
      locationPl: "Wrocław, Polska",
      startDate: "2025-09-15T09:00:00",
      endDate: "2025-11-15T18:00:00",
      description: "Major international exhibition of contemporary art",
      descriptionPl: "Główna międzynarodowa wystawa sztuki współczesnej",
      category: "festivals",
      registrationOpen: true,
      deadline: "2025-08-15T23:59:59",
      attendees: 1500,
      type: "art",
      featured: false
    },
    {
      id: "f5",
      title: "Digital Innovation Festival",
      titlePl: "Festiwal Innowacji Cyfrowych",
      location: "Poznan, Poland",
      locationPl: "Poznań, Polska",
      startDate: "2025-10-01T09:00:00",
      endDate: "2025-10-03T18:00:00",
      description: "Showcasing the latest in tech innovation and digital creativity",
      descriptionPl: "Prezentacja najnowszych innowacji technologicznych i kreatywności cyfrowej",
      category: "festivals",
      registrationOpen: true,
      deadline: "2025-09-15T23:59:59",
      attendees: 2500,
      type: "technology",
      featured: false
    },
    {
      id: "f6",
      title: "Literature & Poetry Festival",
      titlePl: "Festiwal Literatury i Poezji",
      location: "Lodz, Poland",
      locationPl: "Łódź, Polska",
      startDate: "2025-05-20T10:00:00",
      endDate: "2025-05-23T20:00:00",
      description: "A celebration of written word with renowned authors from around the globe",
      descriptionPl: "Święto słowa pisanego z uznanymi autorami z całego świata",
      category: "festivals",
      registrationOpen: false,
      deadline: "2025-04-20T23:59:59",
      attendees: 1000,
      type: "literature",
      featured: false
    },
    {
      id: "f7",
      title: "Street Art Festival",
      titlePl: "Festiwal Sztuki Ulicznej",
      location: "Katowice, Poland",
      locationPl: "Katowice, Polska",
      startDate: "2025-06-05T09:00:00",
      endDate: "2025-06-12T21:00:00",
      description: "Urban art celebration with murals and installations across the city",
      descriptionPl: "Święto sztuki miejskiej z muralami i instalacjami w całym mieście",
      category: "festivals",
      registrationOpen: true,
      deadline: "2025-05-15T23:59:59",
      attendees: 3000,
      type: "art",
      featured: true
    },
    {
      id: "f8",
      title: "Folk Culture Festival",
      titlePl: "Festiwal Kultury Ludowej",
      location: "Zakopane, Poland",
      locationPl: "Zakopane, Polska",
      startDate: "2025-07-25T10:00:00",
      endDate: "2025-07-28T18:00:00",
      description: "Traditional music, dance and crafts from Polish highlands",
      descriptionPl: "Tradycyjna muzyka, taniec i rzemiosło z polskich gór",
      category: "festivals",
      registrationOpen: true,
      deadline: "2025-07-10T23:59:59",
      attendees: 2000,
      type: "cultural",
      featured: false
    },
    {
      id: "f9",
      title: "Electronic Music Festival",
      titlePl: "Festiwal Muzyki Elektronicznej",
      location: "Warsaw, Poland",
      locationPl: "Warszawa, Polska",
      startDate: "2025-08-20T18:00:00",
      endDate: "2025-08-22T06:00:00",
      description: "Three days of electronic music with DJs from around the world",
      descriptionPl: "Trzy dni muzyki elektronicznej z DJ-ami z całego świata",
      category: "festivals",
      registrationOpen: true,
      deadline: "2025-08-01T23:59:59",
      attendees: 7000,
      type: "music",
      featured: true
    },
    {
      id: "f10",
      title: "Comedy Festival",
      titlePl: "Festiwal Komedii",
      location: "Krakow, Poland",
      locationPl: "Kraków, Polska",
      startDate: "2025-09-05T17:00:00",
      endDate: "2025-09-12T23:00:00",
      description: "Stand-up comedy showcases and humorous theatrical performances",
      descriptionPl: "Pokazy stand-upu i humorystyczne przedstawienia teatralne",
      category: "festivals",
      registrationOpen: true,
      deadline: "2025-08-20T23:59:59",
      attendees: 1500,
      type: "performance",
      featured: false
    },
    {
      id: "f11",
      title: "Winter Festival of Lights",
      titlePl: "Zimowy Festiwal Świateł",
      location: "Warsaw, Poland",
      locationPl: "Warszawa, Polska",
      startDate: "2025-12-15T16:00:00",
      endDate: "2025-12-30T22:00:00",
      description: "Light installations and projections throughout the city center",
      descriptionPl: "Instalacje świetlne i projekcje w całym centrum miasta",
      category: "festivals",
      registrationOpen: true,
      deadline: "2025-11-30T23:59:59",
      attendees: 10000,
      type: "art",
      featured: false
    },
    {
      id: "f12",
      title: "Science Festival",
      titlePl: "Festiwal Nauki",
      location: "Warsaw, Poland",
      locationPl: "Warszawa, Polska",
      startDate: "2025-10-10T09:00:00",
      endDate: "2025-10-17T18:00:00",
      description: "Interactive exhibitions and lectures on scientific breakthroughs",
      descriptionPl: "Interaktywne wystawy i wykłady na temat przełomów naukowych",
      category: "festivals",
      registrationOpen: false,
      deadline: "2025-09-25T23:59:59",
      attendees: 2000,
      type: "educational",
      featured: false
    },
    {
      id: "f13",
      title: "Theater Festival",
      titlePl: "Festiwal Teatralny",
      location: "Wroclaw, Poland",
      locationPl: "Wrocław, Polska",
      startDate: "2025-04-15T10:00:00",
      endDate: "2025-04-25T22:00:00",
      description: "Cutting-edge theatrical performances from Poland and beyond",
      descriptionPl: "Nowatorskie przedstawienia teatralne z Polski i zagranicy",
      category: "festivals",
      registrationOpen: true,
      deadline: "2025-03-30T23:59:59",
      attendees: 1800,
      type: "performance",
      featured: false
    },
    {
      id: "f14",
      title: "Photography Festival",
      titlePl: "Festiwal Fotografii",
      location: "Lodz, Poland",
      locationPl: "Łódź, Polska",
      startDate: "2025-05-05T09:00:00",
      endDate: "2025-06-05T20:00:00",
      description: "Exhibition of works by emerging and established photographers",
      descriptionPl: "Wystawa prac wschodzących i uznanych fotografów",
      category: "festivals",
      registrationOpen: true,
      deadline: "2025-04-20T23:59:59",
      attendees: 1200,
      type: "art",
      featured: false
    },
    {
      id: "f15",
      title: "Wine & Food Festival",
      titlePl: "Festiwal Wina i Jedzenia",
      location: "Warsaw, Poland",
      locationPl: "Warszawa, Polska",
      startDate: "2025-09-25T12:00:00",
      endDate: "2025-09-27T22:00:00",
      description: "Tastings of regional cuisine and wines from Poland and Europe",
      descriptionPl: "Degustacje regionalnej kuchni i win z Polski i Europy",
      category: "festivals",
      registrationOpen: true,
      deadline: "2025-09-15T23:59:59",
      attendees: 2500,
      type: "food",
      featured: false
    },
    {
      id: "f16",
      title: "Design Festival",
      titlePl: "Festiwal Designu",
      location: "Warsaw, Poland",
      locationPl: "Warszawa, Polska",
      startDate: "2025-11-05T10:00:00",
      endDate: "2025-11-10T18:00:00",
      description: "Showcasing innovative design in furniture, fashion and graphics",
      descriptionPl: "Prezentacja innowacyjnego designu mebli, mody i grafiki",
      category: "festivals",
      registrationOpen: true,
      deadline: "2025-10-20T23:59:59",
      attendees: 1700,
      type: "design",
      featured: true
    },
    
    // Wydarzenia sportowe - 16 wydarzeń
    {
      id: "s1",
      title: "UEFA Europa League Final",
      titlePl: "Finał Ligi Europy UEFA",
      location: "National Stadium, Warsaw",
      locationPl: "Stadion Narodowy, Warszawa",
      startDate: "2025-05-28T20:45:00",
      endDate: "2025-05-28T23:00:00",
      description: "The final match of the UEFA Europa League 2024/2025 season",
      descriptionPl: "Mecz finałowy sezonu 2024/2025 Ligi Europy UEFA",
      category: "sports",
      registrationOpen: true,
      deadline: "2025-04-15T23:59:59",
      attendees: 58000,
      type: "football",
      featured: true
    },
    {
      id: "s2",
      title: "World Athletics Championship",
      titlePl: "Mistrzostwa Świata w Lekkoatletyce",
      location: "Silesian Stadium, Chorzów",
      locationPl: "Stadion Śląski, Chorzów",
      startDate: "2025-08-15T10:00:00",
      endDate: "2025-08-23T20:00:00",
      description: "Global athletics competition featuring top athletes from around the world",
      descriptionPl: "Światowe zawody lekkoatletyczne z udziałem najlepszych sportowców",
      category: "sports",
      registrationOpen: true,
      deadline: "2025-07-01T23:59:59",
      attendees: 40000,
      type: "athletics",
      featured: true
    },
    {
      id: "s3",
      title: "Warsaw Marathon",
      titlePl: "Maraton Warszawski",
      location: "Warsaw, Poland",
      locationPl: "Warszawa, Polska",
      startDate: "2025-09-25T09:00:00",
      endDate: "2025-09-25T16:00:00",
      description: "Annual marathon through the streets of Warsaw",
      descriptionPl: "Coroczny maraton ulicami Warszawy",
      category: "sports",
      registrationOpen: true,
      deadline: "2025-09-10T23:59:59",
      attendees: 10000,
      type: "running",
      featured: false
    },
    {
      id: "s4",
      title: "Polish Open Tennis Tournament",
      titlePl: "Turniej Tenisowy Polish Open",
      location: "Warsaw, Poland",
      locationPl: "Warszawa, Polska",
      startDate: "2025-07-10T09:00:00",
      endDate: "2025-07-17T20:00:00",
      description: "Professional tennis tournament featuring international players",
      descriptionPl: "Profesjonalny turniej tenisowy z udziałem międzynarodowych zawodników",
      category: "sports",
      registrationOpen: true,
      deadline: "2025-06-25T23:59:59",
      attendees: 5000,
      type: "tennis",
      featured: false
    },
    {
      id: "s5",
      title: "European Swimming Championships",
      titlePl: "Mistrzostwa Europy w Pływaniu",
      location: "Aquatics Center, Warsaw",
      locationPl: "Centrum Pływackie, Warszawa",
      startDate: "2025-06-10T09:00:00",
      endDate: "2025-06-16T19:00:00",
      description: "Continental swimming competition with Europe's elite swimmers",
      descriptionPl: "Kontynentalne zawody pływackie z udziałem elitarnych pływaków Europy",
      category: "sports",
      registrationOpen: true,
      deadline: "2025-05-20T23:59:59",
      attendees: 3000,
      type: "swimming",
      featured: true
    },
    {
      id: "s6",
      title: "Cycling Tour of Poland",
      titlePl: "Wyścig Kolarski Tour de Pologne",
      location: "Multiple cities, Poland",
      locationPl: "Wiele miast, Polska",
      startDate: "2025-08-01T10:00:00",
      endDate: "2025-08-07T18:00:00",
      description: "Multi-stage cycling race through Poland's diverse regions",
      descriptionPl: "Wieloetapowy wyścig kolarski przez różnorodne regiony Polski",
      category: "sports",
      registrationOpen: false,
      deadline: "2025-07-15T23:59:59",
      attendees: 5000,
      type: "cycling",
      featured: true
    },
    {
      id: "s7",
      title: "Basketball Champions League Final Four",
      titlePl: "Finał Czterech Ligi Mistrzów w Koszykówce",
      location: "Arena Krakow, Krakow",
      locationPl: "Arena Kraków, Kraków",
      startDate: "2025-05-15T17:00:00",
      endDate: "2025-05-17T22:00:00",
      description: "Final stages of Europe's premium club basketball competition",
      descriptionPl: "Finałowe etapy najważniejszych klubowych rozgrywek koszykówki w Europie",
      category: "sports",
      registrationOpen: true,
      deadline: "2025-05-01T23:59:59",
      attendees: 12000,
      type: "basketball",
      featured: false
    },
    {
      id: "s8",
      title: "International Volleyball Tournament",
      titlePl: "Międzynarodowy Turniej Siatkówki",
      location: "Ergo Arena, Gdansk",
      locationPl: "Ergo Arena, Gdańsk",
      startDate: "2025-06-20T14:00:00",
      endDate: "2025-06-22T20:00:00",
      description: "Friendly international volleyball matches with top teams",
      descriptionPl: "Towarzyskie międzynarodowe mecze siatkówki z udziałem czołowych drużyn",
      category: "sports",
      registrationOpen: true,
      deadline: "2025-06-10T23:59:59",
      attendees: 11000,
      type: "volleyball",
      featured: false
    },
    {
      id: "s9",
      title: "Polish Handball Cup Final",
      titlePl: "Finał Pucharu Polski w Piłce Ręcznej",
      location: "Arena Kielce, Kielce",
      locationPl: "Arena Kielce, Kielce",
      startDate: "2025-04-25T18:00:00",
      endDate: "2025-04-25T20:30:00",
      description: "Final match of the Polish Handball Cup",
      descriptionPl: "Mecz finałowy Pucharu Polski w piłce ręcznej",
      category: "sports",
      registrationOpen: true,
      deadline: "2025-04-15T23:59:59",
      attendees: 4000,
      type: "handball",
      featured: false
    },
    {
      id: "s10",
      title: "International Boxing Gala",
      titlePl: "Międzynarodowa Gala Boksu",
      location: "Centennial Hall, Wroclaw",
      locationPl: "Hala Stulecia, Wrocław",
      startDate: "2025-10-15T19:00:00",
      endDate: "2025-10-15T23:30:00",
      description: "Professional boxing matches featuring international champions",
      descriptionPl: "Profesjonalne walki bokserskie z udziałem międzynarodowych mistrzów",
      category: "sports",
      registrationOpen: true,
      deadline: "2025-10-01T23:59:59",
      attendees: 6000,
      type: "boxing",
      featured: false
    },
    {
      id: "s11",
      title: "Winter Sports Championship",
      titlePl: "Mistrzostwa Sportów Zimowych",
      location: "Zakopane, Poland",
      locationPl: "Zakopane, Polska",
      startDate: "2026-01-15T09:00:00",
      endDate: "2026-01-20T17:00:00",
      description: "National championships in skiing, snowboarding and other winter sports",
      descriptionPl: "Mistrzostwa krajowe w narciarstwie, snowboardzie i innych sportach zimowych",
      category: "sports",
      registrationOpen: true,
      deadline: "2025-12-31T23:59:59",
      attendees: 3000,
      type: "winter",
      featured: false
    },
    {
      id: "s12",
      title: "Equestrian Show Jumping Grand Prix",
      titlePl: "Grand Prix w Skokach Jeździeckich",
      location: "Hipodrom Sopot, Sopot",
      locationPl: "Hipodrom Sopot, Sopot",
      startDate: "2025-07-25T11:00:00",
      endDate: "2025-07-27T18:00:00",
      description: "International show jumping competition with top riders",
      descriptionPl: "Międzynarodowe zawody w skokach przez przeszkody z udziałem najlepszych jeźdźców",
      category: "sports",
      registrationOpen: true,
      deadline: "2025-07-15T23:59:59",
      attendees: 2500,
      type: "equestrian",
      featured: false
    },
    {
      id: "s13",
      title: "Beach Volleyball World Tour",
      titlePl: "Światowy Tour Siatkówki Plażowej",
      location: "Kołobrzeg, Poland",
      locationPl: "Kołobrzeg, Polska",
      startDate: "2025-07-18T09:00:00",
      endDate: "2025-07-21T19:00:00",
      description: "International beach volleyball tournament at Baltic coast",
      descriptionPl: "Międzynarodowy turniej siatkówki plażowej na wybrzeżu Bałtyku",
      category: "sports",
      registrationOpen: true,
      deadline: "2025-07-05T23:59:59",
      attendees: 4000,
      type: "volleyball",
      featured: false
    },
    {
      id: "s14",
      title: "Polish MMA Championship",
      titlePl: "Mistrzostwa Polski MMA",
      location: "Atlas Arena, Lodz",
      locationPl: "Atlas Arena, Łódź",
      startDate: "2025-11-08T18:00:00",
      endDate: "2025-11-08T23:00:00",
      description: "National mixed martial arts championship",
      descriptionPl: "Krajowe mistrzostwa mieszanych sztuk walki",
      category: "sports",
      registrationOpen: false,
      deadline: "2025-10-25T23:59:59",
      attendees: 15000,
      type: "martial-arts",
      featured: true
    },
    {
      id: "s15",
      title: "National Chess Championship",
      titlePl: "Mistrzostwa Polski w Szachach",
      location: "Novotel Centrum, Warsaw",
      locationPl: "Novotel Centrum, Warszawa",
      startDate: "2025-12-01T10:00:00",
      endDate: "2025-12-07T18:00:00",
      description: "Annual chess championship with Poland's best players",
      descriptionPl: "Coroczne mistrzostwa szachowe z udziałem najlepszych polskich zawodników",
      category: "sports",
      registrationOpen: true,
      deadline: "2025-11-20T23:59:59",
      attendees: 200,
      type: "chess",
      featured: false
    },
    {
      id: "s16",
      title: "Rally Poland",
      titlePl: "Rajd Polski",
      location: "Masuria region, Poland",
      locationPl: "Region Mazur, Polska",
      startDate: "2025-06-28T08:00:00",
      endDate: "2025-06-30T18:00:00",
      description: "Round of the European Rally Championship on challenging Polish stages",
      descriptionPl: "Runda Mistrzostw Europy w Rajdach na wymagających polskich odcinkach",
      category: "sports",
      registrationOpen: true,
      deadline: "2025-06-15T23:59:59",
      attendees: 30000,
      type: "motorsport",
      featured: false
    },
    
    // Koncerty - 16 wydarzeń
    {
      id: "c1",
      title: "World Tour Concert - Global Star",
      titlePl: "Koncert World Tour - Światowa Gwiazda",
      location: "PGE National Stadium, Warsaw",
      locationPl: "PGE Stadion Narodowy, Warszawa",
      startDate: "2025-08-15T19:00:00",
      endDate: "2025-08-15T23:00:00",
      description: "Part of the world tour of the famous pop star",
      descriptionPl: "Część światowej trasy koncertowej słynnej gwiazdy pop",
      category: "concerts",
      registrationOpen: false,
      deadline: "2025-07-01T23:59:59",
      attendees: 58000,
      type: "pop",
      featured: true
    },
    // ... więcej wydarzeń dla pozostałych kategorii
  ];

  // Filtrujemy wydarzenia dla danej kategorii
  return allEvents.filter(event => event.category === categoryId);
};

// Komponent do formatowania daty
const FormattedDate = ({ date, language }: { date: string, language: string }) => {
  return (
    <span>
      {format(new Date(date), "d MMMM yyyy, HH:mm", {
        locale: language === 'pl' ? pl : enUS,
      })}
    </span>
  );
};

const AccreditationEvents = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t, currentLanguage } = useI18n();
  const [events, setEvents] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("date-asc");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (categoryId) {
      setEvents(getMockEvents(categoryId));
    }
  }, [categoryId]);

  // Filtrujemy wydarzenia na podstawie wyszukiwania
  const filteredEvents = events.filter(event => 
    (currentLanguage === 'en' ? event.title : event.titlePl)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Sortowanie wydarzeń
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch(sortOrder) {
      case "date-asc":
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case "date-desc":
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case "name-asc":
        return (currentLanguage === 'en' ? a.title : a.titlePl)
          .localeCompare(currentLanguage === 'en' ? b.title : b.titlePl);
      case "name-desc":
        return (currentLanguage === 'en' ? b.title : b.titlePl)
          .localeCompare(currentLanguage === 'en' ? a.title : a.titlePl);
      case "attendees-desc":
        return b.attendees - a.attendees;
      default:
        return 0;
    }
  });

  // Filtrujem wydarzenia na podstawie aktywnej zakładki
  const tabEvents = activeTab === "featured" 
    ? sortedEvents.filter(event => event.featured) 
    : sortedEvents;

  // Mapowanie ID kategorii na nazwy
  const getCategoryName = (id: string) => {
    const categories: Record<string, { en: string, pl: string }> = {
      "festivals": { en: "Festivals", pl: "Festiwale" },
      "sports": { en: "Sports Events", pl: "Wydarzenia sportowe" },
      "concerts": { en: "Concerts", pl: "Koncerty" },
      "press": { en: "Press Conferences", pl: "Konferencje prasowe" },
      "cinema": { en: "Film Premieres", pl: "Premiery filmowe" },
      "media": { en: "Media Events", pl: "Wydarzenia medialne" },
      "business": { en: "Business Events", pl: "Wydarzenia biznesowe" },
      "broadcast": { en: "TV Broadcasts", pl: "Transmisje TV" }
    };
    
    return categories[id] ? 
      (currentLanguage === 'en' ? categories[id].en : categories[id].pl) 
      : (currentLanguage === 'en' ? "Events" : "Wydarzenia");
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center gap-2"
          onClick={() => navigate("/accreditation-categories")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {getCategoryName(categoryId || "")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('accreditation.eventsList')}
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Input
            placeholder={t('common.searchEvents')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md w-full"
          />
          <div className="flex gap-4 w-full sm:w-auto">
            <Select
              value={sortOrder}
              onValueChange={setSortOrder}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={currentLanguage === 'en' ? "Sort by" : "Sortuj według"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="date-asc">{currentLanguage === 'en' ? "Date (ascending)" : "Data (rosnąco)"}</SelectItem>
                  <SelectItem value="date-desc">{currentLanguage === 'en' ? "Date (descending)" : "Data (malejąco)"}</SelectItem>
                  <SelectItem value="name-asc">{currentLanguage === 'en' ? "Name (A-Z)" : "Nazwa (A-Z)"}</SelectItem>
                  <SelectItem value="name-desc">{currentLanguage === 'en' ? "Name (Z-A)" : "Nazwa (Z-A)"}</SelectItem>
                  <SelectItem value="attendees-desc">{currentLanguage === 'en' ? "Popularity" : "Popularność"}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">{currentLanguage === 'en' ? 'All Events' : 'Wszystkie Wydarzenia'}</TabsTrigger>
            <TabsTrigger value="featured">{currentLanguage === 'en' ? 'Featured' : 'Wyróżnione'}</TabsTrigger>
          </TabsList>
        
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderEventCards(tabEvents)}
            </div>
          </TabsContent>
          
          <TabsContent value="featured">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderEventCards(tabEvents)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  // Funkcja do renderowania kart wydarzeń
  function renderEventCards(events: any[]) {
    if (events.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">{t('common.noEventsFound')}</p>
        </div>
      );
    }

    return events.map((event) => (
      <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="line-clamp-2">
            {currentLanguage === 'en' ? event.title : event.titlePl}
          </CardTitle>
          <CardDescription className="flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="line-clamp-1">{currentLanguage === 'en' ? event.location : event.locationPl}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <FormattedDate date={event.startDate} language={currentLanguage} />
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{currentLanguage === 'en' ? "Duration" : "Czas trwania"}: {
                Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24))
              } {currentLanguage === 'en' ? "days" : "dni"}</span>
            </div>
            
            {event.attendees && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                <span>{event.attendees} {currentLanguage === 'en' ? "attendees" : "uczestników"}</span>
              </div>
            )}
            
            <p className="text-sm line-clamp-2">
              {currentLanguage === 'en' ? event.description : event.descriptionPl}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {event.featured && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {currentLanguage === 'en' ? "Featured" : "Wyróżnione"}
                </Badge>
              )}
              {event.type && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {event.type}
                </Badge>
              )}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              {event.registrationOpen ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {t('common.registrationOpen')}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {t('common.registrationClosed')}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {t('common.deadline')}: <FormattedDate date={event.deadline} language={currentLanguage} />
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="default"
            className="w-full"
            onClick={() => navigate(`/accreditation-request/${event.id}`)}
            disabled={!event.registrationOpen}
          >
            {t('accreditation.requestForm')}
          </Button>
        </CardFooter>
      </Card>
    ));
  }
};

export default AccreditationEvents;
