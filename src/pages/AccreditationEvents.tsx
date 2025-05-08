
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { pl, enUS } from "date-fns/locale";

// Rozszerzone przykładowe dane wydarzeń dla różnych kategorii
const getMockEvents = (categoryId: string) => {
  const allEvents = [
    // Festiwale
    {
      id: "1",
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
      deadline: "2025-05-15T23:59:59"
    },
    {
      id: "2",
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
      deadline: "2025-06-01T23:59:59"
    },
    // Wydarzenia sportowe
    {
      id: "3",
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
      deadline: "2025-04-15T23:59:59"
    },
    {
      id: "4",
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
      deadline: "2025-07-01T23:59:59"
    },
    // Koncerty
    {
      id: "5",
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
      deadline: "2025-07-01T23:59:59"
    },
    {
      id: "6",
      title: "Symphony Orchestra Performance",
      titlePl: "Występ Orkiestry Symfonicznej",
      location: "National Philharmonic, Warsaw",
      locationPl: "Filharmonia Narodowa, Warszawa",
      startDate: "2025-09-10T19:00:00",
      endDate: "2025-09-10T21:30:00",
      description: "Classical music concert featuring famous compositions",
      descriptionPl: "Koncert muzyki klasycznej prezentujący słynne kompozycje",
      category: "concerts",
      registrationOpen: true,
      deadline: "2025-08-20T23:59:59"
    },
    // Konferencje prasowe
    {
      id: "7",
      title: "Economic Summit 2025",
      titlePl: "Szczyt Ekonomiczny 2025",
      location: "ICE Congress Centre, Krakow",
      locationPl: "Centrum Kongresowe ICE, Kraków",
      startDate: "2025-09-05T09:00:00",
      endDate: "2025-09-07T18:00:00",
      description: "Annual meeting of economic leaders and policy makers",
      descriptionPl: "Coroczne spotkanie liderów gospodarczych i decydentów",
      category: "press",
      registrationOpen: true,
      deadline: "2025-08-01T23:59:59"
    },
    {
      id: "8",
      title: "Government Press Briefing",
      titlePl: "Rządowy Briefing Prasowy",
      location: "Prime Minister's Office, Warsaw",
      locationPl: "Kancelaria Premiera, Warszawa",
      startDate: "2025-06-25T11:00:00",
      endDate: "2025-06-25T12:30:00",
      description: "Official government press conference on current affairs",
      descriptionPl: "Oficjalna konferencja prasowa rządu o bieżących sprawach",
      category: "press",
      registrationOpen: true,
      deadline: "2025-06-20T23:59:59"
    },
    // Premiery filmowe
    {
      id: "9",
      title: "Blockbuster Movie Premiere",
      titlePl: "Premiera Filmu Kasowego",
      location: "Cinema City, Warsaw",
      locationPl: "Cinema City, Warszawa",
      startDate: "2025-07-20T18:00:00",
      endDate: "2025-07-20T23:00:00",
      description: "Red carpet event for the premiere of an international blockbuster",
      descriptionPl: "Wydarzenie z czerwonym dywanem na premierę międzynarodowego hitu",
      category: "cinema",
      registrationOpen: true,
      deadline: "2025-07-10T23:59:59"
    },
    // Wydarzenia medialne
    {
      id: "10",
      title: "Press Tour - New Technology Park",
      titlePl: "Wizyta Prasowa - Nowy Park Technologiczny",
      location: "Technology Park, Poznan",
      locationPl: "Park Technologiczny, Poznań",
      startDate: "2025-10-05T10:00:00",
      endDate: "2025-10-05T16:00:00",
      description: "Media visit to the newly opened technology innovation center",
      descriptionPl: "Wizyta mediów w nowo otwartym centrum innowacji technologicznych",
      category: "media",
      registrationOpen: true,
      deadline: "2025-09-25T23:59:59"
    },
    // Wydarzenia biznesowe
    {
      id: "11",
      title: "Product Launch - Tech Giant",
      titlePl: "Premiera Produktu - Gigant Technologiczny",
      location: "Expo XXI, Warsaw",
      locationPl: "Expo XXI, Warszawa",
      startDate: "2025-11-15T14:00:00",
      endDate: "2025-11-15T18:00:00",
      description: "Launch event for the newest flagship products",
      descriptionPl: "Wydarzenie inauguracyjne dla najnowszych flagowych produktów",
      category: "business",
      registrationOpen: false,
      deadline: "2025-10-30T23:59:59"
    },
    // Transmisje TV
    {
      id: "12",
      title: "Live TV Show Recording",
      titlePl: "Nagranie Programu TV na Żywo",
      location: "TVP Studio, Warsaw",
      locationPl: "Studio TVP, Warszawa",
      startDate: "2025-06-30T17:00:00",
      endDate: "2025-06-30T19:00:00",
      description: "Recording of a popular television entertainment show",
      descriptionPl: "Nagranie popularnego programu rozrywkowego",
      category: "broadcast",
      registrationOpen: true,
      deadline: "2025-06-20T23:59:59"
    }
  ];

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

  useEffect(() => {
    if (categoryId) {
      setEvents(getMockEvents(categoryId));
    }
  }, [categoryId]);

  const filteredEvents = events.filter(event => 
    (currentLanguage === 'en' ? event.title : event.titlePl)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

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

        <div className="mb-6">
          <Input
            placeholder={t('common.searchEvents')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md mx-auto"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>
                  {currentLanguage === 'en' ? event.title : event.titlePl}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{currentLanguage === 'en' ? event.location : event.locationPl}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <FormattedDate date={event.startDate} language={currentLanguage} />
                </div>
                <p className="text-sm line-clamp-2">
                  {currentLanguage === 'en' ? event.description : event.descriptionPl}
                </p>
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
          )) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">{t('common.noEventsFound')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccreditationEvents;
