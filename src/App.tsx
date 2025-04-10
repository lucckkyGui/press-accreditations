
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Guests from "./pages/Guests";
import Scanner from "./pages/Scanner";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import InvitationEditor from "./pages/InvitationEditor";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import Notifications from "./pages/Notifications";
import Purchase from "./pages/Purchase";

const App = () => {
  // Create a new QueryClient instance
  const [queryClient] = useState(() => new QueryClient());

  // Simple component for protected routes
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
      // Check if user is logged in - using localStorage in MVP
      const checkAuth = () => {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const role = localStorage.getItem("userRole");
        setIsAuthenticated(isLoggedIn);
        setUserRole(role);
        setIsLoading(false);
      };

      checkAuth();
    }, []);

    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    // For guests, only certain paths are allowed
    if (userRole === "guest") {
      const currentPath = window.location.pathname;
      if (currentPath !== "/scanner") {
        return <Navigate to="/scanner" />;
      }
    }

    return <>{children}</>;
  };

  // Guest route component
  const GuestRoute = ({ children }: { children: React.ReactNode }) => {
    const userRole = localStorage.getItem("userRole");
    
    if (userRole === "guest") {
      return <>{children}</>;
    }
    
    return <Navigate to="/" />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={
              localStorage.getItem("isLoggedIn") === "true" 
                ? <Dashboard /> 
                : <HomePage />
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/purchase" element={<Purchase />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/events/:eventId" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
            <Route path="/notifications/:eventId?" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/guests" element={<ProtectedRoute><Guests /></ProtectedRoute>} />
            <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/invitation-editor" element={<ProtectedRoute><InvitationEditor /></ProtectedRoute>} />
            <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
