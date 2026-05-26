
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { supabase } from "@/integrations/supabase/client";
import type { EventSortOrder, PublicAccreditationEvent } from "@/types/event/event";
import EventFilters from "@/components/events/EventFilters";
import EventsGrid from "@/components/events/EventsGrid";

const getCategoryName = (categoryId: string) => categoryId;

const filterEventsByFeatured = (
  events: PublicAccreditationEvent[],
  featured: boolean
): PublicAccreditationEvent[] => {
  if (!featured) return events;
  return events.filter((event) => event.featured);
};

const sortEvents = (
  events: PublicAccreditationEvent[],
  sortOrder: EventSortOrder
): PublicAccreditationEvent[] => {
  const sorted = [...events];
  switch (sortOrder) {
    case "date-asc":
      return sorted.sort((a, b) => a.startDate.localeCompare(b.startDate));
    case "date-desc":
      return sorted.sort((a, b) => b.startDate.localeCompare(a.startDate));
    case "name-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "name-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case "attendees-desc":
      return sorted.sort((a, b) => b.attendees - a.attendees);
    default:
      return sorted;
  }
};

const filterEventsBySearch = (
  events: PublicAccreditationEvent[],
  query: string
): PublicAccreditationEvent[] => {
  if (!query) return events;
  const normalizedQuery = query.toLowerCase();
  return events.filter((event) =>
    [
      event.title,
      event.titlePl,
      event.location,
      event.locationPl,
      event.description,
      event.descriptionPl,
    ].some((value) => value.toLowerCase().includes(normalizedQuery))
  );
};

const AccreditationEvents = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t, currentLanguage } = useI18n();
  const [events, setEvents] = useState<PublicAccreditationEvent[]>([]);
  const [sortOrder, setSortOrder] = useState<EventSortOrder>("date-asc");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!categoryId) return;

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id,title,description,location,start_date,end_date,category,max_guests,is_published")
        .eq("is_published", true)
        .eq("category", categoryId)
        .order("start_date", { ascending: true });

      if (error) {
        setEvents([]);
        return;
      }

      setEvents((data || []).map((event) => {
        const title = event.title || "";
        const location = event.location || "";
        const description = event.description || "";
        const endDate = event.end_date || event.start_date;

        return {
          id: event.id,
          title,
          titlePl: title,
          location,
          locationPl: location,
          startDate: event.start_date,
          endDate,
          description,
          descriptionPl: description,
          category: event.category || categoryId,
          registrationOpen: Boolean(event.is_published) && new Date(endDate).getTime() >= Date.now(),
          deadline: event.start_date,
          attendees: event.max_guests || 0,
          type: event.category || categoryId,
          featured: false,
        };
      }));
    };

    fetchEvents();
  }, [categoryId]);

  // Filter events based on search query
  const filteredEvents = filterEventsBySearch(events, searchQuery);

  // Sort the filtered events
  const sortedEvents = sortEvents(filteredEvents, sortOrder);

  // Filter events based on the active tab (all or featured)
  const tabEvents = filterEventsByFeatured(sortedEvents, activeTab === "featured");
  
  // Translations for the child components
  const filterTranslations = {
    searchEvents: t('common.searchEvents'),
    sortBy: currentLanguage === 'en' ? "Sort by" : "Sortuj według",
    dateAsc: currentLanguage === 'en' ? "Date (ascending)" : "Data (rosnąco)",
    dateDesc: currentLanguage === 'en' ? "Date (descending)" : "Data (malejąco)",
    nameAsc: currentLanguage === 'en' ? "Name (A-Z)" : "Nazwa (A-Z)",
    nameDesc: currentLanguage === 'en' ? "Name (Z-A)" : "Nazwa (Z-A)",
    popularity: currentLanguage === 'en' ? "Popularity" : "Popularność",
    allEvents: currentLanguage === 'en' ? 'All Events' : 'Wszystkie Wydarzenia',
    featured: currentLanguage === 'en' ? 'Featured' : 'Wyróżnione',
  };

  const eventCardTranslations = {
    duration: currentLanguage === 'en' ? "Duration" : "Czas trwania",
    days: t('common.days'),
    attendees: t('common.attendees'),
    deadline: t('common.deadline'),
    registrationOpen: t('common.registrationOpen'),
    registrationClosed: t('common.registrationClosed'),
    requestForm: t('accreditation.requestForm'),
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

        <EventFilters 
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          activeTab={activeTab}
          onSearchChange={setSearchQuery}
          onSortChange={setSortOrder}
          onTabChange={setActiveTab}
          translations={filterTranslations}
        />
        
        <EventsGrid 
          events={tabEvents}
          currentLanguage={currentLanguage}
          noEventsMessage={t('common.noEventsFound')}
          translations={eventCardTranslations}
        />
      </div>
    </div>
  );
};

export default AccreditationEvents;
