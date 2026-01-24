
import { useState, useEffect } from 'react';
import { useAuth } from './auth';

// Types for the tickets
export interface Ticket {
  id: string;
  eventName: string;
  ticketType: string;
  purchaseDate: Date;
  eventDate: Date;
  price: number;
  status: "active" | "used" | "expired";
  qrCode: string;
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  // Statistics
  const totalTickets = tickets.length;
  const activeTickets = tickets.filter(ticket => ticket.status === 'active').length;
  const usedTickets = tickets.filter(ticket => ticket.status === 'used').length;
  
  // Get unique upcoming events (events with active tickets where event date > now)
  const now = new Date();
  const upcomingEvents = new Set(
    tickets
      .filter(ticket => ticket.status === 'active' && new Date(ticket.eventDate) > now)
      .map(ticket => ticket.eventName)
  ).size;

  useEffect(() => {
    const fetchTickets = async () => {
      // In a real app, this would fetch from Supabase or an API
      try {
        setLoading(true);
        // Simulate API call with a timeout
        setTimeout(() => {
          // Mock data for tickets
          const mockTickets: Ticket[] = [
            {
              id: "ticket-1",
              eventName: "Tech Conference 2025",
              ticketType: "VIP",
              purchaseDate: new Date(2025, 2, 15),
              eventDate: new Date(2025, 3, 20),
              price: 299,
              status: "active",
              qrCode: "TECH-2025-VIP-001"
            },
            {
              id: "ticket-2",
              eventName: "Music Festival",
              ticketType: "General Admission",
              purchaseDate: new Date(2025, 1, 10),
              eventDate: new Date(2025, 4, 5),
              price: 129,
              status: "active",
              qrCode: "MUSIC-2025-GA-002"
            },
            {
              id: "ticket-3",
              eventName: "Developer Workshop",
              ticketType: "Early Bird",
              purchaseDate: new Date(2024, 11, 20),
              eventDate: new Date(2025, 0, 15),
              price: 79,
              status: "used",
              qrCode: "DEV-2025-EB-003"
            }
          ];
          
          setTickets(mockTickets);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setLoading(false);
      }
    };

    if (user) {
      fetchTickets();
    } else {
      setTickets([]);
      setLoading(false);
    }
  }, [user]);

  return {
    tickets,
    loading,
    error,
    stats: {
      totalTickets,
      activeTickets, 
      usedTickets,
      upcomingEvents
    }
  };
}
