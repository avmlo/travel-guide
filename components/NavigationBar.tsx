'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, MapPin, X } from 'lucide-react';

export function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Menu + Location */}
          <div className="flex items-center gap-4">
            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Location Selector */}
            <button
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">All Cities</span>
            </button>
          </div>

          {/* Center: Logo */}
          <Link 
            href="/" 
            className="absolute left-1/2 transform -translate-x-1/2"
          >
            <span className="text-xl font-serif tracking-wider">URBAN MANUAL</span>
          </Link>

          {/* Right: Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              href="/destinations"
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded transition-colors"
            >
              Destinations
            </Link>
            <Link
              href="/cities"
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded transition-colors"
            >
              Cities
            </Link>
            <Link
              href="/saved"
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded transition-colors"
            >
              Saved
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200">
              <span className="text-xl font-serif tracking-wider">URBAN MANUAL</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-1">
                <Link
                  href="/destinations"
                  className="block px-4 py-3 text-lg hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Destinations
                </Link>
                <Link
                  href="/cities"
                  className="block px-4 py-3 text-lg hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cities
                </Link>
                <Link
                  href="/saved"
                  className="block px-4 py-3 text-lg hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Saved
                </Link>
                <Link
                  href="/about"
                  className="block px-4 py-3 text-lg hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="block px-4 py-3 text-lg hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
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
          <div className="fixed top-16 left-6 z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">SELECT CITY</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                  onClick={() => {
                    setIsLocationOpen(false);
                    // Handle "All Cities" selection
                  }}
                >
                  All Cities
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                  onClick={() => {
                    setIsLocationOpen(false);
                    // Handle city selection
                  }}
                >
                  London
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                  onClick={() => {
                    setIsLocationOpen(false);
                    // Handle city selection
                  }}
                >
                  Paris
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                  onClick={() => {
                    setIsLocationOpen(false);
                    // Handle city selection
                  }}
                >
                  Tokyo
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                  onClick={() => {
                    setIsLocationOpen(false);
                    // Handle city selection
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

