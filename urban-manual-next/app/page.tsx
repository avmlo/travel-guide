'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Destination {
  slug: string;
  name: string;
  city: string;
  category: string;
}

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const { data, error } = await supabase
          .from('destinations')
          .select('slug, name, city, category')
          .limit(20);

        if (error) throw error;
        setDestinations(data || []);
      } catch (error) {
        console.error("Error loading destinations:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDestinations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-xl dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-white dark:bg-black">
      <h1 className="text-4xl font-bold mb-8 dark:text-white">The Urban Manual - Next.js SSR</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Successfully migrated to Next.js 14 with App Router!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {destinations.map((dest) => (
          <div key={dest.slug} className="p-4 border rounded border-gray-200 dark:border-gray-800">
            <h2 className="font-bold dark:text-white">{dest.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{dest.city} • {dest.category}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        ✅ Showing {destinations.length} destinations from Supabase
      </div>
    </main>
  );
}
