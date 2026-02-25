import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, QrCode } from "lucide-react";
import { useAuth } from "@/hooks/auth";

const UserNavigation = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 mr-4">
        <QrCode className="h-5 w-5 text-white" />
        <span className="text-white font-bold text-lg">Press Accreditations</span>
      </div>
      
      <div className="flex-1" />
      
      {user ? (
        <>
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="text-white/80 hover:text-white hover:bg-white/10">
            Dashboard
          </Button>
          <Button variant="ghost" onClick={() => navigate("/profile")} className="text-white/80 hover:text-white hover:bg-white/10 gap-2">
            <User className="h-4 w-4" />
            Profil
          </Button>
          <Button onClick={() => signOut()} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Wyloguj
          </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" onClick={() => navigate("/auth/login")} className="text-white/80 hover:text-white hover:bg-white/10">
            Zaloguj się
          </Button>
          <Button onClick={() => navigate("/auth/register")} className="bg-white text-slate-900 hover:bg-white/90">
            Wypróbuj za darmo
          </Button>
        </>
      )}
    </div>
  );
};

export default UserNavigation;
