import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // Secret for encryption - MUST be set in environment variables
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-here',

  // Your Supabase admin email
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Urban Manual Admin',
    },
  },

  // Collections will be added here
  collections: [
    // Destinations collection
    {
      slug: 'destinations',
      admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'city', 'category', 'crown'],
      },
      fields: [
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'category',
          type: 'text',
          required: true,
        },
        {
          name: 'content',
          type: 'textarea',
        },
        {
          name: 'image',
          type: 'text',
          label: 'Image URL',
        },
        {
          name: 'crown',
          type: 'checkbox',
          label: 'Crown (Featured)',
          defaultValue: false,
        },
        {
          name: 'michelin_stars',
          type: 'number',
          label: 'Michelin Stars',
          min: 0,
          max: 3,
        },
        // Enrichment fields
        {
          name: 'place_id',
          type: 'text',
          label: 'Google Place ID',
          admin: {
            position: 'sidebar',
            description: 'Google Maps Place ID for enrichment',
          },
        },
        {
          name: 'rating',
          type: 'number',
          label: 'Google Rating',
          min: 0,
          max: 5,
          admin: {
            step: 0.1,
          },
        },
        {
          name: 'price_level',
          type: 'number',
          label: 'Price Level',
          min: 0,
          max: 4,
        },
        {
          name: 'phone_number',
          type: 'text',
        },
        {
          name: 'website',
          type: 'text',
        },
        {
          name: 'google_maps_url',
          type: 'text',
          label: 'Google Maps URL',
        },
        {
          name: 'tags',
          type: 'array',
          label: 'AI Tags',
          fields: [
            {
              name: 'tag',
              type: 'text',
            },
          ],
        },
        {
          name: 'last_enriched_at',
          type: 'date',
          label: 'Last Enriched',
          admin: {
            position: 'sidebar',
            readOnly: true,
          },
        },
        {
          name: 'save_count',
          type: 'number',
          label: 'Save Count',
          defaultValue: 0,
          admin: {
            position: 'sidebar',
            readOnly: true,
          },
        },
      ],
    },

    // Users collection for admin authentication
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Editor', value: 'editor' },
          ],
          defaultValue: 'editor',
          required: true,
        },
      ],
    },
  ],

  // Connect to your Supabase PostgreSQL database
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DATABASE_URL,
    },
  }),

  // Rich text editor
  editor: lexicalEditor({}),

  // TypeScript configuration
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // File upload configuration (optional - can use Supabase Storage later)
  upload: {
    limits: {
      fileSize: 5000000, // 5MB
    },
  },
})
