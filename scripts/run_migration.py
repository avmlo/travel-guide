#!/usr/bin/env python3
"""
Run database migration via Supabase API
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment
load_dotenv('/home/ubuntu/urban-manual/urban-manual-next/.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

print("=" * 60)
print("🗄️  Running Database Migration")
print("=" * 60)

print(f"\n📡 Connecting to Supabase...")
print(f"   URL: {SUPABASE_URL}")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Read migration SQL
with open('/home/ubuntu/urban-manual/migrations/add_enrichment_fields.sql', 'r') as f:
    sql = f.read()

print(f"\n📝 Migration SQL loaded ({len(sql)} characters)")

# Split into individual statements (Supabase RPC might need this)
statements = [s.strip() for s in sql.split(';') if s.strip() and not s.strip().startswith('--')]

print(f"\n🔧 Executing {len(statements)} SQL statements...")

try:
    # Note: Supabase Python client doesn't have direct SQL execution
    # We need to use the REST API directly
    import requests
    
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    
    # Execute via PostgREST (limited)
    # Alternative: Use psycopg2 with direct connection
    print("\n⚠️  Note: For full SQL execution, please run the migration in Supabase SQL Editor")
    print(f"   File: /home/ubuntu/urban-manual/migrations/add_enrichment_fields.sql")
    
    # Let's try a simpler approach - check if columns exist
    print("\n🔍 Checking current table structure...")
    response = supabase.table('destinations').select('*').limit(1).execute()
    
    if response.data:
        existing_columns = list(response.data[0].keys())
        print(f"\n✅ Current columns ({len(existing_columns)}):")
        for col in sorted(existing_columns):
            print(f"   - {col}")
        
        new_columns = [
            'website', 'phone', 'instagram', 'price_range', 'opening_hours',
            'vibe_tags', 'keywords', 'amenities', 'neighborhood', 'address',
            'country', 'architectural_style', 'designer_name', 'ai_summary'
        ]
        
        missing = [col for col in new_columns if col not in existing_columns]
        
        if missing:
            print(f"\n📋 Columns to be added ({len(missing)}):")
            for col in missing:
                print(f"   - {col}")
        else:
            print(f"\n✅ All enrichment columns already exist!")
    
    print("\n" + "=" * 60)
    print("📌 Next Steps:")
    print("=" * 60)
    print("1. Go to: https://supabase.com/dashboard/project/avdnefdfwvpjkuanhdwk/sql")
    print("2. Copy the SQL from: migrations/add_enrichment_fields.sql")
    print("3. Paste and run in the SQL Editor")
    print("4. Then run: python3 scripts/enrich_destinations.py")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\n💡 Please run the migration manually in Supabase SQL Editor")


