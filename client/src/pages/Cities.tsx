import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface CityData {
  city: string;
  count: number;
}

export default function Cities() {
  const [, setLocation] = useLocation();
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCities() {
      const { data, error } = await supabase
        .from('destinations')
        .select('city');

      if (!error && data) {
        // Count destinations per city
        const cityCount = data.reduce((acc: Record<string, number>, item) => {
          acc[item.city] = (acc[item.city] || 0) + 1;
          return acc;
        }, {});

        // Convert to array and sort by count
        const citiesArray = Object.entries(cityCount)
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count);

        setCities(citiesArray);
      }

      setLoading(false);
    }

    loadCities();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 md:px-10 py-6 border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <button 
            onClick={() => setLocation("/")}
            className="text-[clamp(32px,6vw,72px)] font-bold uppercase leading-none tracking-tight hover:opacity-60 transition-opacity"
          >
            The Urban Manual
          </button>
          <button 
            onClick={() => setLocation("/account")}
            className="text-xs font-bold uppercase hover:opacity-60 transition-opacity px-4 py-2 border border-black"
          >
            Account
          </button>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="px-6 md:px-10 border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between h-12">
          <div className="flex items-center gap-6">
            <button onClick={() => setLocation("/")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Catalogue</button>
            <button onClick={() => setLocation("/cities")} className="text-xs font-bold uppercase text-black">Cities</button>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Archive</a>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Editorial</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase">New York</span>
            <span className="text-xs font-bold">{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-6 md:px-10 py-12">
        <div className="max-w-[1920px] mx-auto">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold uppercase mb-4">Cities</h1>
            <p className="text-sm text-gray-600">
              Explore {cities.length} cities around the world
            </p>
          </div>

          {/* Cities Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {cities.map((cityData) => (
              <button
                key={cityData.city}
                onClick={() => setLocation(`/city/${cityData.city}`)}
                className="border border-gray-200 p-6 hover:border-black transition-colors text-left group"
              >
                <h2 className="text-lg font-bold uppercase mb-2 group-hover:opacity-60 transition-opacity">
                  {capitalizeCity(cityData.city)}
                </h2>
                <p className="text-xs text-gray-500">
                  {cityData.count} {cityData.count === 1 ? 'place' : 'places'}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-20">
        <div className="max-w-[1920px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs">
              <a href="#" className="hover:underline">INSTAGRAM</a>
              <a href="#" className="hover:underline">TWITTER</a>
              <a href="#" className="hover:underline">SAVEE</a>
            </div>
            <div className="text-xs text-gray-500">
              © {new Date().getFullYear()} ALL RIGHTS RESERVED
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

