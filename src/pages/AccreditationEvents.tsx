
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { TabsContent } from "@/components/ui/tabs";
import { 
  getMockEvents, 
  getCategoryName,
  sortEvents,
  filterEventsBySearch,
  filterEventsByFeatured,
  EventSortOrder,
  MockEvent
} from "@/services/events/mockEventsService";
import EventFilters from "@/components/events/EventFilters";
import EventsGrid from "@/components/events/EventsGrid";

const AccreditationEvents = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t, currentLanguage } = useI18n();
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [sortOrder, setSortOrder] = useState<EventSortOrder>("date-asc");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (categoryId) {
      setEvents(getMockEvents(categoryId));
    }
  }, [categoryId]);

  // Filter events based on search query
  const filteredEvents = filterEventsBySearch(events, searchQuery, currentLanguage);

  // Sort the filtered events
  const sortedEvents = sortEvents(filteredEvents, sortOrder, currentLanguage);

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
            {getCategoryName(categoryId || "", currentLanguage)}
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
        
        <TabsContent value="all">
          <EventsGrid 
            events={activeTab === "all" ? tabEvents : []}
            currentLanguage={currentLanguage}
            noEventsMessage={t('common.noEventsFound')}
            translations={eventCardTranslations}
          />
        </TabsContent>
        
        <TabsContent value="featured">
          <EventsGrid 
            events={activeTab === "featured" ? tabEvents : []}
            currentLanguage={currentLanguage}
            noEventsMessage={t('common.noEventsFound')}
            translations={eventCardTranslations}
          />
        </TabsContent>
      </div>
    </div>
  );
};

export default AccreditationEvents;
