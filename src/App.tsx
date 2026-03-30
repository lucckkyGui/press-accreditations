
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/auth/AuthProvider";
import { I18nProvider } from "./hooks/useI18n";
import CookieConsent from "./components/common/CookieConsent";
import ErrorBoundary from "./components/common/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <I18nProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <TooltipProvider delayDuration={0}>
                <AppRoutes />
                <CookieConsent />
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </AuthProvider>
          </QueryClientProvider>
        </I18nProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
