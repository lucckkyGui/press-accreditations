
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/auth/Register";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import Guests from "@/pages/Guests";
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
import AccessDenied from "@/pages/AccessDenied";
import Onboarding from "@/pages/Onboarding";
import EmbedWidget from "@/pages/EmbedWidget";
import EmbedRegisterForm from "@/pages/EmbedRegisterForm";
import Waitlist from "@/pages/Waitlist";
import AIChatSupport from "@/pages/AIChatSupport";
import SponsorReport from "@/pages/SponsorReport";
import LandingPageBuilder from "@/pages/LandingPageBuilder";
import PublicAccreditationPage from "@/pages/PublicAccreditationPage";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const ORGANIZER_ROLES = ['admin', 'organizer'] as const;
const STAFF_ROLES = ['admin', 'organizer', 'staff'] as const;
const ALL_AUTHENTICATED = ['admin', 'organizer', 'moderator', 'staff', 'user', 'guest'] as const;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing page — shows HomePage or redirects to dashboard */}
      <Route path="/" element={<Index />} />
      
      {/* Auth routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Legacy redirects */}
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/enhanced-dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/advanced-guests" element={<Navigate to="/guests" replace />} />
      
      {/* Public pages */}
      <Route path="/products" element={<Products />} />
      <Route path="/products/:productId" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/pitch" element={<PitchDeck />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/embed/register/:eventId" element={<EmbedRegisterForm />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      
      {/* Public accreditation */}
      <Route path="/accreditation-categories" element={<AccreditationCategories />} />
      <Route path="/accreditation-events/:categoryId" element={<AccreditationEvents />} />
      <Route path="/accreditation-request/:eventId" element={<AccreditationRequest />} />

      {/* Organizer & Admin routes */}
      <Route element={
        <ProtectedRoute allowedRoles={[...ORGANIZER_ROLES]}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/invitation-editor" element={<InvitationEditor />} />
        <Route path="/ticketing" element={<Ticketing />} />
        <Route path="/press-releases" element={<PressReleasePage />} />
        <Route path="/media-portal" element={<MediaPortalPage />} />
        <Route path="/rfid-scanner" element={<RfidScanner />} />
        <Route path="/wristbands" element={<WristbandManagement />} />
        <Route path="/zone-heatmap" element={<ZoneHeatmap />} />
        <Route path="/post-event-report" element={<PostEventReport />} />
        <Route path="/embed-widget" element={<EmbedWidget />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/sponsor-report" element={<SponsorReport />} />
      </Route>

      {/* All authenticated users */}
      <Route element={
        <ProtectedRoute allowedRoles={[...ALL_AUTHENTICATED]}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/profile" element={<ProfileSettings />} />
        <Route path="/settings/account" element={<AccountSettings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/ai-support" element={<AIChatSupport />} />
      </Route>

      {/* Full-screen protected */}
      <Route path="/kiosk" element={
        <ProtectedRoute allowedRoles={[...STAFF_ROLES]}>
          <SelfCheckInKiosk />
        </ProtectedRoute>
      } />
      <Route path="/live-dashboard" element={
        <ProtectedRoute allowedRoles={[...ORGANIZER_ROLES]}>
          <LiveDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
