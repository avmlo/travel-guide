'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";

export function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

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
        <button
          onClick={() => navigate("/")}
          className="text-2xl md:text-4xl font-bold uppercase hover:opacity-60 transition-opacity"
        >
          The Urban Manual
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="px-6 md:px-10 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between h-12">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate("/")} className="text-xs font-bold uppercase hover:opacity-60">Catalogue</button>
            <button onClick={() => navigate("/cities")} className="text-xs font-bold uppercase hover:opacity-60">Cities</button>
            <button onClick={() => navigate("/explore")} className="text-xs font-bold uppercase hover:opacity-60">Explore</button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Right Side */}
          <button onClick={toggleDark} className="p-2 hover:opacity-60">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-6 py-4 space-y-3">
            <button onClick={() => navigate("/")} className="block w-full text-left text-sm font-bold uppercase">Catalogue</button>
            <button onClick={() => navigate("/cities")} className="block w-full text-left text-sm font-bold uppercase">Cities</button>
            <button onClick={() => navigate("/explore")} className="block w-full text-left text-sm font-bold uppercase">Explore</button>
          </div>
        </div>
      )}
    </header>
  );
}
