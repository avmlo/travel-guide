import { buildConfig } from 'payload/config';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { slateEditor } from '@payloadcms/richtext-slate';
import path from 'path';

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- The Urban Manual',
      favicon: '/favicon.ico',
    },
  },
  editor: slateEditor({}),
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
      ],
    },
    {
      slug: 'destinations',
      admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'city', 'category', 'michelin_stars'],
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
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'short_description',
          type: 'textarea',
        },
        {
          name: 'image',
          type: 'text',
          admin: {
            description: 'URL to the destination image',
          },
        },
        {
          name: 'michelin_stars',
          type: 'number',
          min: 0,
          max: 3,
        },
        {
          name: 'crown',
          type: 'checkbox',
          defaultValue: false,
        },
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
          type: 'textarea',
        },
        {
          name: 'website',
          type: 'text',
        },
      ],
    },
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URL,
    },
  }),
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
});
