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
    <nav className="sticky top-0 z-50 bg-white border-b border-black">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <button
            onClick={() => setLocation("/")}
            className="hover:opacity-70 transition-opacity"
          >
            <h1 className="text-3xl font-black uppercase tracking-tighter">
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
          <div className="md:hidden border-t border-black pt-4 pb-2 space-y-3">
            <button 
              onClick={() => { setLocation("/"); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 bg-blue-600 text-white font-bold uppercase text-sm tracking-wide rounded-full hover:bg-blue-700 transition-colors"
            >
              CATALOGUE
            </button>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 bg-orange-500 text-white font-bold uppercase text-sm tracking-wide rounded-full hover:bg-orange-600 transition-colors"
            >
              INFO
            </button>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 bg-purple-600 text-white font-bold uppercase text-sm tracking-wide rounded-full hover:bg-purple-700 transition-colors"
            >
              ARCHIVE
            </button>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 bg-teal-500 text-white font-bold uppercase text-sm tracking-wide rounded-full hover:bg-teal-600 transition-colors"
            >
              EDITORIAL
            </button>
            <div className="pt-3 border-t border-black">
              <div className="text-xs font-bold text-black">NEW YORK</div>
              <div className="text-xs font-bold text-black">{formatTime(currentTime)}</div>
            </div>
          </div>
        )}

        {/* Desktop Header */}
        <div className="hidden md:block">
          {/* Top Row: Massive Logo */}
          <div className="mb-4">
            <button
              onClick={() => setLocation("/")}
              className="hover:opacity-70 transition-opacity"
            >
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tighter leading-none">
                THE URBAN MANUAL
              </h1>
            </button>
          </div>

          {/* Middle Row: Colored Navigation Tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setLocation("/")}
                className="px-4 py-1.5 bg-blue-600 text-white font-bold uppercase text-xs tracking-wide rounded-full hover:bg-blue-700 transition-colors"
              >
                CATALOGUE
              </button>
              <button className="px-4 py-1.5 bg-orange-500 text-white font-bold uppercase text-xs tracking-wide rounded-full hover:bg-orange-600 transition-colors">
                INFO
              </button>
              <button className="px-4 py-1.5 bg-purple-600 text-white font-bold uppercase text-xs tracking-wide rounded-full hover:bg-purple-700 transition-colors">
                ARCHIVE
              </button>
              <button className="px-4 py-1.5 bg-teal-500 text-white font-bold uppercase text-xs tracking-wide rounded-full hover:bg-teal-600 transition-colors">
                EDITORIAL
              </button>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs font-bold uppercase">NEW YORK {formatTime(currentTime)}</div>
              </div>
              <UserMenuSupabase />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

