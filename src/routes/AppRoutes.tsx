
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import EnhancedDashboard from "@/pages/EnhancedDashboard";
import Guests from "@/pages/Guests";
import Events from "@/pages/Events";
import Scanner from "@/pages/Scanner";
import SettingsPage from "@/pages/Settings";
import Notifications from "@/pages/Notifications";
import NotFound from "@/pages/NotFound";

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/enhanced-dashboard" element={<EnhancedDashboard />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/events" element={<Events />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <SonnerToaster />
    </>
  );
};

export default AppRoutes;
