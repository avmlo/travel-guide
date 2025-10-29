import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Heart, Settings, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export function UserMenu() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  if (isLoading) {
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
        <Button variant="ghost" size="sm" className="gap-2">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || "User"}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{user.name || "Account"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
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

