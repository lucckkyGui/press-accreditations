import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

const COOKIE_CONSENT_KEY = "cookie-consent-accepted";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "all");
    setVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "necessary");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-5 duration-500">
      <div className="container max-w-4xl">
        <div className="bg-card border rounded-xl shadow-lg p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Cookie className="h-8 w-8 text-primary shrink-0 hidden sm:block" />
          <div className="flex-1">
            <p className="text-sm text-foreground">
              Używamy plików cookies, aby zapewnić prawidłowe działanie serwisu. 
              Szczegóły znajdziesz w naszej{" "}
              <Link to="/privacy" className="text-primary underline hover:no-underline">
                Polityce Prywatności
              </Link>.
            </p>
          </div>
          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={acceptNecessary} className="flex-1 sm:flex-none">
              Tylko niezbędne
            </Button>
            <Button size="sm" onClick={acceptAll} className="flex-1 sm:flex-none">
              Akceptuję wszystkie
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
