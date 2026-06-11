
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { GenericPageSkeleton } from "@/components/common/PageSkeleton";
import { features } from "@/config/features";

// Lazy-load ALL pages including auth pages to slim down app core
const Index = lazy(() => import("@/pages/Index"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AccessDenied = lazy(() => import("@/pages/AccessDenied"));

// Lazy-loaded pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Guests = lazy(() => import("@/pages/Guests"));
const Events = lazy(() => import("@/pages/Events"));
const EventDetails = lazy(() => import("@/pages/EventDetails"));
const Scanner = lazy(() => import("@/pages/Scanner"));
const Diagnostics = lazy(() => import("@/pages/Diagnostics"));
const SettingsPage = lazy(() => import("@/pages/Settings"));
const ProfileSettings = lazy(() => import("@/pages/settings/ProfileSettings"));
const AccountSettings = lazy(() => import("@/pages/settings/AccountSettings"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Ticketing = lazy(() => import("@/pages/Ticketing"));
const PressReleasePage = lazy(() => import("@/pages/PressReleasePage"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Products = lazy(() => import("@/pages/products/Products"));
const ProductDetails = lazy(() => import("@/pages/products/ProductDetails"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderDetails = lazy(() => import("@/pages/OrderDetails"));
const Purchase = lazy(() => import("@/pages/Purchase"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const InvitationEditor = lazy(() => import("@/pages/InvitationEditor"));
const RfidScanner = lazy(() => import("@/pages/RfidScanner"));
const WristbandManagement = lazy(() => import("@/pages/WristbandManagement"));
const LiveDashboard = lazy(() => import("@/pages/LiveDashboard"));
const PostEventReport = lazy(() => import("@/pages/PostEventReport"));

const Onboarding = lazy(() => import("@/pages/Onboarding"));
const EmbedWidget = lazy(() => import("@/pages/EmbedWidget"));
const EmbedRegisterForm = lazy(() => import("@/pages/EmbedRegisterForm"));
const Waitlist = lazy(() => import("@/pages/Waitlist"));
const SponsorReport = lazy(() => import("@/pages/SponsorReport"));
const LandingPageBuilder = lazy(() => import("@/pages/LandingPageBuilder"));
const PublicAccreditationPage = lazy(() => import("@/pages/PublicAccreditationPage"));
const PassView = lazy(() => import("@/pages/PassView"));
const CoverageForm = lazy(() => import("@/pages/CoverageForm"));
const MediaCrmPage = lazy(() => import("@/pages/MediaCrmPage"));
const CoverageBoardPage = lazy(() => import("@/pages/CoverageBoardPage"));
const MediaCoverageReport = lazy(() => import("@/pages/MediaCoverageReport"));
const SecurityGdprPage = lazy(() => import("@/pages/SecurityGdprPage"));
const HelpCenter = lazy(() => import("@/pages/HelpCenter"));

const AdminMonitoring = lazy(() => import("@/pages/AdminMonitoring"));

const WhiteLabelSettings = lazy(() => import("@/pages/WhiteLabelSettings"));
const IntegrationsHub = lazy(() => import("@/pages/IntegrationsHub"));
const ReportBuilder = lazy(() => import("@/pages/ReportBuilder"));
const AuditTrail = lazy(() => import("@/pages/AuditTrail"));
const DigitalPassPage = lazy(() => import("@/pages/DigitalPassPage"));

const LazyFallback = () => (
  <div className="p-6">
    <GenericPageSkeleton />
  </div>
);

const ORGANIZER_ROLES = ['admin', 'organizer'] as const;
const ADMIN_ROLES = ['admin'] as const;
const ALL_AUTHENTICATED = ['admin', 'organizer', 'moderator', 'staff', 'user', 'guest'] as const;

const disabledOrganizerFeature = <Navigate to="/dashboard" replace />;

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
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/embed/register/:eventId" element={<EmbedRegisterForm />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        {/* Public QR pass (link z e-maila decyzyjnego) - before catch-all /:slug */}
        <Route path="/pass/:token" element={<PassView />} />
        {/* Public coverage form (secure token link z remindera) - before catch-all */}
        <Route path="/coverage/:token" element={<CoverageForm />} />
        {/* Public accreditation landing page - must be before catch-all */}
        <Route path="/:slug" element={<PublicAccreditationPage />} />
        
        {/* Organizer & Admin routes */}
        <Route element={
          <ProtectedRoute allowedRoles={[...ORGANIZER_ROLES]}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/guests" element={<Guests />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="/invitation-editor" element={<InvitationEditor />} />
          <Route path="/ticketing" element={<Ticketing />} />
          <Route path="/press-releases" element={<PressReleasePage />} />
          <Route path="/media-crm" element={<MediaCrmPage />} />
          <Route path="/coverage-board" element={<CoverageBoardPage />} />
          <Route path="/coverage-report" element={<MediaCoverageReport />} />
          <Route path="/security-gdpr" element={<SecurityGdprPage />} />
          <Route path="/rfid-scanner" element={features.rfid ? <RfidScanner /> : disabledOrganizerFeature} />
          <Route path="/wristbands" element={features.wristbands ? <WristbandManagement /> : disabledOrganizerFeature} />
          
          <Route path="/post-event-report" element={<PostEventReport />} />
          <Route path="/embed-widget" element={<EmbedWidget />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/sponsor-report" element={<SponsorReport />} />
          <Route path="/landing-page/:eventId" element={features.landingPageBuilder ? <LandingPageBuilder /> : disabledOrganizerFeature} />
          <Route path="/admin/monitoring" element={<AdminMonitoring />} />
          <Route path="/white-label" element={features.whiteLabel ? <WhiteLabelSettings /> : disabledOrganizerFeature} />
          <Route path="/integrations" element={<IntegrationsHub />} />
          <Route path="/report-builder" element={<ReportBuilder />} />
          <Route path="/audit-trail" element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES]}>
              <AuditTrail />
            </ProtectedRoute>
          } />
          <Route path="/digital-pass" element={<DigitalPassPage />} />
        </Route>

        {/* All authenticated users */}
        <Route element={
          <ProtectedRoute allowedRoles={[...ALL_AUTHENTICATED]}>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Dashboard sam rozdziela widok po roli (Organizer/Guest) — dostępny
              dla wszystkich zalogowanych; wcześniej gość lądował na AccessDenied. */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/profile" element={<ProfileSettings />} />
          <Route path="/settings/account" element={<AccountSettings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/help" element={<HelpCenter />} />
        </Route>

        {/* Full-screen protected */}
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
