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
    <div className="flex w-full items-center rounded-xl border border-border/70 bg-background/90 px-3 py-2 shadow-sm backdrop-blur-md sm:px-4">
      <div className="flex items-center gap-2 shrink-0">
        <QrCode className="h-5 w-5 text-primary" />
        <span className="whitespace-nowrap text-base font-bold text-foreground sm:text-lg">Press Accreditations</span>
      </div>
      
      <div className="flex-1" />

      {/* Mobile hamburger */}
      <button
        className="p-2 text-foreground sm:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Desktop nav */}
      <div className="hidden sm:flex items-center gap-3">
        {user ? (
          <>
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:bg-muted hover:text-foreground">
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => navigate("/profile")} className="gap-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <User className="h-4 w-4" />
              Profil
            </Button>
            <Button onClick={() => signOut()} variant="outline" className="border-border text-foreground hover:bg-muted">
              Wyloguj
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => navigate("/auth/login")} className="text-muted-foreground hover:bg-muted hover:text-foreground">
              Zaloguj się
            </Button>
            <Button onClick={() => navigate("/auth/register")} className="gradient-primary text-primary-foreground hover:opacity-90">
              Wypróbuj za darmo
            </Button>
          </>
        )}
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 flex flex-col gap-2 rounded-xl border border-border bg-background p-4 shadow-lg backdrop-blur-lg sm:hidden">
          {user ? (
            <>
              <Button variant="ghost" onClick={() => { navigate("/dashboard"); setMenuOpen(false); }} className="justify-start text-muted-foreground hover:bg-muted hover:text-foreground">
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => { navigate("/profile"); setMenuOpen(false); }} className="justify-start gap-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                <User className="h-4 w-4" />
                Profil
              </Button>
              <Button onClick={() => { signOut(); setMenuOpen(false); }} variant="outline" className="border-border text-foreground hover:bg-muted">
                Wyloguj
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => { navigate("/auth/login"); setMenuOpen(false); }} className="justify-start text-muted-foreground hover:bg-muted hover:text-foreground">
                Zaloguj się
              </Button>
              <Button onClick={() => { navigate("/auth/register"); setMenuOpen(false); }} className="gradient-primary text-primary-foreground hover:opacity-90">
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
