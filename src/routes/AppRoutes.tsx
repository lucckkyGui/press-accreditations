
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import HomePage from "@/pages/HomePage";
import Login from "@/pages/Login";
import Register from "@/pages/auth/Register";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import EnhancedDashboard from "@/pages/EnhancedDashboard";
import Guests from "@/pages/Guests";
import AdvancedGuests from "@/pages/AdvancedGuests";
import Events from "@/pages/Events";
import Scanner from "@/pages/Scanner";
import SettingsPage from "@/pages/Settings";
import ProfileSettings from "@/pages/settings/ProfileSettings";
import AccountSettings from "@/pages/settings/AccountSettings";
import Notifications from "@/pages/Notifications";
import Ticketing from "@/pages/Ticketing";
import PressReleasePage from "@/pages/PressReleasePage";
import UserProfile from "@/pages/UserProfile";
import Products from "@/pages/products/Products";
import ProductDetails from "@/pages/products/ProductDetails";
import NotFound from "@/pages/NotFound";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/home" element={<HomePage />} />
      
      {/* Auth routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      {/* Redirect old /login to new path */}
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      
      {/* Products routes */}
      <Route path="/products" element={<Products />} />
      <Route path="/products/:productId" element={<ProductDetails />} />

      {/* Protected routes with MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/enhanced-dashboard" element={<EnhancedDashboard />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/advanced-guests" element={<AdvancedGuests />} />
        <Route path="/events" element={<Events />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/profile" element={<ProfileSettings />} />
        <Route path="/settings/account" element={<AccountSettings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/ticketing" element={<Ticketing />} />
        <Route path="/press-releases" element={<PressReleasePage />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
