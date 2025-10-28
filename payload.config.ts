import { buildConfig } from 'payload/config'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { slateEditor } from '@payloadcms/richtext-slate'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import path from 'path'

// Collections
import { Destinations } from './collections/Destinations'
import { Cities } from './collections/Cities'
import { Categories } from './collections/Categories'
import { Users } from './collections/Users'
import { Trips } from './collections/Trips'
import { Reviews } from './collections/Reviews'
import { Lists } from './collections/Lists'
import { Media } from './collections/Media'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    bundler: webpackBundler(),
    user: 'users',
    meta: {
      titleSuffix: '- Urban Manual',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
  },
  editor: slateEditor({}),
  collections: [
    Users,
    Destinations,
    Cities,
    Categories,
    Trips,
    Reviews,
    Lists,
    Media,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
  }),
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  cors: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ].filter(Boolean),
  csrf: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ].filter(Boolean),
})
