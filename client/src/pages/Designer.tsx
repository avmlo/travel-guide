import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { Destination } from "@/types/destination";
import { Palette } from "lucide-react";

// Helper function to format designer slug to display name
function formatDesignerName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

import { capitalizeCity } from "@/lib/stringUtils";

export default function Designer() {
  const [, params] = useRoute("/designer/:slug");
  const designerSlug = params?.slug || "";
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadDesignerDestinations() {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('designer', designerSlug)
        .order('name');

      if (error) {
        console.error('Error loading designer destinations:', error);
      } else if (data) {
        setDestinations(data);
      }

      setLoading(false);
    }

    if (designerSlug) {
      loadDesignerDestinations();
    }
  }, [designerSlug]);

  const handleCardClick = (dest: any) => {
    const transformed: Destination = {
      name: dest.name,
      slug: dest.slug,
      city: dest.city,
      category: dest.category,
      content: dest.content || dest.description || '',
      mainImage: dest.image || '',
      michelinStars: dest.michelin_stars || 0,
      crown: dest.crown || false,
      brand: dest.brand || '',
      cardTags: '',
      lat: 0,
      long: 0,
      myRating: 0,
      reviewed: false,
      subline: dest.description || ''
    };
    setSelectedDestination(transformed);
    setIsDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  const designerName = formatDesignerName(designerSlug);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="px-6 md:px-10 py-12">
        <div className="max-w-[1920px] mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="h-8 w-8 text-gray-400" />
              <h1 className="text-4xl font-bold">{designerName}</h1>
            </div>
            <p className="text-gray-600">
              {destinations.length} {destinations.length === 1 ? 'destination' : 'destinations'} designed by {designerName}
            </p>
          </div>

          {/* Destinations Grid */}
          {destinations.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">No destinations found for this designer</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
              {destinations.map((dest) => (
                <button
                  key={dest.slug}
                  onClick={() => handleCardClick(dest)}
                  className="group text-left"
                >
                  <div className="aspect-square bg-gray-100 mb-3 overflow-hidden relative">
                    {dest.image && (
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    {dest.michelin_stars > 0 && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
                        {dest.michelin_stars}★
                      </div>
                    )}
                    {dest.crown && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 text-xs font-bold rounded">
                        👑
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{dest.name}</h3>
                  <p className="text-xs text-gray-600">{capitalizeCity(dest.city)}</p>
                  <p className="text-xs text-gray-500">{dest.category}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <SimpleFooter />

      {/* Destination Drawer */}
      {selectedDestination && (
        <DestinationDrawer
          destination={selectedDestination}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedDestination(null);
          }}
        />
      )}
    </div>
  );
}

