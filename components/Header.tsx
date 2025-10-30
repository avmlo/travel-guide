'use client';

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const isHome = pathname === '/';

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // (Removed time display)

  const navigate = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  const toggleDark = () => {
    const newDarkState = !isDark;
    setIsDark(newDarkState);

    document.documentElement.classList.toggle('dark', newDarkState);
    document.documentElement.style.colorScheme = newDarkState ? 'dark' : 'light';
    localStorage.setItem('theme', newDarkState ? 'dark' : 'light');
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      {/* Top Bar */}
      <div className="px-6 md:px-10 py-4">
        <div className={`max-w-[1920px] mx-auto ${isHome ? 'relative' : ''}`}>
          {/* Logo */}
          <div className={`${isHome ? 'flex justify-center' : ''}`}>
            <button
              onClick={() => navigate("/")}
              className="font-bold uppercase leading-none tracking-tight hover:opacity-60 transition-opacity"
              style={{ fontSize: isHome ? 'clamp(20px, 4vw, 36px)' : 'clamp(24px, 5vw, 48px)' }}
            >
              The Urban Manual
            </button>
          </div>
          {/* Theme + Burger on right */}
          <div className={`${isHome ? 'absolute right-0 top-1/2 -translate-y-1/2' : 'hidden md:block float-right'}`}>
            <div className="flex items-center gap-2">
              {mounted && (
                <button onClick={toggleDark} className="p-2 hover:opacity-60 transition-opacity" aria-label="Toggle theme">
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:opacity-60 transition-opacity"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Nav Bar (hidden on home) */}
      {!isHome && (
        <div className="px-6 md:px-10 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-[1920px] mx-auto flex items-center justify-between h-12">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate("/")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Catalogue</button>
              <button onClick={() => navigate("/cities")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Cities</button>
              <button onClick={() => navigate("/explore")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Explore</button>
              <button onClick={() => navigate("/lists")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Lists</button>
              <button onClick={() => navigate("/feed")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Feed</button>
            </div>

            {/* Right Side (desktop) */}
            <div className="flex items-center gap-4">
              {mounted && (
                <button onClick={toggleDark} className="p-2 hover:opacity-60 transition-opacity" aria-label="Toggle theme">
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              )}
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
      )}

      {/* Burger Menu Dropdown (all breakpoints) */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed right-4 top-16 z-50 w-64 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
            <div className="py-2">
              <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Catalogue</button>
              <button onClick={() => { navigate('/cities'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Cities</button>
              <button onClick={() => { navigate('/explore'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Explore</button>
              <button onClick={() => { navigate('/lists'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Lists</button>
              <button onClick={() => { navigate('/feed'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Feed</button>
              <div className="my-2 border-t border-gray-200 dark:border-gray-800" />
              {user ? (
                <>
                  <button onClick={() => { navigate('/account'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Account</button>
                  <button onClick={async () => { await signOut(); setIsMenuOpen(false); navigate('/'); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Sign Out</button>
                </>
              ) : (
                <button onClick={() => { navigate('/auth/login'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Sign In</button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
