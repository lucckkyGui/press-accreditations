
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const UserNavigation = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleOrganizatorLogin = () => {
    navigate("/login", { state: { role: "organizator" } });
  };

  const handleGuestLogin = () => {
    navigate("/login", { state: { role: "guest" } });
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="space-x-4 flex items-center">
      {user ? (
        <>
          <Button variant="ghost" onClick={handleProfileClick} className="gap-2">
            <User className="h-4 w-4" />
            Mój profil
          </Button>
          <Button onClick={() => signOut()}>Wyloguj się</Button>
        </>
      ) : (
        <>
          <Button variant="ghost" onClick={handleGuestLogin}>Zaloguj jako Gość</Button>
          <Button onClick={handleOrganizatorLogin}>Zaloguj jako Organizator</Button>
        </>
      )}
    </div>
  );
};

export default UserNavigation;
