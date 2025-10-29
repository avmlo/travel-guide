import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
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
            { label: 'User', value: 'user' },
          ],
          defaultValue: 'user',
          required: true,
        },
      ],
    },
    {
      slug: 'destinations',
      admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'city', 'country', 'category', 'updatedAt'],
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            description: 'URL-friendly version of the name',
          },
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'country',
          type: 'text',
          required: true,
        },
        {
          name: 'category',
          type: 'select',
          options: [
            { label: 'Museum', value: 'museum' },
            { label: 'Gallery', value: 'gallery' },
            { label: 'Restaurant', value: 'restaurant' },
            { label: 'Cafe', value: 'cafe' },
            { label: 'Bar', value: 'bar' },
            { label: 'Shop', value: 'shop' },
            { label: 'Hotel', value: 'hotel' },
            { label: 'Park', value: 'park' },
            { label: 'Landmark', value: 'landmark' },
            { label: 'Other', value: 'other' },
          ],
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'longDescription',
          type: 'richText',
          editor: lexicalEditor({}),
        },
        {
          name: 'mainImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'gallery',
          type: 'array',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          name: 'location',
          type: 'group',
          fields: [
            {
              name: 'latitude',
              type: 'number',
            },
            {
              name: 'longitude',
              type: 'number',
            },
            {
              name: 'address',
              type: 'text',
            },
          ],
        },
        {
          name: 'contact',
          type: 'group',
          fields: [
            {
              name: 'website',
              type: 'text',
            },
            {
              name: 'phone',
              type: 'text',
            },
            {
              name: 'email',
              type: 'email',
            },
          ],
        },
        {
          name: 'social',
          type: 'group',
          fields: [
            {
              name: 'instagram',
              type: 'text',
            },
            {
              name: 'facebook',
              type: 'text',
            },
            {
              name: 'twitter',
              type: 'text',
            },
          ],
        },
        {
          name: 'hours',
          type: 'array',
          fields: [
            {
              name: 'day',
              type: 'select',
              options: [
                { label: 'Monday', value: 'monday' },
                { label: 'Tuesday', value: 'tuesday' },
                { label: 'Wednesday', value: 'wednesday' },
                { label: 'Thursday', value: 'thursday' },
                { label: 'Friday', value: 'friday' },
                { label: 'Saturday', value: 'saturday' },
                { label: 'Sunday', value: 'sunday' },
              ],
            },
            {
              name: 'open',
              type: 'text',
            },
            {
              name: 'close',
              type: 'text',
            },
            {
              name: 'closed',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
        {
          name: 'priceRange',
          type: 'select',
          options: [
            { label: '$', value: '1' },
            { label: '$$', value: '2' },
            { label: '$$$', value: '3' },
            { label: '$$$$', value: '4' },
          ],
        },
        {
          name: 'tags',
          type: 'array',
          fields: [
            {
              name: 'tag',
              type: 'text',
            },
          ],
        },
        {
          name: 'vibe',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Cozy', value: 'cozy' },
            { label: 'Modern', value: 'modern' },
            { label: 'Historic', value: 'historic' },
            { label: 'Trendy', value: 'trendy' },
            { label: 'Romantic', value: 'romantic' },
            { label: 'Family-Friendly', value: 'family-friendly' },
            { label: 'Quiet', value: 'quiet' },
            { label: 'Lively', value: 'lively' },
          ],
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'published',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      slug: 'media',
      upload: {
        staticDir: 'media',
        imageSizes: [
          {
            name: 'thumbnail',
            width: 400,
            height: 300,
            position: 'centre',
          },
          {
            name: 'card',
            width: 768,
            height: 1024,
            position: 'centre',
          },
          {
            name: 'hero',
            width: 1920,
            height: 1080,
            position: 'centre',
          },
        ],
        adminThumbnail: 'thumbnail',
        mimeTypes: ['image/*'],
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
    {
      slug: 'pages',
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'content',
          type: 'richText',
          editor: lexicalEditor({}),
        },
        {
          name: 'published',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  plugins: [
    seoPlugin({
      collections: ['destinations', 'pages'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }: any) => `Urban Manual — ${doc?.name || doc?.title}`,
      generateDescription: ({ doc }: any) => doc?.description || doc?.excerpt,
    }),
  ],
})

