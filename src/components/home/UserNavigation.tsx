
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogIn, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";

const UserNavigation = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleOrganizatorLogin = () => {
    navigate("/login", { state: { role: "organizator" } });
  };

  const handleGuestLogin = () => {
    navigate("/login", { state: { role: "guest" } });
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="space-x-4 flex items-center">
      <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
      
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
