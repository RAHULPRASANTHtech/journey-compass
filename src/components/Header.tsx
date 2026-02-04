import { useState } from "react";
import { Link } from "react-router-dom";
import { Bus, Moon, Sun, Globe, LogOut, Ticket, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { LANGUAGES } from "@/lib/data";
import { SignInModal } from "./SignInModal";

export function Header() {
  const { theme, toggleTheme, language, setLanguage } = useApp();
  const { isLoggedIn, userEmail, logout } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Bus className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-serif text-2xl font-bold text-foreground">
            Bus<span className="text-primary"> On Go</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          {isLoggedIn && (
            <Link to="/my-bookings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              My Bookings
            </Link>
          )}
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Routes
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Select language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang)}
                  className={`cursor-pointer ${
                    language.code === lang.code ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  <span className="mr-2">{lang.nativeName}</span>
                  <span className="text-muted-foreground text-xs">({lang.name})</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isLoggedIn && userEmail ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="hidden sm:flex gap-2">
                  <span className="max-w-[120px] truncate">{userEmail}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border w-56">
                <DropdownMenuItem asChild>
                  <Link to="/my-bookings" className="cursor-pointer gap-2">
                    <Ticket className="h-4 w-4" />
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              className="hidden sm:flex"
              onClick={() => setSignInOpen(true)}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />
    </header>
  );
}
