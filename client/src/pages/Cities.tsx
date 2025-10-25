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
  const [selectedCountry, setSelectedCountry] = useState<string>("");

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
            count: count as number,
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
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-xs font-bold uppercase text-black/60 dark:text-white/60">Loading...</div>
      </div>
    );
  }

  // Get unique countries
  const countries = Array.from(new Set(cities.map(c => c.country))).sort((a, b) => {
    const indexA = countryOrder.indexOf(a);
    const indexB = countryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Filter cities by selected country
  const filteredCities = selectedCountry 
    ? cities.filter(c => c.country === selectedCountry)
    : cities;

  const totalCities = filteredCities.length;
  const totalPlaces = filteredCities.reduce((sum, city) => sum + city.count, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      {/* Main Content */}
      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-[1920px] mx-auto">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-[clamp(24px,5vw,48px)] font-bold uppercase leading-none tracking-tight mb-4 text-black dark:text-white">
              Cities
            </h1>
            <p className="text-xs font-bold uppercase text-black/60 dark:text-white/60">
              {totalCities} {totalCities === 1 ? 'city' : 'cities'} · {totalPlaces} {totalPlaces === 1 ? 'place' : 'places'}
            </p>
          </div>

          {/* Country Filter */}
          <div className="mb-8">
            <div className="mb-3">
              <h2 className="text-xs font-bold uppercase text-black dark:text-white">Countries</h2>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <button
                onClick={() => setSelectedCountry("")}
                className={`text-xs font-bold uppercase transition-opacity ${
                  !selectedCountry ? "text-black dark:text-white" : "text-black/30 dark:text-white/30 hover:opacity-60"
                }`}
              >
                ALL
              </button>
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country === selectedCountry ? "" : country)}
                  className={`text-xs font-bold uppercase transition-opacity ${
                    selectedCountry === country ? "text-black dark:text-white" : "text-black/30 dark:text-white/30 hover:opacity-60"
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          {/* Cities Grid - Matching Home page grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
            {filteredCities.map((cityData) => (
              <button
                key={cityData.city}
                onClick={() => setLocation(`/city/${cityData.city}`)}
                className="aspect-square border border-gray-200 dark:border-gray-800 hover:opacity-60 transition-opacity text-left group bg-white dark:bg-gray-900 flex flex-col justify-between p-4"
              >
                <div>
                  <p className="text-[10px] font-bold uppercase mb-2 text-black/40 dark:text-white/40">
                    {cityData.country}
                  </p>
                  <h3 className="text-sm font-bold uppercase text-black dark:text-white leading-tight">
                    {capitalizeCity(cityData.city)}
                  </h3>
                </div>
                <p className="text-xs text-black/60 dark:text-white/60 mt-auto">
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

