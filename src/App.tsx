
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Guests from "./pages/Guests";
import Scanner from "./pages/Scanner";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import InvitationEditor from "./pages/InvitationEditor";
import Login from "./pages/Login";

// Przeniesienie inicjalizacji QueryClient do wnętrza komponentu App
const App = () => {
  // Utworzenie instancji QueryClient wewnątrz komponentu
  const [queryClient] = useState(() => new QueryClient());

  // Prosty komponent do ochrony tras
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      // Sprawdzamy, czy użytkownik jest zalogowany - w MVP używamy lokalnego storage
      const checkAuth = () => {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        setIsAuthenticated(isLoggedIn);
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

    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/events/:eventId" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
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
