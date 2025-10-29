#!/usr/bin/env python3
"""
Run database migration via direct PostgreSQL connection
"""

import os
import psycopg2
from dotenv import load_dotenv

# Load environment
load_dotenv('/home/ubuntu/urban-manual/urban-manual-next/.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')

# Extract project ref from URL
project_ref = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')

# Construct PostgreSQL connection string
# Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
print("=" * 60)
print("🗄️  Database Migration via Direct PostgreSQL Connection")
print("=" * 60)

print(f"\n📡 Project Reference: {project_ref}")
print(f"\n⚠️  To run this migration, you need your Supabase database password.")
print(f"\nYou can find it in:")
print(f"1. Supabase Dashboard → Settings → Database")
print(f"2. Or use the connection string from your project settings")

# Ask user for password (or read from env)
db_password = os.getenv('SUPABASE_DB_PASSWORD')

if not db_password:
    print(f"\n💡 Set SUPABASE_DB_PASSWORD environment variable or:")
    print(f"   Run this command in Supabase SQL Editor instead:")
    print(f"\n   File: /home/ubuntu/urban-manual/migrations/add_enrichment_fields.sql")
    print(f"   URL: https://supabase.com/dashboard/project/{project_ref}/sql")
    exit(0)

# Connect to database
conn_string = f"postgresql://postgres:{db_password}@db.{project_ref}.supabase.co:5432/postgres"

try:
    print(f"\n🔌 Connecting to database...")
    conn = psycopg2.connect(conn_string)
    cursor = conn.cursor()
    
    # Read migration SQL
    with open('/home/ubuntu/urban-manual/migrations/add_enrichment_fields.sql', 'r') as f:
        sql = f.read()
    
    print(f"📝 Executing migration...")
    cursor.execute(sql)
    conn.commit()
    
    print(f"✅ Migration completed successfully!")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print(f"\n💡 Please run the migration manually in Supabase SQL Editor:")
    print(f"   https://supabase.com/dashboard/project/{project_ref}/sql")

