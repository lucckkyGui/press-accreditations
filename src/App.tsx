
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Guests from "./pages/Guests";
import Scanner from "./pages/Scanner";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import InvitationEditor from "./pages/InvitationEditor";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Purchase from "./pages/Purchase";
import Index from "./pages/Index";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";

const App = () => {
  // Create QueryClient instance inside component
  const [queryClient] = useState(() => new QueryClient());

  // Simple component for route protection
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
      // Check if user is logged in - using local storage in MVP
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

    // Guests are only allowed certain paths
    if (userRole === "guest") {
      const currentPath = window.location.pathname;
      if (currentPath !== "/scanner") {
        return <Navigate to="/scanner" />;
      }
    }

    return children;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/purchase" element={<Purchase />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><MainLayout><Events /></MainLayout></ProtectedRoute>} />
            <Route path="/events/:eventId" element={<ProtectedRoute><MainLayout><EventDetails /></MainLayout></ProtectedRoute>} />
            <Route path="/notifications/:eventId?" element={<ProtectedRoute><MainLayout><Notifications /></MainLayout></ProtectedRoute>} />
            <Route path="/guests" element={<ProtectedRoute><MainLayout><Guests /></MainLayout></ProtectedRoute>} />
            <Route path="/scanner" element={<ProtectedRoute><MainLayout><Scanner /></MainLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
            <Route path="/invitation-editor" element={<ProtectedRoute><MainLayout><InvitationEditor /></MainLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
