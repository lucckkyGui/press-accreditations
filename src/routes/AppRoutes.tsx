
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
import EventDetails from "@/pages/EventDetails";
import Scanner from "@/pages/Scanner";
import SettingsPage from "@/pages/Settings";
import ProfileSettings from "@/pages/settings/ProfileSettings";
import AccountSettings from "@/pages/settings/AccountSettings";
import Notifications from "@/pages/Notifications";
import Ticketing from "@/pages/Ticketing";
import PressReleasePage from "@/pages/PressReleasePage";
import MediaPortalPage from "@/pages/MediaPortalPage";
import UserProfile from "@/pages/UserProfile";
import Products from "@/pages/products/Products";
import ProductDetails from "@/pages/products/ProductDetails";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import OrderDetails from "@/pages/OrderDetails";
import Purchase from "@/pages/Purchase";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import AccreditationCategories from "@/pages/AccreditationCategories";
import AccreditationEvents from "@/pages/AccreditationEvents";
import AccreditationRequest from "@/pages/AccreditationRequest";
import InvitationEditor from "@/pages/InvitationEditor";
import RfidScanner from "@/pages/RfidScanner";
import WristbandManagement from "@/pages/WristbandManagement";
import ZoneHeatmap from "@/pages/ZoneHeatmap";
import SelfCheckInKiosk from "@/pages/SelfCheckInKiosk";
import LiveDashboard from "@/pages/LiveDashboard";
import PostEventReport from "@/pages/PostEventReport";
import PitchDeck from "@/pages/PitchDeck";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";
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
      
      {/* Shopping routes */}
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:id" element={<OrderDetails />} />
      
      {/* Info pages */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/pitch" element={<PitchDeck />} />
      <Route path="/onboarding" element={<Onboarding />} />
      
      {/* Accreditation public routes */}
      <Route path="/accreditation-categories" element={<AccreditationCategories />} />
      <Route path="/accreditation-events/:categoryId" element={<AccreditationEvents />} />
      <Route path="/accreditation-request/:eventId" element={<AccreditationRequest />} />

      {/* All app routes with MainLayout — public access */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/enhanced-dashboard" element={<EnhancedDashboard />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/advanced-guests" element={<AdvancedGuests />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/profile" element={<ProfileSettings />} />
        <Route path="/settings/account" element={<AccountSettings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/ticketing" element={<Ticketing />} />
        <Route path="/press-releases" element={<PressReleasePage />} />
        <Route path="/media-portal" element={<MediaPortalPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/invitation-editor" element={<InvitationEditor />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/rfid-scanner" element={<RfidScanner />} />
        <Route path="/wristbands" element={<WristbandManagement />} />
        <Route path="/zone-heatmap" element={<ZoneHeatmap />} />
        <Route path="/post-event-report" element={<PostEventReport />} />
      </Route>

      {/* Full-screen routes */}
      <Route path="/kiosk" element={<SelfCheckInKiosk />} />
      <Route path="/live-dashboard" element={<LiveDashboard />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
