import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { cityCountryMap, countryOrder } from "@/data/cityCountryMap";
import { SkeletonGrid } from "@/components/SkeletonCard";

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
  country: string;
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

        // Convert to array with country info
        const citiesArray: CityData[] = Object.entries(cityCount)
          .map(([city, count]) => ({
            city,
            count,
            country: cityCountryMap[city] || 'Other'
          }));

        // Sort by country priority, then by count within country
        const sortedCities = citiesArray.sort((a, b) => {
          const countryA = a.country;
          const countryB = b.country;
          
          const indexA = countryOrder.indexOf(countryA);
          const indexB = countryOrder.indexOf(countryB);
          
          // If same country, sort by count (descending)
          if (countryA === countryB) {
            return b.count - a.count;
          }
          
          // Sort by country priority
          if (indexA === -1 && indexB === -1) return countryA.localeCompare(countryB);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        setCities(sortedCities);
      }

      setLoading(false);
    }

    loadCities();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        <Header />
        <main className="px-6 md:px-10 py-12 dark:text-white">
          <div className="max-w-[1920px] mx-auto">
            {/* Title skeleton */}
            <div className="mb-12">
              <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer mb-4" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer" />
            </div>

            {/* Grid skeleton */}
            <SkeletonGrid count={24} />
          </div>
        </main>
      </div>
    );
  }

  const totalCities = cities.length;
  const totalPlaces = cities.reduce((sum, city) => sum + city.count, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="px-6 md:px-10 py-6 border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <button 
            onClick={() => setLocation("/")}
            className="text-[clamp(32px,6vw,72px)] font-bold uppercase leading-none tracking-tight hover:opacity-60 transition-opacity text-black dark:text-white"
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
      <nav className="px-6 md:px-10 border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between h-12">
          <div className="flex items-center gap-6">
            <button onClick={() => setLocation("/")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Catalogue</button>
            <button onClick={() => setLocation("/cities")} className="text-xs font-bold uppercase text-black dark:text-white">Cities</button>
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
      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-[1920px] mx-auto">
          {/* Page Title */}
          <div className="mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold uppercase mb-4 text-black dark:text-white">Cities</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalCities} cities · {totalPlaces} places
            </p>
          </div>

          {/* Cities Grid with staggered animations */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
            {cities.map((cityData, index) => (
              <button
                key={cityData.city}
                onClick={() => setLocation(`/city/${cityData.city}`)}
                className="border border-gray-200 dark:border-gray-700 p-6 hover:border-black dark:hover:border-white hover:shadow-lg transition-all duration-200 text-left group bg-white dark:bg-gray-900 animate-scale-in"
                style={{ animationDelay: `${Math.min(index * 20, 400)}ms` }}
              >
                <h3 className="text-base font-bold uppercase mb-2 group-hover:opacity-60 transition-opacity text-black dark:text-white">
                  {capitalizeCity(cityData.city)}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
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

