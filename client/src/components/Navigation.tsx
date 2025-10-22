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
            <h1 className="text-4xl font-black uppercase tracking-tighter">
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
              className="block w-full text-left px-6 py-3 bg-blue-600 text-white font-black uppercase text-base tracking-wider rounded-full hover:bg-blue-700 transition-colors"
            >
              CATALOGUE
            </button>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-6 py-3 bg-orange-500 text-white font-black uppercase text-base tracking-wider rounded-full hover:bg-orange-600 transition-colors"
            >
              INFO
            </button>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-6 py-3 bg-purple-600 text-white font-black uppercase text-base tracking-wider rounded-full hover:bg-purple-700 transition-colors"
            >
              ARCHIVE
            </button>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-6 py-3 bg-teal-500 text-white font-black uppercase text-base tracking-wider rounded-full hover:bg-teal-600 transition-colors"
            >
              EDITORIAL
            </button>
            <div className="pt-3 border-t border-black">
              <div className="text-sm font-black text-black uppercase tracking-wider">NEW YORK</div>
              <div className="text-sm font-black text-black uppercase tracking-wider">{formatTime(currentTime)}</div>
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
              <h1 className="text-7xl lg:text-8xl xl:text-9xl font-black uppercase tracking-tighter leading-none">
                THE URBAN MANUAL
              </h1>
            </button>
          </div>

          {/* Middle Row: Colored Navigation Tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setLocation("/")}
                className="px-6 py-2 bg-blue-600 text-white font-black uppercase text-sm tracking-wider rounded-full hover:bg-blue-700 transition-colors"
              >
                CATALOGUE
              </button>
              <button className="px-6 py-2 bg-orange-500 text-white font-black uppercase text-sm tracking-wider rounded-full hover:bg-orange-600 transition-colors">
                INFO
              </button>
              <button className="px-6 py-2 bg-purple-600 text-white font-black uppercase text-sm tracking-wider rounded-full hover:bg-purple-700 transition-colors">
                ARCHIVE
              </button>
              <button className="px-6 py-2 bg-teal-500 text-white font-black uppercase text-sm tracking-wider rounded-full hover:bg-teal-600 transition-colors">
                EDITORIAL
              </button>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm font-black uppercase tracking-wider">NEW YORK {formatTime(currentTime)}</div>
              </div>
              <UserMenuSupabase />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

