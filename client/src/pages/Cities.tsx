import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

import { supabase } from "@/lib/supabase";
import { cityCountryMap, countryOrder } from "@/data/cityCountryMap";
import { PageHero } from "@/components/layout/PageHero";
import { SiteShell } from "@/components/layout/SiteShell";
import { ContentSection } from "@/components/layout/ContentSection";
import { Button } from "@/components/ui/button";

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
  const countryBreakdown = useMemo(() => {
    const counts = cities.reduce<Record<string, number>>((acc, city) => {
      acc[city.country] = (acc[city.country] || 0) + city.count;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => {
        const indexA = countryOrder.indexOf(a.country);
        const indexB = countryOrder.indexOf(b.country);
        if (indexA === -1 && indexB === -1) return a.country.localeCompare(b.country);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
  }, [cities]);
  const uniqueCountries = countryBreakdown.length;
  const averagePlaces = totalCities > 0 ? (totalPlaces / totalCities).toFixed(1) : "0";
  const topCities = useMemo(
    () => [...cities].sort((a, b) => b.count - a.count).slice(0, 6),
    [cities],
  );

  const hero = (
    <PageHero
      eyebrow="Global roster"
      title="Discover cities in the Urban Manual atlas"
      description={`Mapping ${totalPlaces} experiences across ${totalCities} cities.`}
      actions={
        <>
          <Button
            onClick={() => setLocation("/explore")}
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-sm transition hover:bg-emerald-700"
          >
            Explore experiences
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/account")}
            className="rounded-full border-emerald-500/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-200"
          >
            Personalize feed
          </Button>
        </>
      }
      stats={[
        { label: "Cities", value: `${totalCities}`, hint: "Curated urban guides" },
        { label: "Countries", value: `${uniqueCountries}`, hint: "Across continents" },
        { label: "Avg picks", value: averagePlaces, hint: "Per city" },
      ]}
      media={
        <div className="space-y-4">
          <div className="rounded-3xl border border-emerald-500/20 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80 dark:text-emerald-300/80">Top cities right now</p>
            <div className="mt-4 space-y-3">
              {topCities.map((city) => (
                <button
                  key={city.city}
                  onClick={() => setLocation(`/city/${city.city}`)}
                  className="flex w-full items-center justify-between rounded-2xl border border-emerald-500/15 bg-white/80 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-emerald-500/40 hover:text-emerald-600 dark:border-emerald-400/20 dark:bg-slate-950/60 dark:text-slate-200"
                >
                  <span>{capitalizeCity(city.city)}</span>
                  <span className="text-xs font-medium text-emerald-600/80 dark:text-emerald-200">{city.count} spots</span>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-emerald-500/20 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80 dark:text-emerald-300/80">Country signals</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {countryBreakdown.slice(0, 3).map((entry) => (
                <li key={entry.country} className="flex items-center justify-between">
                  <span>{entry.country}</span>
                  <span className="text-emerald-600/80 dark:text-emerald-200">{entry.count} places</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
    />
  );

  return (
    <SiteShell hero={hero}>
      <div className="space-y-16">
        <ContentSection
          title="City collection"
          description="Jump into detailed guides for each city or follow the trail of our newest additions."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {cities.map((cityData) => (
              <button
                key={cityData.city}
                onClick={() => setLocation(`/city/${cityData.city}`)}
                className="group rounded-2xl border border-emerald-500/15 bg-white/80 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/40 dark:border-emerald-400/20 dark:bg-slate-950/70"
              >
                <h3 className="text-base font-semibold text-slate-900 transition group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300">
                  {capitalizeCity(cityData.city)}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  {cityData.count} {cityData.count === 1 ? "place" : "places"}
                </p>
                <span className="mt-3 inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">
                  {cityData.country}
                </span>
              </button>
            ))}
          </div>
        </ContentSection>

        <ContentSection
          tone="muted"
          title="Country signals"
          description="See which countries hold the densest clusters of Urban Manual recommendations."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {countryBreakdown.map((entry) => (
              <div
                key={entry.country}
                className="rounded-2xl border border-emerald-500/15 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{entry.country}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{entry.count}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {totalPlaces > 0 ? ((entry.count / totalPlaces) * 100).toFixed(1) : "0"}% of the atlas
                </p>
              </div>
            ))}
          </div>
        </ContentSection>
      </div>
    </SiteShell>
  );
}
