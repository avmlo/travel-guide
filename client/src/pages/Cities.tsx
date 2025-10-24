import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { cityCountryMap, countryOrder } from "@/data/cityCountryMap";

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  const totalCities = cities.length;
  const totalPlaces = cities.reduce((sum, city) => sum + city.count, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-[1920px] mx-auto">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold uppercase mb-4 text-black dark:text-white">Cities</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalCities} cities · {totalPlaces} places
            </p>
          </div>

          {/* Cities Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
            {cities.map((cityData) => (
              <button
                key={cityData.city}
                onClick={() => setLocation(`/city/${cityData.city}`)}
                className="border border-gray-200 dark:border-gray-700 p-6 hover:border-black dark:hover:border-white transition-colors text-left group bg-white dark:bg-gray-900"
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

      <SimpleFooter />
    </div>
  );
}

