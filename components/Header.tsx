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
  const [isAdmin, setIsAdmin] = useState(false);
  const [buildVersion, setBuildVersion] = useState<string | null>(null);
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

  // Check admin status and fetch build version
  useEffect(() => {
    async function checkAdmin() {
      if (!user?.email) {
        setIsAdmin(false);
        return;
      }
      try {
        const res = await fetch('/api/is-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        });
        const j = await res.json();
        setIsAdmin(!!j.isAdmin);
        
        // Fetch build version if admin
        if (j.isAdmin) {
          try {
            const versionRes = await fetch('/api/build-version');
            const versionData = await versionRes.json();
            // Prefer commit SHA, fallback to version
            setBuildVersion(versionData.shortSha || versionData.commitSha?.substring(0, 7) || versionData.version || null);
          } catch {
            // Ignore version fetch errors
          }
        }
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [user]);

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
        <div className={`max-w-[1920px] mx-auto relative`}>
          {/* Logo */}
          <div className={`flex justify-center`}>
            <button
              onClick={() => navigate("/")}
              className="font-bold uppercase leading-none tracking-tight hover:opacity-60 transition-opacity"
              style={{ fontSize: 'clamp(20px, 4vw, 36px)' }}
            >
              The Urban Manual
            </button>
          </div>
          {/* Theme + Burger on right */}
          <div className={`absolute right-0 top-1/2 -translate-y-1/2`}>
            <div className="flex items-center gap-2">
              {isAdmin && buildVersion && (
                <span className="text-[10px] text-gray-400 dark:text-gray-600 font-mono px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded" title="Build version">
                  {buildVersion}
                </span>
              )}
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

      {/* No full nav bar; all navigation via burger menu */}

      {/* Burger Menu Dropdown (all breakpoints) */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed right-4 top-16 z-50 w-64 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
            <div className="py-2">
              <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Catalogue</button>
              <button onClick={() => { navigate('/cities'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Cities</button>
              <button onClick={() => { navigate('/map'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Map</button>
              <button onClick={() => { navigate('/explore'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Explore</button>
              <button onClick={() => { navigate('/lists'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Lists</button>
              <button onClick={() => { navigate('/feed'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Feed</button>
              <div className="my-2 border-t border-gray-200 dark:border-gray-800" />
              {user ? (
                <>
                  <button onClick={() => { navigate('/account'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Account</button>
                  {isAdmin && (
                    <button onClick={() => { navigate('/admin'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 font-medium">Admin</button>
                  )}
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
