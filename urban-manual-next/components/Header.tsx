'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const navigate = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      {/* Title Bar */}
      <div className="px-6 md:px-10 py-4">
        <div className="max-w-[1920px] mx-auto">
          <button
            onClick={() => navigate("/")}
            className="font-bold uppercase leading-none tracking-tight hover:opacity-60 transition-opacity"
            style={{ fontSize: 'clamp(24px, 5vw, 48px)' }}
          >
            The Urban Manual
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="px-6 md:px-10 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between h-12">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate("/")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Catalogue</button>
            <button onClick={() => navigate("/cities")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Cities</button>
            <button onClick={() => navigate("/explore")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Explore</button>
            <button onClick={() => navigate("/feed")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Feed</button>
            <button onClick={() => navigate("/trips")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Trips</button>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Archive</a>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Editorial</a>
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
            {currentTime && (
              <span className="hidden sm:inline text-xs font-bold">{currentTime}</span>
            )}
            <button onClick={toggleDark} className="p-2 hover:opacity-60 transition-opacity">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/account')}
                    className="text-xs font-bold uppercase hover:opacity-60 transition-opacity"
                  >
                    Account
                  </button>
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate('/');
                    }}
                    className="text-xs font-bold uppercase hover:opacity-60 transition-opacity"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/auth/login')}
                  className="text-xs font-bold uppercase hover:opacity-60 transition-opacity"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-6 py-4 space-y-3">
            <button onClick={() => navigate("/")} className="block w-full text-left text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2">Catalogue</button>
            <button onClick={() => navigate("/cities")} className="block w-full text-left text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2">Cities</button>
            <button onClick={() => navigate("/explore")} className="block w-full text-left text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2">Explore</button>
            <button onClick={() => navigate("/feed")} className="block w-full text-left text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2">Feed</button>
            <button onClick={() => navigate("/trips")} className="block w-full text-left text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2">Trips</button>
            <a href="#" className="block text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2">Archive</a>
            <a href="#" className="block text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2">Editorial</a>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/account')}
                    className="block w-full text-left text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2"
                  >
                    Account
                  </button>
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate('/');
                    }}
                    className="block w-full text-left text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/auth/login')}
                  className="block w-full text-left text-sm font-bold uppercase hover:opacity-60 transition-opacity py-2"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
