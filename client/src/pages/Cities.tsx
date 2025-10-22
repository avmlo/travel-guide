import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Map cities to countries (you can expand this)
const cityToCountry: Record<string, string> = {
  'new-york': 'United States',
  'los-angeles': 'United States',
  'san-francisco': 'United States',
  'chicago': 'United States',
  'miami': 'United States',
  'washington-dc': 'United States',
  'boston': 'United States',
  'seattle': 'United States',
  'austin': 'United States',
  'denver': 'United States',
  'portland': 'United States',
  'las-vegas': 'United States',
  'nashville': 'United States',
  'colorado': 'United States',
  'hudson-valley': 'United States',
  'hawaii': 'United States',
  'charleston': 'United States',
  'orlando': 'United States',
  
  'london': 'United Kingdom',
  'edinburgh': 'United Kingdom',
  'manchester': 'United Kingdom',
  
  'paris': 'France',
  'lyon': 'France',
  'marseille': 'France',
  'nice': 'France',
  'provence-alpes-côte-d-azur': 'France',
  'auvergne-rhône-alpes': 'France',
  
  'tokyo': 'Japan',
  'kyoto': 'Japan',
  'osaka': 'Japan',
  'yokohama': 'Japan',
  'kyushu': 'Japan',
  'karuizawa': 'Japan',
  'nagato': 'Japan',
  'nara': 'Japan',
  'hakone': 'Japan',
  'atami': 'Japan',
  'okinawa': 'Japan',
  'kamakura': 'Japan',
  'kanazawa': 'Japan',
  'kobe': 'Japan',
  
  'barcelona': 'Spain',
  'madrid': 'Spain',
  'valencia': 'Spain',
  'seville': 'Spain',
  'bilbao': 'Spain',
  
  'rome': 'Italy',
  'milan': 'Italy',
  'venice': 'Italy',
  'florence': 'Italy',
  'naples': 'Italy',
  'lake-como': 'Italy',
  
  'berlin': 'Germany',
  'munich': 'Germany',
  'hamburg': 'Germany',
  'frankfurt': 'Germany',
  
  'amsterdam': 'Netherlands',
  'rotterdam': 'Netherlands',
  
  'brussels': 'Belgium',
  'antwerp': 'Belgium',
  
  'zurich': 'Switzerland',
  'geneva': 'Switzerland',
  'basel': 'Switzerland',
  'valais': 'Switzerland',
  'lausanne': 'Switzerland',
  
  'vienna': 'Austria',
  
  'copenhagen': 'Denmark',
  
  'stockholm': 'Sweden',
  
  'oslo': 'Norway',
  
  'helsinki': 'Finland',
  
  'lisbon': 'Portugal',
  'porto': 'Portugal',
  
  'athens': 'Greece',
  
  'istanbul': 'Turkey',
  
  'dubai': 'United Arab Emirates',
  'abu-dhabi': 'United Arab Emirates',
  
  'singapore': 'Singapore',
  
  'hong-kong': 'Hong Kong',
  
  'bangkok': 'Thailand',
  'phuket': 'Thailand',
  'chiang-mai': 'Thailand',
  'koh-samui': 'Thailand',
  
  'seoul': 'South Korea',
  'busan': 'South Korea',
  
  'taipei': 'Taiwan',
  'kaohsiung': 'Taiwan',
  'taichung': 'Taiwan',
  'tainan': 'Taiwan',
  'chiayi': 'Taiwan',
  'pingtung': 'Taiwan',
  
  'shanghai': 'China',
  'beijing': 'China',
  'shenzhen': 'China',
  'guangzhou': 'China',
  
  'mumbai': 'India',
  'delhi': 'India',
  'bangalore': 'India',
  
  'sydney': 'Australia',
  'melbourne': 'Australia',
  'brisbane': 'Australia',
  
  'auckland': 'New Zealand',
  
  'toronto': 'Canada',
  'vancouver': 'Canada',
  'montreal': 'Canada',
  
  'mexico-city': 'Mexico',
  'cancun': 'Mexico',
  
  'buenos-aires': 'Argentina',
  
  'rio-de-janeiro': 'Brazil',
  'sao-paulo': 'Brazil',
  
  'santiago': 'Chile',
  
  'lima': 'Peru',
  
  'cape-town': 'South Africa',
  
  'marrakech': 'Morocco',
  
  'cairo': 'Egypt',
  
  'jakarta': 'Indonesia',
  
  'saigon': 'Vietnam',
  'hanoi': 'Vietnam',
  'da-nang': 'Vietnam',
};

interface CityData {
  city: string;
  count: number;
  country: string;
}

interface CountryGroup {
  country: string;
  cities: CityData[];
  totalCount: number;
}

export default function Cities() {
  const [, setLocation] = useLocation();
  const [countryGroups, setCountryGroups] = useState<CountryGroup[]>([]);
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
            country: cityToCountry[city] || 'Other'
          }));

        // Group by country
        const grouped = citiesArray.reduce((acc: Record<string, CityData[]>, city) => {
          if (!acc[city.country]) {
            acc[city.country] = [];
          }
          acc[city.country].push(city);
          return acc;
        }, {});

        // Convert to array and sort
        const groupsArray: CountryGroup[] = Object.entries(grouped)
          .map(([country, cities]) => ({
            country,
            cities: cities.sort((a, b) => b.count - a.count),
            totalCount: cities.reduce((sum, city) => sum + city.count, 0)
          }))
          .sort((a, b) => b.totalCount - a.totalCount);

        setCountryGroups(groupsArray);
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

  const totalCities = countryGroups.reduce((sum, group) => sum + group.cities.length, 0);

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
              {totalCities} cities across {countryGroups.length} countries
            </p>
          </div>

          {/* Countries and Cities */}
          <div className="space-y-12">
            {countryGroups.map((group) => (
              <div key={group.country}>
                {/* Country Header */}
                <div className="mb-6 pb-2 border-b border-gray-200">
                  <h2 className="text-xl font-bold uppercase">{group.country}</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {group.cities.length} {group.cities.length === 1 ? 'city' : 'cities'} · {group.totalCount} {group.totalCount === 1 ? 'place' : 'places'}
                  </p>
                </div>

                {/* Cities Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {group.cities.map((cityData) => (
                    <button
                      key={cityData.city}
                      onClick={() => setLocation(`/city/${cityData.city}`)}
                      className="border border-gray-200 p-6 hover:border-black transition-colors text-left group"
                    >
                      <h3 className="text-base font-bold uppercase mb-2 group-hover:opacity-60 transition-opacity">
                        {capitalizeCity(cityData.city)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {cityData.count} {cityData.count === 1 ? 'place' : 'places'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
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

