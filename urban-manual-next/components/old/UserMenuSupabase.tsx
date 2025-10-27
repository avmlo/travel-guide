import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Heart, Settings, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { getSupabaseClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function UserMenuSupabase() {
  const supabase = getSupabaseClient();
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleLogin = () => {
    setLocation("/auth/login");
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Button
        onClick={handleLogin}
        variant="outline"
        size="sm"
        className="border-gray-300"
      >
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-gray-100">
          {user.user_metadata?.profile_picture ? (
            <img
              src={user.user_metadata.profile_picture}
              alt={user.user_metadata?.name || user.email || "User"}
              className="w-7 h-7 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          )}
          <span className="hidden sm:inline text-sm font-medium">
            {user.user_metadata?.name || "Account"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => setLocation("/account")}>  
          <User className="h-4 w-4 mr-2" />
          My Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocation("/saved")}>
          <Heart className="h-4 w-4 mr-2" />
          Saved Places
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocation("/preferences")}>
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

