import { useLocation } from "wouter";
import { UserMenuSupabase } from "./UserMenuSupabase";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface NavigationProps {
  cities: string[];
  currentCity?: string;
}

export function Navigation({ cities, currentCity }: NavigationProps) {
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-[1920px] mx-auto px-6 md:px-10 py-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <button
            onClick={() => setLocation("/")}
            className="hover:opacity-60 transition-opacity"
          >
            <h1 className="text-[clamp(32px,6vw,72px)] font-bold uppercase leading-none tracking-tight text-black dark:text-white">
              THE URBAN MANUAL
            </h1>
          </button>
          <div className="flex items-center gap-3">
            <UserMenuSupabase />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:opacity-60 rounded-lg transition-opacity"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 pt-4 pb-2 space-y-2">
            <button 
              onClick={() => { setLocation("/"); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 text-xs font-bold uppercase hover:opacity-60 transition-opacity border border-gray-200 dark:border-gray-800 rounded-lg"
            >
              CATALOGUE
            </button>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-xs font-bold uppercase hover:opacity-60 transition-opacity border border-gray-200 dark:border-gray-800 rounded-lg"
            >
              INFO
            </button>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-xs font-bold uppercase hover:opacity-60 transition-opacity border border-gray-200 dark:border-gray-800 rounded-lg"
            >
              ARCHIVE
            </button>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-xs font-bold uppercase hover:opacity-60 transition-opacity border border-gray-200 dark:border-gray-800 rounded-lg"
            >
              EDITORIAL
            </button>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="text-xs font-bold uppercase text-black dark:text-white">NEW YORK</div>
              <div className="text-xs font-bold text-black dark:text-white">{formatTime(currentTime)}</div>
            </div>
          </div>
        )}

        {/* Desktop Header */}
        <div className="hidden md:block">
          {/* Top Row: Logo */}
          <div className="mb-4">
            <button
              onClick={() => setLocation("/")}
              className="hover:opacity-60 transition-opacity"
            >
              <h1 className="text-[clamp(32px,6vw,72px)] font-bold uppercase leading-none tracking-tight text-black dark:text-white">
                THE URBAN MANUAL
              </h1>
            </button>
          </div>

          {/* Middle Row: Navigation Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLocation("/")}
                className="px-4 py-2 text-xs font-bold uppercase hover:opacity-60 transition-opacity border border-gray-200 dark:border-gray-800 rounded-lg"
              >
                CATALOGUE
              </button>
              <button className="px-4 py-2 text-xs font-bold uppercase hover:opacity-60 transition-opacity border border-gray-200 dark:border-gray-800 rounded-lg">
                INFO
              </button>
              <button className="px-4 py-2 text-xs font-bold uppercase hover:opacity-60 transition-opacity border border-gray-200 dark:border-gray-800 rounded-lg">
                ARCHIVE
              </button>
              <button className="px-4 py-2 text-xs font-bold uppercase hover:opacity-60 transition-opacity border border-gray-200 dark:border-gray-800 rounded-lg">
                EDITORIAL
              </button>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-xs font-bold uppercase">NEW YORK</span>
                <span className="text-xs font-bold ml-2">{formatTime(currentTime)}</span>
              </div>
              <UserMenuSupabase />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

