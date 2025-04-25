import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserProfileInfo from "@/components/profile/UserProfileInfo";
import PurchasedTickets from "@/components/profile/PurchasedTickets";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const UserProfile = () => {
  const { user } = useAuth();
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
    createdAt: new Date()
  });
  
  // Mock purchased tickets data (would normally come from a database)
  const [tickets, setTickets] = useState([
    {
      id: "ticket-1",
      eventName: "Konferencja Tech 2025",
      ticketType: "VIP Pass",
      purchaseDate: new Date(2025, 3, 10),
      eventDate: new Date(2025, 5, 15),
      price: 299,
      status: "active" as const,
      qrCode: "CONF-2025-VIP-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    },
    {
      id: "ticket-2",
      eventName: "Festiwal Muzyczny",
      ticketType: "Karnet 3-dniowy",
      purchaseDate: new Date(2025, 2, 5),
      eventDate: new Date(2025, 6, 1),
      price: 450,
      status: "active" as const,
      qrCode: "FEST-3DAY-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    },
    {
      id: "ticket-3",
      eventName: "Wykład: Sztuczna Inteligencja",
      ticketType: "Wstęp Normalny",
      purchaseDate: new Date(2025, 1, 20),
      eventDate: new Date(2025, 2, 15),
      price: 75,
      status: "used" as const,
      qrCode: "AI-TALK-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    }
  ]);
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          // In a real app, this would fetch from your profile database
          // Replace with actual Supabase query when available
          const firstName = user.user_metadata?.first_name || "";
          const lastName = user.user_metadata?.last_name || "";
          const role = user.user_metadata?.role || "guest";
          const company = user.user_metadata?.company || "";
          const createdAt = user.created_at ? new Date(user.created_at) : new Date();
          
          setUserData({
            email: user.email || "",
            firstName,
            lastName,
            avatarUrl: "",
            role,
            company,
            createdAt
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error("Nie udało się załadować danych profilu");
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);

  // Update URL when tab changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set("tab", activeTab);
    navigate({ search: newSearchParams.toString() }, { replace: true });
  }, [activeTab, navigate, location.search]);
  
  // Handle profile update
  const handleSaveProfile = async (formData: { firstName: string; lastName: string; company?: string }) => {
    try {
      // In a real app, this would update the database
      // For now, we'll just update the local state
      setUserData({
        ...userData,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company || "",
      });
      
      toast.success("Profil zaktualizowany pomyślnie");
      setIsEditFormOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Nie udało się zaktualizować profilu");
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
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="tickets">Moje bilety ({tickets.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <UserProfileInfo 
              user={userData} 
              onEditProfile={() => setIsEditFormOpen(true)}
            />
            
            <ProfileEditForm
              user={userData}
              isOpen={isEditFormOpen}
              onClose={() => setIsEditFormOpen(false)}
              onSave={handleSaveProfile}
            />
          </TabsContent>
          
          <TabsContent value="tickets">
            <PurchasedTickets tickets={tickets} />
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
