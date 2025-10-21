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
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <button
            onClick={() => setLocation("/")}
            className="hover:opacity-70 transition-opacity"
          >
            <h1 className="text-2xl font-bold uppercase tracking-tight">
              THE URBAN MANUAL
            </h1>
          </button>
          <div className="flex items-center gap-3">
            <UserMenuSupabase />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-2 space-y-3">
            <button 
              onClick={() => { setLocation("/"); setMobileMenuOpen(false); }}
              className="block w-full text-left text-sm font-bold uppercase tracking-wide hover:opacity-70 transition-opacity py-2"
            >
              CATALOGUE
            </button>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left text-sm font-bold uppercase tracking-wide hover:opacity-70 transition-opacity py-2"
            >
              INFO
            </button>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left text-sm font-bold uppercase tracking-wide hover:opacity-70 transition-opacity py-2"
            >
              ARCHIVE
            </button>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left text-sm font-bold uppercase tracking-wide hover:opacity-70 transition-opacity py-2"
            >
              EDITORIAL
            </button>
            <div className="pt-3 border-t border-gray-200">
              <div className="text-xs font-bold text-gray-600">New York</div>
              <div className="text-xs font-bold text-gray-600">{formatTime(currentTime)}</div>
            </div>
          </div>
        )}

        {/* Desktop Header */}
        <div className="hidden md:block">
          {/* Top Row: Logo */}
          <div className="mb-6">
            <button
              onClick={() => setLocation("/")}
              className="hover:opacity-70 transition-opacity"
            >
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold uppercase tracking-tight">
                THE URBAN MANUAL
              </h1>
            </button>
          </div>

          {/* Bottom Row: Navigation Links and Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 lg:gap-8">
              <button 
                onClick={() => setLocation("/")}
                className="text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity"
              >
                CATALOGUE
              </button>
              <button className="text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity">
                INFO
              </button>
              <button className="text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity">
                ARCHIVE
              </button>
              <button className="text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity">
                EDITORIAL
              </button>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs font-bold">New York</div>
                <div className="text-xs font-bold">{formatTime(currentTime)}</div>
              </div>
              <UserMenuSupabase />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

