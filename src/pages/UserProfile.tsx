
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserProfileInfo from "@/components/profile/UserProfileInfo";
import PurchasedTickets from "@/components/profile/PurchasedTickets";
import { EnhancedProfileEditForm } from "@/components/profile/EnhancedProfileEditForm";
import SubscriptionManagement from "@/components/profile/SubscriptionManagement";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Ticket as TicketType } from "@/hooks/useTickets";
import { NotificationPermission } from "@/components/notifications/NotificationPermission";
import { InstallPWA } from "@/components/common/InstallPWA";

const UserProfile = () => {
  const { user, profile, isOrganizer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [userData, setUserData] = useState({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    avatarUrl: "",
    role: "guest",
    company: "",
    jobTitle: "",
    phone: "",
    website: "",
    organizationType: "",
    description: "",
    createdAt: new Date()
  });
  
  const [tickets, setTickets] = useState<TicketType[]>([]);
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          // Use profile data from auth context
          const firstName = profile?.firstName || "";
          const lastName = profile?.lastName || "";
          const role = isOrganizer ? "organizer" : isAdmin ? "admin" : "guest";
          const createdAt = user.created_at ? new Date(user.created_at) : new Date();

          // Fetch additional profile data from Supabase
          const { data: profileData } = await supabase
            .from('profiles')
            .select('phone, organization_name')
            .eq('id', user.id)
            .single();
          
          setUserData({
            email: user.email || "",
            firstName,
            lastName,
            avatarUrl: profile?.avatarUrl || "",
            role,
            company: profileData?.organization_name || "",
            jobTitle: "",
            phone: profileData?.phone || "",
            website: "",
            organizationType: "",
            description: "",
            createdAt
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error("Failed to load profile data");
        }
      }
    };
    
    fetchUserProfile();
  }, [user, profile, isOrganizer, isAdmin]);

  // Update URL when tab changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set("tab", activeTab);
    navigate({ search: newSearchParams.toString() }, { replace: true });
  }, [activeTab, navigate, location.search]);
  
  // Handle profile update
  const handleSaveProfile = async (formData: Partial<typeof userData>) => {
    try {
      // In a real app, this would update the database
      setUserData(prev => ({
        ...prev,
        ...formData
      }));
      
      toast.success("Profile updated successfully");
      setIsEditFormOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background p-4">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Mój profil</h1>
          </div>
          
          {/* Mobile app install */}
          <InstallPWA showOfflineIndicator={false} />
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets ({tickets.length})</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <UserProfileInfo 
              user={userData} 
              onEditProfile={() => setIsEditFormOpen(true)}
            />
            
            <EnhancedProfileEditForm
              user={userData}
              isOpen={isEditFormOpen}
              onClose={() => setIsEditFormOpen(false)}
              onSave={handleSaveProfile}
            />
          </TabsContent>
          
          <TabsContent value="tickets">
            <PurchasedTickets tickets={tickets} />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Ustawienia powiadomień</h2>
              
              <div className="space-y-6">
                {/* Powiadomienia push */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Powiadomienia mobilne</h3>
                  <p className="text-muted-foreground text-sm">
                    Otrzymuj powiadomienia o nadchodzących wydarzeniach, zmianach i ważnych aktualizacjach.
                  </p>
                  <NotificationPermission className="mt-2" />
                </div>
                
                {/* Instalacja aplikacji mobilnej */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Aplikacja mobilna</h3>
                  <p className="text-muted-foreground text-sm">
                    Zainstaluj naszą aplikację, aby mieć szybszy dostęp do wszystkich funkcji i możliwość
                    korzystania z aplikacji offline.
                  </p>
                  <InstallPWA className="mt-2" variant="default" />
                </div>
              </div>
            </div>
            
            {/* Offline indicator */}
            <div>
              <InstallPWA variant="ghost" showOfflineIndicator={true} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="bg-muted py-6 border-t">
        <div className="container text-center">
          <p className="text-muted-foreground">© 2025 Press Acreditations. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
};

export default UserProfile;
