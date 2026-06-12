
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Settings, Search, PanelLeftClose, PanelLeft } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useI18n } from "@/hooks/useI18n";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useSidebar } from "@/components/ui/sidebar";
import { useWindowSize } from "@/hooks/useWindowSize";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppBreadcrumbs from "@/components/common/AppBreadcrumbs";

const Header: React.FC = () => {
  const { t } = useI18n();
  const { setOpenMobile, toggleSidebar, state: sidebarState } = useSidebar();
  const { isMobile } = useWindowSize();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const initials = [profile?.firstName?.[0], profile?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "U";

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch {
      // ignore
    }
  };

  const openSearch = () =>
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 w-full hair-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-12 items-center gap-2 px-3 md:px-4">

        {/* Desktop: sidebar toggle */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {sidebarState === "collapsed"
              ? <PanelLeft className="h-4 w-4" />
              : <PanelLeftClose className="h-4 w-4" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>

        {/* Mobile: hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setOpenMobile(true)}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">{t("navigation.toggleMenu")}</span>
        </Button>

        {/* Divider */}
        <div className="hidden md:block h-5 w-px bg-border mx-1 shrink-0" />

        {/* Breadcrumbs — desktop */}
        <div className="hidden md:flex flex-1 min-w-0">
          <AppBreadcrumbs />
        </div>

        {/* Mobile: logo */}
        <div className="md:hidden flex justify-center flex-1">
          <Link to="/dashboard" className="text-sm font-semibold text-foreground tracking-tight">
            Akredytacje
          </Link>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Search ⌘K — desktop */}
          {!isMobile && (
            <button
              onClick={openSearch}
              className="hidden md:flex items-center gap-2 h-8 px-2.5 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-[12px]">Szukaj</span>
              <span className="kbd ml-1">⌘K</span>
            </button>
          )}

          {/* Language switcher */}
          <LanguageSwitcher variant={isMobile ? "icon" : "full"} />

          {/* Notifications */}
          {!isMobile && <NotificationCenter />}

          {/* Settings link — desktop */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                <span className="sr-only">{t("navigation.settings")}</span>
              </Link>
            </Button>
          )}

          {/* User avatar / sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="h-8 w-8 rounded-full flex items-center justify-center hover:ring-2 ring-primary/30 transition-all">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={profile?.avatarUrl || undefined} />
                  <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </SheetTrigger>
            <SheetContent className="w-72">
              <div className="flex flex-col gap-1 py-4">
                {/* User info */}
                <div className="flex items-center gap-3 px-2 pb-4 hair-b mb-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatarUrl || undefined} />
                    <AvatarFallback className="text-[11px] bg-muted text-muted-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {profile?.firstName} {profile?.lastName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {profile?.email}
                    </p>
                  </div>
                </div>

                <Button variant="ghost" size="sm" asChild className="justify-start gap-2 h-9">
                  <Link to="/profile">{t("navigation.profile")}</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="justify-start gap-2 h-9">
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                    {t("navigation.settings")}
                  </Link>
                </Button>

                <div className="hair-t mt-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start gap-2 h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {t("navigation.logOut")}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
