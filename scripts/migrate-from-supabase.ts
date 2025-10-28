/**
 * Migration script to move data from Supabase to Payload CMS
 * Run with: npx ts-node scripts/migrate-from-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import { getPayload } from '../lib/payload'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

interface SupabaseDestination {
  name: string
  brand: string
  designer?: string
  category: string
  city: string
  slug: string
  content: string
  main_image: string
  additional_images?: string[]
  michelin_stars: number
  crown: boolean
  lat: number
  long: number
  website?: string
  my_rating?: number
  reviewed?: boolean
  card_tags?: string
  subline?: string
}

async function migrateCities() {
  console.log('\n📍 Migrating Cities...')

  const payload = await getPayload()

  // Get unique cities from Supabase
  const { data: destinations } = await supabase
    .from('destinations')
    .select('city')

  if (!destinations) {
    console.log('No destinations found')
    return new Map()
  }

  const uniqueCities = [...new Set(destinations.map(d => d.city))]
  const cityMap = new Map<string, string>()

  const cityCountryMap: Record<string, string> = {
    'taipei': 'Taiwan',
    'tokyo': 'Japan',
    'kyoto': 'Japan',
    'osaka': 'Japan',
    'new york': 'USA',
    'los angeles': 'USA',
    'san francisco': 'USA',
    'london': 'UK',
    'paris': 'France',
    'saigon': 'Vietnam',
    'bangkok': 'Thailand',
    'milan': 'Italy',
    'bali': 'Indonesia',
    'barcelona': 'Spain',
    'zurich': 'Switzerland',
  }

  for (const cityName of uniqueCities) {
    if (!cityName) continue

    const slug = cityName.toLowerCase().replace(/\s+/g, '-')
    const country = cityCountryMap[cityName.toLowerCase()] || 'Other'

    console.log(`Creating city: ${cityName} (${country})`)

    try {
      const city = await payload.create({
        collection: 'cities',
        data: {
          name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
          slug,
          country,
          priority: ['Taiwan', 'Japan', 'USA'].includes(country) ? 10 : 0,
          destinationCount: 0,
        },
      })

      cityMap.set(cityName, city.id)
      console.log(`✓ Created city: ${cityName}`)
    } catch (error: any) {
      console.error(`Error creating city ${cityName}:`, error.message)
    }
  }

  return cityMap
}

async function getCategoryMap() {
  const payload = await getPayload()

  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 100,
  })

  const categoryMap = new Map<string, string>()

  for (const cat of categories) {
    categoryMap.set(cat.slug.toLowerCase(), cat.id)
  }

  return categoryMap
}

async function migrateDestinations(cityMap: Map<string, string>, categoryMap: Map<string, string>) {
  console.log('\n🏛️ Migrating Destinations...')

  const payload = await getPayload()

  // Fetch all destinations from Supabase
  const { data: destinations, error } = await supabase
    .from('destinations')
    .select('*')
    .limit(1000)

  if (error) {
    console.error('Error fetching destinations:', error)
    return
  }

  if (!destinations || destinations.length === 0) {
    console.log('No destinations to migrate')
    return
  }

  console.log(`Found ${destinations.length} destinations to migrate`)

  let successCount = 0
  let errorCount = 0

  for (const dest of destinations as SupabaseDestination[]) {
    try {
      const categoryId = categoryMap.get(dest.category?.toLowerCase() || 'restaurant')
      const cityId = cityMap.get(dest.city)

      if (!categoryId) {
        console.log(`⚠️ Skipping ${dest.name} - category not found: ${dest.category}`)
        errorCount++
        continue
      }

      if (!cityId) {
        console.log(`⚠️ Skipping ${dest.name} - city not found: ${dest.city}`)
        errorCount++
        continue
      }

      console.log(`Migrating: ${dest.name}`)

      await payload.create({
        collection: 'destinations',
        data: {
          name: dest.name,
          slug: dest.slug,
          brand: dest.brand,
          designer: dest.designer,
          category: categoryId,
          city: cityId,
          content: dest.content,
          subline: dest.subline || '',
          // Note: mainImage would need to be uploaded to Payload's media collection
          // For now, we'll skip images in the migration
          michelinStars: dest.michelin_stars || 0,
          crown: dest.crown || false,
          location: {
            lat: dest.lat,
            long: dest.long,
          },
          website: dest.website,
          cardTags: dest.card_tags || '',
          status: 'published',
        },
      })

      successCount++
      console.log(`✓ Migrated: ${dest.name}`)
    } catch (error: any) {
      console.error(`✗ Error migrating ${dest.name}:`, error.message)
      errorCount++
    }
  }

  console.log(`\n✅ Migration complete!`)
  console.log(`   Success: ${successCount}`)
  console.log(`   Errors: ${errorCount}`)
}

async function runMigration() {
  console.log('🚀 Starting Supabase to Payload CMS migration...\n')

  try {
    // Step 1: Migrate cities
    const cityMap = await migrateCities()

    // Step 2: Get category map
    const categoryMap = await getCategoryMap()

    if (categoryMap.size === 0) {
      console.log('⚠️ No categories found. Please run seed-categories.ts first!')
      process.exit(1)
    }

    // Step 3: Migrate destinations
    await migrateDestinations(cityMap, categoryMap)

    console.log('\n🎉 Migration completed!')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
