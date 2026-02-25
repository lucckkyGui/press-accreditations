import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, QrCode, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/auth";

const UserNavigation = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-center w-full">
      <div className="flex items-center gap-2 shrink-0">
        <QrCode className="h-5 w-5 text-white" />
        <span className="text-white font-bold text-base sm:text-lg whitespace-nowrap">Press Accreditations</span>
      </div>
      
      <div className="flex-1" />

      {/* Mobile hamburger */}
      <button
        className="sm:hidden text-white p-2"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Desktop nav */}
      <div className="hidden sm:flex items-center gap-3">
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

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 p-4 flex flex-col gap-2 z-50">
          {user ? (
            <>
              <Button variant="ghost" onClick={() => { navigate("/dashboard"); setMenuOpen(false); }} className="text-white/80 hover:text-white hover:bg-white/10 justify-start">
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => { navigate("/profile"); setMenuOpen(false); }} className="text-white/80 hover:text-white hover:bg-white/10 justify-start gap-2">
                <User className="h-4 w-4" />
                Profil
              </Button>
              <Button onClick={() => { signOut(); setMenuOpen(false); }} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Wyloguj
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => { navigate("/auth/login"); setMenuOpen(false); }} className="text-white/80 hover:text-white hover:bg-white/10 justify-start">
                Zaloguj się
              </Button>
              <Button onClick={() => { navigate("/auth/register"); setMenuOpen(false); }} className="bg-white text-slate-900 hover:bg-white/90">
                Wypróbuj za darmo
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserNavigation;
