import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-here',
  admin: {
    user: 'users',
    importMap: {
      baseDir: __dirname,
    },
  },
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
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
})
