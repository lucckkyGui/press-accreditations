
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
import ScrollToTop from "./components/common/ScrollToTop";
import SkipToContent from "./components/common/SkipToContent";
import FloatingScrollTop from "./components/common/FloatingScrollTop";
import OnlineStatusToast from "./components/common/OnlineStatusToast";
import CommandPalette from "./components/common/CommandPalette";
import TopProgressBar from "./components/common/TopProgressBar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SkipToContent />
        <ScrollToTop />
        <I18nProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <TooltipProvider delayDuration={0}>
                <AppRoutes />
                <CookieConsent />
                <FloatingScrollTop />
                <OnlineStatusToast />
                <CommandPalette />
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
