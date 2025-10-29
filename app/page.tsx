import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

async function getDestinations() {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .limit(12)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching destinations:', error)
    return []
  }

  return data || []
}

export default async function Home() {
  const destinations = await getDestinations()

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80 z-10" />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-light mb-6 tracking-tight">
            Urban Manual
          </h1>
          <p className="text-xl md:text-2xl font-light text-gray-300 max-w-2xl mx-auto">
            A curated guide to the world&apos;s most exceptional places
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-light mb-12 text-center">
          Featured Destinations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <Link
              key={destination.id}
              href={`/destinations/${destination.slug}`}
              className="group"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-4">
                {destination.main_image && (
                  <Image
                    src={destination.main_image}
                    alt={destination.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </div>
              <h3 className="text-xl font-medium mb-1">{destination.name}</h3>
              <p className="text-gray-600">
                {destination.city}, {destination.country}
              </p>
              <p className="text-sm text-gray-500 mt-1 capitalize">
                {destination.category}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-light mb-6">
            Discover More
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Sign up to save your favorite destinations and get personalized recommendations
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-white text-black px-8 py-4 text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>
    </main>
  )
}

