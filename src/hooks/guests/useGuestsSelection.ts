
import { useState } from 'react';
import { Guest } from "@/types";

export const useGuestsSelection = () => {
  const [selectedGuests, setSelectedGuests] = useState<Guest[]>([]);

  const clearSelection = () => {
    setSelectedGuests([]);
  };

  const toggleGuest = (guest: Guest) => {
    setSelectedGuests(prev => 
      prev.find(g => g.id === guest.id)
        ? prev.filter(g => g.id !== guest.id)
        : [...prev, guest]
    );
  };

  const selectAll = (guests: Guest[]) => {
    setSelectedGuests(guests);
  };

  const isSelected = (guestId: string) => {
    return selectedGuests.some(g => g.id === guestId);
  };

  return {
    selectedGuests,
    setSelectedGuests,
    clearSelection,
    toggleGuest,
    selectAll,
    isSelected
  };
};
