/**
 * Seed script to populate initial categories
 * Run with: npx ts-node scripts/seed-categories.ts
 */

import { getPayload } from '../lib/payload'

const categories = [
  {
    name: 'Restaurant',
    slug: 'restaurant',
    icon: '🍽️',
    description: 'Fine dining and restaurants',
    color: '#FF6B6B',
    order: 1,
  },
  {
    name: 'Cafe',
    slug: 'cafe',
    icon: '☕',
    description: 'Coffee shops and cafes',
    color: '#8B4513',
    order: 2,
  },
  {
    name: 'Hotel',
    slug: 'hotel',
    icon: '🏨',
    description: 'Hotels and accommodations',
    color: '#4ECDC4',
    order: 3,
  },
  {
    name: 'Bar',
    slug: 'bar',
    icon: '🍸',
    description: 'Bars and cocktail lounges',
    color: '#9B59B6',
    order: 4,
  },
  {
    name: 'Shop',
    slug: 'shop',
    icon: '🛍️',
    description: 'Retail and shopping',
    color: '#F39C12',
    order: 5,
  },
  {
    name: 'Bakery',
    slug: 'bakery',
    icon: '🥐',
    description: 'Bakeries and patisseries',
    color: '#E67E22',
    order: 6,
  },
]

async function seedCategories() {
  console.log('Starting category seeding...')

  try {
    const payload = await getPayload()

    for (const category of categories) {
      console.log(`Creating category: ${category.name}`)

      await payload.create({
        collection: 'categories',
        data: category,
      })

      console.log(`✓ Created ${category.name}`)
    }

    console.log('\n✅ All categories seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding categories:', error)
    process.exit(1)
  }
}

seedCategories()
