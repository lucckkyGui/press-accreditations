
import { Locale } from "@/hooks/useI18n";

export interface MockEvent {
  id: string;
  title: string;
  titlePl: string;
  location: string;
  locationPl: string;
  startDate: string;
  endDate: string;
  description: string;
  descriptionPl: string;
  category: string;
  registrationOpen: boolean;
  deadline: string;
  attendees: number;
  type: string;
  featured: boolean;
}

export type EventSortOrder = "date-asc" | "date-desc" | "name-asc" | "name-desc" | "attendees-desc";

// Get all mock events for a specific category
export const getMockEvents = (categoryId: string): MockEvent[] => {
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
    
    // Concerts - first 16 events (shortened for brevity)
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
    // Add more mock events for other categories as needed
  ];

  // Filter events for the given category
  return allEvents.filter(event => event.category === categoryId);
};

// Category name mapping helper
export const getCategoryName = (categoryId: string, language: Locale) => {
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
  
  return categories[categoryId] ? 
    (language === 'en' ? categories[categoryId].en : categories[categoryId].pl) 
    : (language === 'en' ? "Events" : "Wydarzenia");
};

// Sort events by the given criteria
export const sortEvents = (events: MockEvent[], sortOrder: EventSortOrder, language: Locale): MockEvent[] => {
  return [...events].sort((a, b) => {
    switch(sortOrder) {
      case "date-asc":
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case "date-desc":
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case "name-asc":
        return (language === 'en' ? a.title : a.titlePl)
          .localeCompare(language === 'en' ? b.title : b.titlePl);
      case "name-desc":
        return (language === 'en' ? b.title : b.titlePl)
          .localeCompare(language === 'en' ? a.title : a.titlePl);
      case "attendees-desc":
        return b.attendees - a.attendees;
      default:
        return 0;
    }
  });
};

// Filter events based on search query
export const filterEventsBySearch = (events: MockEvent[], searchQuery: string, language: Locale): MockEvent[] => {
  if (!searchQuery) return events;
  
  return events.filter(event => 
    (language === 'en' ? event.title : event.titlePl)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
};

// Filter events by featured flag
export const filterEventsByFeatured = (events: MockEvent[], onlyFeatured: boolean): MockEvent[] => {
  if (!onlyFeatured) return events;
  return events.filter(event => event.featured);
};
