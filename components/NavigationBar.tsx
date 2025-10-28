'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, MapPin, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function NavigationBar() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

  const toggleDark = () => {
    const newDarkState = !isDark;
    setIsDark(newDarkState);

    if (newDarkState) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navigate = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
    setIsLocationOpen(false);
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Menu + Location */}
          <div className="flex items-center gap-4">
            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Location Selector */}
            <button
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">All Cities</span>
            </button>
          </div>

          {/* Center: Logo */}
          <button
            onClick={() => navigate('/')}
            className="absolute left-1/2 transform -translate-x-1/2"
          >
            <span className="text-xl font-serif tracking-wider uppercase">Urban Manual</span>
          </button>

          {/* Right: Navigation Links + Dark Mode */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              Catalogue
            </button>
            <button
              onClick={() => navigate('/cities')}
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              Cities
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              Explore
            </button>
            <button
              onClick={() => navigate('/lists')}
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              Lists
            </button>
            <button
              onClick={() => navigate('/feed')}
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              Feed
            </button>
            {user ? (
              <>
                <button
                  onClick={() => navigate('/account')}
                  className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  Account
                </button>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }}
                  className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/auth/login')}
                className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                Sign In
              </button>
            )}
            {mounted && (
              <button
                onClick={toggleDark}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
          </div>

          {/* Mobile: Dark Mode Toggle */}
          <div className="flex md:hidden items-center">
            {mounted && (
              <button
                onClick={toggleDark}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200 dark:border-gray-800">
              <span className="text-xl font-serif tracking-wider uppercase">Urban Manual</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-1">
                <button
                  onClick={() => navigate('/')}
                  className="block w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  Catalogue
                </button>
                <button
                  onClick={() => navigate('/cities')}
                  className="block w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  Cities
                </button>
                <button
                  onClick={() => navigate('/explore')}
                  className="block w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  Explore
                </button>
                <button
                  onClick={() => navigate('/lists')}
                  className="block w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  Lists
                </button>
                <button
                  onClick={() => navigate('/feed')}
                  className="block w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  Feed
                </button>
                {user ? (
                  <>
                    <button
                      onClick={() => navigate('/account')}
                      className="block w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      Account
                    </button>
                    <button
                      onClick={async () => {
                        await signOut();
                        navigate('/');
                      }}
                      className="block w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/auth/login')}
                    className="block w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Selector Dropdown */}
      {isLocationOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsLocationOpen(false)}
          />

          {/* Dropdown */}
          <div className="fixed top-16 left-6 z-50 w-64 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">SELECT CITY</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  onClick={() => {
                    navigate('/');
                  }}
                >
                  All Cities
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  onClick={() => {
                    navigate('/city/tokyo');
                  }}
                >
                  Tokyo
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  onClick={() => {
                    navigate('/city/taipei');
                  }}
                >
                  Taipei
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  onClick={() => {
                    navigate('/city/new-york');
                  }}
                >
                  New York
                </button>
                {/* Add more cities as needed */}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-16" />
    </>
  );
}
