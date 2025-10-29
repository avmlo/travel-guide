'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin, Compass, Sparkles } from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface Destination {
  slug: string;
  name: string;
  city: string;
  category: string;
  image: string;
}

const CATEGORIES = [
  { id: "restaurant", label: "Restaurants", icon: "🍽️", color: "bg-red-100 dark:bg-red-900" },
  { id: "cafe", label: "Cafes", icon: "☕", color: "bg-amber-100 dark:bg-amber-900" },
  { id: "hotel", label: "Hotels", icon: "🏨", color: "bg-blue-100 dark:bg-blue-900" },
  { id: "bar", label: "Bars", icon: "🍸", color: "bg-purple-100 dark:bg-purple-900" },
  { id: "shop", label: "Shops", icon: "🛍️", color: "bg-pink-100 dark:bg-pink-900" },
  { id: "bakery", label: "Bakeries", icon: "🥐", color: "bg-orange-100 dark:bg-orange-900" },
];

export default function Explore() {
  const router = useRouter();
  const [featuredDestinations, setFeaturedDestinations] = useState<Destination[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch featured destinations (crown badge or high michelin stars)
      const { data: featured } = await supabase
        .from('destinations')
        .select('slug, name, city, category, image')
        .or('crown.eq.true,michelin_stars.gte.1')
        .limit(12);

      if (featured) {
        setFeaturedDestinations(featured);
      }

      // Count destinations by category
      const { data: allDests } = await supabase
        .from('destinations')
        .select('category');

      if (allDests) {
        const counts: Record<string, number> = {};
        allDests.forEach(dest => {
          const category = dest.category.toLowerCase();
          counts[category] = (counts[category] || 0) + 1;
        });
        setCategoryCounts(counts);
      }

    } catch (error) {
      console.error("Error fetching explore data:", error);
    } finally {
      setLoading(false);
    }
  };

  const capitalizeCity = (city: string) => {
    return city.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <main className="px-6 md:px-10 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header skeleton */}
            <div className="mb-12">
              <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer mb-4" />
              <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer" />
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-shimmer" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <Compass className="h-8 w-8" />
              <h1 className="text-4xl font-bold text-black dark:text-white">Explore</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Discover amazing places, trending destinations, and curated collections
            </p>
          </div>

          {/* Categories Section */}
          <section className="mb-16 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-2xl font-bold">Browse by Category</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => router.push(`/?category=${category.id}`)}
                  className={`${category.color} p-6 rounded-xl hover:scale-105 transition-transform duration-200 text-center group animate-scale-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{category.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {categoryCounts[category.id] || 0} places
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Featured Destinations */}
          {featuredDestinations.length > 0 && (
            <section className="mb-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Featured Destinations</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredDestinations.map((dest, index) => (
                  <Card
                    key={dest.slug}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 group overflow-hidden animate-scale-in dark:bg-gray-900 dark:border-gray-800"
                    style={{ animationDelay: `${Math.min(index * 30, 400)}ms` }}
                    onClick={() => router.push(`/destination/${dest.slug}`)}
                  >
                    {dest.image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base line-clamp-1">{dest.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <MapPin className="h-3 w-3" />
                        {capitalizeCity(dest.city)}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {dest.category}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Popular Cities */}
          <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="h-5 w-5" />
              <h2 className="text-2xl font-bold">Explore Cities</h2>
            </div>
            <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Browse destinations by city to find the perfect places for your next adventure.
              </p>
              <button
                onClick={() => router.push('/cities')}
                className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity font-semibold"
              >
                View All Cities →
              </button>
            </Card>
          </section>
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
}
