import { SupportedLanguage } from "@/i18n/languages";

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

export function getMockEvents(_categoryId: string): MockEvent[] {
  return [];
}

export function getCategoryName(categoryId: string, _language: string): string {
  return categoryId;
}

export function filterEventsByFeatured(events: MockEvent[], featured: boolean): MockEvent[] {
  if (!featured) return events;
  return events.filter(e => e.featured);
}

export function sortEvents(events: MockEvent[], sortOrder: EventSortOrder): MockEvent[] {
  const sorted = [...events];
  switch (sortOrder) {
    case "date-asc": return sorted.sort((a, b) => a.startDate.localeCompare(b.startDate));
    case "date-desc": return sorted.sort((a, b) => b.startDate.localeCompare(a.startDate));
    case "name-asc": return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "name-desc": return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case "attendees-desc": return sorted.sort((a, b) => b.attendees - a.attendees);
    default: return sorted;
  }
}

export function filterEventsBySearch(events: MockEvent[], query: string): MockEvent[] {
  if (!query) return events;
  const q = query.toLowerCase();
  return events.filter(e =>
    e.title.toLowerCase().includes(q) || e.titlePl.toLowerCase().includes(q) ||
    e.location.toLowerCase().includes(q) || e.locationPl.toLowerCase().includes(q)
  );
}

export function getLocalizedEvent(event: MockEvent, language: SupportedLanguage) {
  const isPl = language === 'pl';
  return {
    ...event,
    title: isPl ? event.titlePl : event.title,
    location: isPl ? event.locationPl : event.location,
    description: isPl ? event.descriptionPl : event.description,
  };
}
