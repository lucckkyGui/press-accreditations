
import React from "react";
import { Bell, ChevronDown, LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Header = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    toast.success("Wylogowano pomyślnie");
    navigate("/login");
  };
  
  const handleProfileClick = () => {
    navigate("/settings");
  };

  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="border-b bg-white dark:bg-slate-900 sticky top-0 z-10">
      <div className="px-4 py-3 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-semibold hidden md:block">
            Press Acreditations
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} 
            className="text-muted-foreground hover:text-foreground rounded-full" 
            title={theme === 'light' ? 'Przełącz na tryb ciemny' : 'Przełącz na tryb jasny'}>
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')} 
            className="text-muted-foreground hover:text-foreground rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-500 text-white">OA</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline font-medium">Organizator</span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Ustawienia
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Wyloguj
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
