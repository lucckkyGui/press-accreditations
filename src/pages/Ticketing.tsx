
import React from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import TicketingSystem from "@/components/ticketing/TicketingSystem";
import { useAuth } from "@/hooks/useAuth";
import PageLayout from "@/components/layout/PageLayout";

const Ticketing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleTicketCheckout = () => {
    toast.success("Bilety zostały zarezerwowane pomyślnie!");
    setTimeout(() => navigate("/profile?tab=tickets"), 1500);
  };

  return (
    <PageLayout 
      title="System Biletowy" 
      subtitle="Zarezerwuj bilety na wybrane wydarzenia i zarządzaj swoimi akredytacjami."
    >
      <TicketingSystem standalone={true} onCheckout={handleTicketCheckout} />
    </PageLayout>
  );
};

export default Ticketing;
