import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, LogOut, User, Crown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="h-7 w-7 text-primary transition-transform duration-300 group-hover:rotate-12" />
              <div className="absolute inset-0 blur-lg bg-primary/30 animate-pulse-slow" />
            </div>
            <span className="text-xl font-bold gradient-text">Texify AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pricing">Pricing</Link>
            </Button>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {profile?.is_pro && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full gradient-primary text-primary-foreground text-sm font-medium">
                    <Crown className="h-4 w-4" />
                    <span>Pro</span>
                  </div>
                )}
                <Button variant="ghost" asChild>
                  <Link to="/app">App</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage src={profile?.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {profile?.full_name?.[0] ?? profile?.email?.[0]?.toUpperCase() ?? <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{profile?.full_name ?? "User"}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {!profile?.is_pro && (
                      <DropdownMenuItem asChild>
                        <Link to="/pricing" className="flex items-center gap-2 cursor-pointer">
                          <Crown className="h-4 w-4 text-primary" />
                          <span>Upgrade to Pro</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/auth?mode=signup">Sign Up Free</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
