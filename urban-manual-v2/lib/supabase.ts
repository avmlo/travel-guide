import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Destination = {
  id: number
  name: string
  slug: string
  city: string
  country: string
  category: string
  description?: string
  main_image?: string
  latitude?: number
  longitude?: number
  address?: string
  website?: string
  phone?: string
  instagram?: string
  created_at: string
  updated_at: string
}

