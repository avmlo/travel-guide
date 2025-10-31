#!/usr/bin/env python3
"""
Verify that the migration was successful.
"""

from supabase import create_client

url = "https://avdnefdfwvpjkuanhdwk.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZG5lZmRmd3Zwamt1YW5oZHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTg4MzMsImV4cCI6MjA2OTI5NDgzM30.imGFTDynzDG5bK0w_j5pgwMPBeT9rkXm8ZQ18W6A-nw"

supabase = create_client(url, key)

print("="*60)
print("VERIFYING MIGRATION")
print("="*60)

tables_to_check = ['cities', 'categories', 'profiles', 'list_destinations']

for table in tables_to_check:
    print(f"\n📋 Table: {table}")
    try:
        # Get count
        count_response = supabase.table(table).select("*", count="exact").limit(0).execute()
        count = count_response.count
        
        # Get sample
        sample_response = supabase.table(table).select("*").limit(3).execute()
        
        print(f"  Rows: {count}")
        
        if sample_response.data:
            print(f"  Sample data:")
            for item in sample_response.data[:2]:
                print(f"    - {item.get('name') or item.get('id')}")
        else:
            print(f"  (Empty - this is OK for profiles and list_destinations)")
            
    except Exception as e:
        print(f"  ✗ Error: {e}")

print("\n" + "="*60)
print("✅ Verification complete!")
print("="*60)

