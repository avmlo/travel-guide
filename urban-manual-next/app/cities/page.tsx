'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { cityCountryMap, countryOrder } from "@/data/cityCountryMap";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { FollowCityButton } from "@/components/FollowCityButton";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
  const router = useRouter();
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
      <Header />

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
              <div
                key={cityData.city}
                className="border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-900 animate-scale-in overflow-hidden"
                style={{ animationDelay: `${Math.min(index * 20, 400)}ms` }}
              >
                <button
                  onClick={() => router.push(`/city/${cityData.city}`)}
                  className="w-full p-6 text-left group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black dark:focus:ring-white"
                >
                  <h3 className="text-base font-bold uppercase mb-2 group-hover:opacity-60 transition-opacity text-black dark:text-white">
                    {capitalizeCity(cityData.city)}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {cityData.count} {cityData.count === 1 ? 'place' : 'places'}
                  </p>
                </button>
                <div className="px-6 pb-4">
                  <FollowCityButton city={cityData.city} variant="compact" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
}
