
import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import TicketingSystem from "@/components/ticketing/TicketingSystem";
import TicketFilters from "@/components/ticketing/TicketFilters";
import { useAuth } from "@/hooks/useAuth";
import PageLayout from "@/components/layout/PageLayout";

const Ticketing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });

  const handleTicketCheckout = () => {
    toast.success("Bilety zostały zarezerwowane pomyślnie!");
    setTimeout(() => navigate("/profile?tab=tickets"), 1500);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (order: string) => {
    setSortOrder(order);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
    toast.info(`Filtrowanie cen: ${min} PLN - ${max === Infinity ? 'max' : max + ' PLN'}`);
  };

  return (
    <PageLayout 
      title="System Biletowy" 
      subtitle="Zarezerwuj bilety na wybrane wydarzenia i zarządzaj swoimi akredytacjami."
    >
      <div className="space-y-6">
        <TicketFilters
          onSearch={handleSearch}
          onSortChange={handleSort}
          onPriceRangeChange={handlePriceRangeChange}
        />
        <TicketingSystem 
          standalone={true} 
          onCheckout={handleTicketCheckout}
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          priceRange={priceRange}
        />
      </div>
    </PageLayout>
  );
};

export default Ticketing;
