import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Music, Users, Award, Mic, Film, Newspaper, Camera, Briefcase, Tv } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const eventCategories = [
  {
    id: "festivals",
    title: "Festivals",
    titlePl: "Festiwale",
    icon: Award,
    count: 12,
    color: "bg-violet-500",
    description: "Cultural and music festivals",
    descriptionPl: "Festiwale kulturalne i muzyczne"
  },
  {
    id: "sports",
    title: "Sports Events",
    titlePl: "Wydarzenia sportowe",
    icon: Users,
    count: 8,
    color: "bg-blue-500",
    description: "Professional sports competitions",
    descriptionPl: "Profesjonalne zawody sportowe"
  },
  {
    id: "concerts",
    title: "Concerts",
    titlePl: "Koncerty",
    icon: Music,
    count: 15,
    color: "bg-pink-500",
    description: "Live music performances",
    descriptionPl: "Koncerty na żywo"
  },
  {
    id: "press",
    title: "Press Conferences",
    titlePl: "Konferencje prasowe",
    icon: Mic,
    count: 6,
    color: "bg-amber-500",
    description: "Media announcements and Q&A sessions",
    descriptionPl: "Ogłoszenia dla mediów i sesje Q&A"
  },
  {
    id: "cinema",
    title: "Film Premieres",
    titlePl: "Premiery filmowe",
    icon: Film,
    count: 9,
    color: "bg-red-500",
    description: "Movie premieres and film festivals",
    descriptionPl: "Premiery filmowe i festiwale filmowe"
  },
  {
    id: "media",
    title: "Media Events",
    titlePl: "Wydarzenia medialne",
    icon: Camera,
    count: 7,
    color: "bg-emerald-500",
    description: "Press tours and media days",
    descriptionPl: "Wyjazdy prasowe i dni medialne"
  },
  {
    id: "business",
    title: "Business Events",
    titlePl: "Wydarzenia biznesowe",
    icon: Briefcase,
    count: 5,
    color: "bg-slate-600",
    description: "Corporate announcements and product launches",
    descriptionPl: "Ogłoszenia korporacyjne i premiery produktów"
  },
  {
    id: "broadcast",
    title: "TV Broadcasts",
    titlePl: "Transmisje TV",
    icon: Tv,
    count: 4,
    color: "bg-indigo-500",
    description: "Television programs and broadcasts",
    descriptionPl: "Programy i transmisje telewizyjne"
  }
];

const AccreditationCategories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t, currentLanguage } = useI18n();
  const [activeTab, setActiveTab] = useState("all");

  const filteredCategories = eventCategories.filter(category => 
    (currentLanguage === 'en' ? category.title : category.titlePl)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const featuredCategories = filteredCategories.slice(0, 4);
  const otherCategories = filteredCategories.slice(4);
  
  const getTabContent = (tab) => {
    switch(tab) {
      case "featured":
        return featuredCategories;
      case "all":
        return filteredCategories;
      default:
        return filteredCategories;
    }
  };

  // Function to render category cards
  const renderCategoryCards = (categories) => {
    return categories.map((category) => (
      <Card key={category.id} className="overflow-hidden hover:shadow-lg transition-shadow border-t-4" style={{ borderTopColor: category.color.replace('bg-', '') }}>
        <CardHeader className={`${category.color} text-white`}>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl text-white">
              {currentLanguage === 'en' ? category.title : category.titlePl}
            </CardTitle>
            <category.icon className="h-8 w-8 text-white/80" />
          </div>
          <CardDescription className="text-white/90 mt-1">
            {currentLanguage === 'en' ? category.description : category.descriptionPl}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-muted/50">{category.count} {t('common.events')}</Badge>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="default"
            className="w-full"
            onClick={() => navigate(`/accreditation-events/${category.id}`)}
          >
            {t('common.browse')}
          </Button>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('accreditation.title')}</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            {currentLanguage === 'en' ? 
              "Browse categories and find events to request press accreditation for your media coverage" : 
              "Przeglądaj kategorie i znajdź wydarzenia, dla których chcesz uzyskać akredytację prasową"}
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between max-w-2xl mx-auto">
          <Input
            placeholder={t('common.searchEvents')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md w-full"
          />
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">{currentLanguage === 'en' ? 'All' : 'Wszystkie'}</TabsTrigger>
              <TabsTrigger value="featured">{currentLanguage === 'en' ? 'Featured' : 'Wyróżnione'}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {renderCategoryCards(getTabContent('all'))}
            </div>
          </TabsContent>

          <TabsContent value="featured">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {renderCategoryCards(getTabContent('featured'))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-10 bg-muted rounded-lg p-6 shadow-sm max-w-2xl mx-auto">
          <h2 className="font-semibold text-xl mb-2">{t('common.needHelp')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('common.contactSupport')}
          </p>
          <Button variant="outline">
            {t('common.contactUs')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccreditationCategories;
