import { AdminView } from '@payloadcms/next/views'
import configPromise from '@/payload.config'

export default async function PayloadAdminPage() {
  return <AdminView config={configPromise} />
}

export const dynamic = 'force-dynamic'
