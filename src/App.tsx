
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Guests from "./pages/Guests";
import Scanner from "./pages/Scanner";
import Settings from "./pages/Settings";
import InvitationEditor from "./pages/InvitationEditor";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Purchase from "./pages/Purchase";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import Ticketing from "./pages/Ticketing";
import UserProfile from "./pages/UserProfile";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/ticketing" element={<Ticketing />} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route path="/events" element={<ProtectedRoute><MainLayout><Events /></MainLayout></ProtectedRoute>} />
        <Route path="/events/:eventId" element={<ProtectedRoute><MainLayout><EventDetails /></MainLayout></ProtectedRoute>} />
        <Route path="/notifications/:eventId?" element={<ProtectedRoute><MainLayout><Notifications /></MainLayout></ProtectedRoute>} />
        <Route path="/guests" element={<ProtectedRoute><MainLayout><Guests /></MainLayout></ProtectedRoute>} />
        <Route path="/scanner" element={<ProtectedRoute><MainLayout><Scanner /></MainLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
        <Route path="/invitation-editor" element={<ProtectedRoute><MainLayout><InvitationEditor /></MainLayout></ProtectedRoute>} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Toaster />
      <Sonner />
    </QueryClientProvider>
  );
};

export default App;
