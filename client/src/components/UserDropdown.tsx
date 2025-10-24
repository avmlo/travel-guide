import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { User } from "@/types/user";
import { useLocation } from "wouter";

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('username, display_name, profile_photo')
        .eq('user_id', user.id)
        .single();

      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  const displayName = userProfile?.display_name || userProfile?.username || "Account";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-bold uppercase hover:opacity-60 transition-opacity"
      >
        {userProfile?.profile_photo ? (
          <img
            src={userProfile.profile_photo}
            alt={displayName}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <User className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{displayName}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-2">
            {/* Profile Link */}
            {userProfile?.username && (
              <button
                onClick={() => {
                  setLocation(`/user/${userProfile.username}`);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                View Profile
              </button>
            )}

            {/* Account Settings */}
            <button
              onClick={() => {
                setLocation('/account');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Account Settings
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2" />

            {/* Sign Out */}
            <button
              onClick={() => {
                handleSignOut();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

