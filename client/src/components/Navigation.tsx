import { useLocation } from "wouter";
import { UserMenuSupabase } from "./UserMenuSupabase";
import { useState, useEffect } from "react";

interface NavigationProps {
  cities: string[];
  currentCity?: string;
}

export function Navigation({ cities, currentCity }: NavigationProps) {
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

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
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Top Row: Logo */}
        <div className="mb-6">
          <button
            onClick={() => setLocation("/")}
            className="hover:opacity-70 transition-opacity"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight">
              THE URBAN MANUAL
            </h1>
          </button>
        </div>

        {/* Bottom Row: Navigation Links and Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
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
    </nav>
  );
}

