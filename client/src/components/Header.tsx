import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { NotificationDropdown } from "./NotificationDropdown";

export function Header() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  return (
    <header className="border-b border-gray-200">
      {/* Title Bar */}
      <div className="px-6 md:px-10 py-4">
        <div className="max-w-[1920px] mx-auto">
          <button 
            onClick={() => setLocation("/")}
            className="text-[clamp(24px,5vw,48px)] font-bold uppercase leading-none tracking-tight hover:opacity-60 transition-opacity"
          >
            The Urban Manual
          </button>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <div className="px-6 md:px-10 border-t border-gray-200">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between h-12">
          <div className="flex items-center gap-6">
            <button onClick={() => setLocation("/")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Catalogue</button>
            <button onClick={() => setLocation("/cities")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Cities</button>
            <button onClick={() => setLocation("/explore")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Explore</button>
            {user && <button onClick={() => setLocation("/feed")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Feed</button>}
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Archive</a>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Editorial</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase">New York</span>
            <span className="text-xs font-bold">{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            {user && <NotificationDropdown />}
            {user ? (
              <button 
                onClick={handleSignOut}
                className="text-xs font-bold uppercase hover:opacity-60 transition-opacity"
              >
                Sign Out
              </button>
            ) : (
              <button 
                onClick={() => setLocation('/account')}
                className="text-xs font-bold uppercase hover:opacity-60 transition-opacity"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

