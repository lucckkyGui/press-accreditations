
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/auth/Register";
import AuthCallback from "@/pages/AuthCallback";
import NotFound from "@/pages/NotFound";
import AccessDenied from "@/pages/AccessDenied";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Lazy-loaded pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Guests = lazy(() => import("@/pages/Guests"));
const Events = lazy(() => import("@/pages/Events"));
const EventDetails = lazy(() => import("@/pages/EventDetails"));
const Scanner = lazy(() => import("@/pages/Scanner"));
const SettingsPage = lazy(() => import("@/pages/Settings"));
const ProfileSettings = lazy(() => import("@/pages/settings/ProfileSettings"));
const AccountSettings = lazy(() => import("@/pages/settings/AccountSettings"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Ticketing = lazy(() => import("@/pages/Ticketing"));
const PressReleasePage = lazy(() => import("@/pages/PressReleasePage"));
const MediaPortalPage = lazy(() => import("@/pages/MediaPortalPage"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Products = lazy(() => import("@/pages/products/Products"));
const ProductDetails = lazy(() => import("@/pages/products/ProductDetails"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderDetails = lazy(() => import("@/pages/OrderDetails"));
const Purchase = lazy(() => import("@/pages/Purchase"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const AccreditationCategories = lazy(() => import("@/pages/AccreditationCategories"));
const AccreditationEvents = lazy(() => import("@/pages/AccreditationEvents"));
const AccreditationRequest = lazy(() => import("@/pages/AccreditationRequest"));
const InvitationEditor = lazy(() => import("@/pages/InvitationEditor"));
const RfidScanner = lazy(() => import("@/pages/RfidScanner"));
const WristbandManagement = lazy(() => import("@/pages/WristbandManagement"));
const ZoneHeatmap = lazy(() => import("@/pages/ZoneHeatmap"));
const SelfCheckInKiosk = lazy(() => import("@/pages/SelfCheckInKiosk"));
const LiveDashboard = lazy(() => import("@/pages/LiveDashboard"));
const PostEventReport = lazy(() => import("@/pages/PostEventReport"));
const PitchDeck = lazy(() => import("@/pages/PitchDeck"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const EmbedWidget = lazy(() => import("@/pages/EmbedWidget"));
const EmbedRegisterForm = lazy(() => import("@/pages/EmbedRegisterForm"));
const Waitlist = lazy(() => import("@/pages/Waitlist"));
const AIChatSupport = lazy(() => import("@/pages/AIChatSupport"));
const SponsorReport = lazy(() => import("@/pages/SponsorReport"));
const LandingPageBuilder = lazy(() => import("@/pages/LandingPageBuilder"));
const PublicAccreditationPage = lazy(() => import("@/pages/PublicAccreditationPage"));
const HelpCenter = lazy(() => import("@/pages/HelpCenter"));

// New pages — phases 6-35
const AdminMonitoring = lazy(() => import("@/pages/AdminMonitoring"));
const AIDashboard = lazy(() => import("@/pages/AIDashboard"));
const AffiliateDashboard = lazy(() => import("@/pages/AffiliateDashboard"));
const WhiteLabelSettings = lazy(() => import("@/pages/WhiteLabelSettings"));
const IntegrationsHub = lazy(() => import("@/pages/IntegrationsHub"));
const ReportBuilder = lazy(() => import("@/pages/ReportBuilder"));
const EventMarketplace = lazy(() => import("@/pages/EventMarketplace"));
const AuditTrail = lazy(() => import("@/pages/AuditTrail"));
const DigitalPassPage = lazy(() => import("@/pages/DigitalPassPage"));

const LazyFallback = () => (
  <div className="h-64 flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

const ORGANIZER_ROLES = ['admin', 'organizer'] as const;
const STAFF_ROLES = ['admin', 'organizer', 'staff'] as const;
const ALL_AUTHENTICATED = ['admin', 'organizer', 'moderator', 'staff', 'user', 'guest'] as const;

const AppRoutes = () => {
  return (
    <Suspense fallback={<LazyFallback />}>
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
        <Route path="/marketplace" element={<EventMarketplace />} />
        {/* Public accreditation landing page - must be before catch-all */}
        <Route path="/:slug" element={<PublicAccreditationPage />} />
        
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
          <Route path="/landing-page/:eventId" element={<LandingPageBuilder />} />
          {/* New pages — phases 6-35 */}
          <Route path="/admin/monitoring" element={<AdminMonitoring />} />
          <Route path="/ai-dashboard" element={<AIDashboard />} />
          <Route path="/affiliate" element={<AffiliateDashboard />} />
          <Route path="/white-label" element={<WhiteLabelSettings />} />
          <Route path="/integrations" element={<IntegrationsHub />} />
          <Route path="/report-builder" element={<ReportBuilder />} />
          <Route path="/audit-trail" element={<AuditTrail />} />
          <Route path="/digital-pass" element={<DigitalPassPage />} />
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
          <Route path="/help" element={<HelpCenter />} />
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
    </Suspense>
  );
};

export default AppRoutes;
