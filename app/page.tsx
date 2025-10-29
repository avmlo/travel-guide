import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
import Header from './components/Header'

async function getDestinations() {
  try {
    const query = `*[_type == "destination" && status == "published"] | order(_createdAt desc) {
      _id,
      name,
      slug,
      subline,
      mainImage,
      city->{name, country},
      category->{name},
      michelinStars,
      crown
    }[0...12]`
    
    return await client.fetch(query)
  } catch (error) {
    console.log('Sanity not configured yet')
    return []
  }
}

export default async function Home() {
  const destinations = await getDestinations()

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Destinations Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {destinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination: any) => (
              <Link
                key={destination._id}
                href={`/destination/${destination.slug.current}`}
                className="group"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                  {destination.mainImage && (
                    <Image
                      src={urlFor(destination.mainImage).width(800).url()}
                      alt={destination.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  {destination.crown && (
                    <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 text-xs font-medium rounded-full">
                      Featured
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                    {destination.name}
                  </h3>
                  {destination.city && (
                    <p className="text-sm text-gray-500 mt-1">
                      {destination.city.name}, {destination.city.country}
                    </p>
                  )}
                  {destination.subline && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {destination.subline}
                    </p>
                  )}
                  {destination.michelinStars > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {Array.from({ length: destination.michelinStars }).map((_, i) => (
                        <span key={i} className="text-yellow-500">★</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-light text-gray-900 mb-4">
                Welcome to Urban Manual
              </h2>
              <p className="text-gray-600 mb-8">
                Get started by setting up your Sanity project and adding destinations.
              </p>
              <div className="space-y-4">
                <Link
                  href="/studio"
                  className="block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Open Sanity Studio
                </Link>
                <div className="text-sm text-gray-500">
                  <p>1. Create a Sanity project at <a href="https://sanity.io/manage" target="_blank" className="underline">sanity.io/manage</a></p>
                  <p className="mt-2">2. Add your project ID to .env.local</p>
                  <p className="mt-2">3. Start adding destinations!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

