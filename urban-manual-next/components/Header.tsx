'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { DarkModeToggle } from "./DarkModeToggle";
import { Menu, X } from "lucide-react";

export function Header() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    router.push("/");
  };

  const navigate = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900">
      {/* Title Bar */}
      <div className="px-6 md:px-10 py-4 dark:text-white">
        <div className="max-w-[1920px] mx-auto">
          <button
            onClick={() => navigate("/")}
            className="text-[clamp(24px,5vw,48px)] font-bold uppercase leading-none tracking-tight hover:opacity-60 transition-opacity"
          >
            The Urban Manual
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="px-6 md:px-10 border-t border-gray-200 dark:border-gray-800 dark:text-white">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between h-12">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate("/")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Catalogue</button>
            <button onClick={() => navigate("/cities")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Cities</button>
            <button onClick={() => navigate("/explore")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Explore</button>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Archive</a>
            <button onClick={() => navigate("/editorial")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Editorial</button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:opacity-60 transition-opacity"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs font-bold uppercase">New York</span>
            <span className="hidden sm:inline text-xs font-bold">{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            <DarkModeToggle />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-in slide-in-from-top-4 duration-200">
          <div className="px-6 py-4 space-y-3">
            <button
              onClick={() => navigate("/")}
              className="block w-full text-left text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2"
            >
              Catalogue
            </button>
            <button
              onClick={() => navigate("/cities")}
              className="block w-full text-left text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2"
            >
              Cities
            </button>
            <button
              onClick={() => navigate("/explore")}
              className="block w-full text-left text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2"
            >
              Explore
            </button>
            <a href="#" className="block text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2">Archive</a>
            <button
              onClick={() => navigate("/editorial")}
              className="block w-full text-left text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2"
            >
              Editorial
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
