'''
Urban Manual Database Enrichment Script
Fetches enrichment data and outputs it as a JSON array.
'''

import os
import json
import time
import requests
from typing import Dict, List, Optional
from openai import OpenAI
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Configuration ---
BATCH_SIZE = 20 # Process 20 destinations to get a good sample
RATE_LIMIT_DELAY = 0.5

# --- Initialization ---
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# --- Helper Functions ---
def fetch_destinations(limit: Optional[int] = None) -> List[Dict]:
    print(f"📥 Fetching destinations...")
    query = supabase.table("destinations").select("slug,name,city,category,content").order("id")
    if limit:
        query = query.limit(limit)
    response = query.execute()
    print(f"✅ Fetched {len(response.data)} destinations")
    return response.data

def search_google_places(name: str, city: str) -> Optional[Dict]:
    if not GOOGLE_PLACES_API_KEY:
        return None
    query = f'{name} {city}'
    url = f"https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input={query}&inputtype=textquery&fields=place_id&key={GOOGLE_PLACES_API_KEY}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json().get("candidates", [{}])[0]
    except Exception:
        return None

def get_place_details(place_id: str) -> Optional[Dict]:
    if not GOOGLE_PLACES_API_KEY:
        return None
    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=name,international_phone_number,website,opening_hours,price_level,url&key={GOOGLE_PLACES_API_KEY}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json().get("result")
    except Exception:
        return None

def extract_design_metadata_with_ai(content: str, name: str, category: str) -> Dict:
    if not OPENAI_API_KEY:
        return {}
    prompt = f'''Analyze the following destination and extract the specified metadata. Return ONLY a valid JSON object.

Destination: {name}
Category: {category}
Description: {content}

Extract:
- vibe_tags: Array of 2-4 atmosphere descriptors (e.g., "cozy", "minimalist", "luxurious").
- architectural_style: The architectural style if mentioned.
- keywords: Array of 5-8 relevant search keywords.'''
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "system", "content": "You are a design expert. Extract metadata accurately."},{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {}

def enrich_destination(dest: Dict) -> Dict:
    print(f'🔍 Enriching: {dest["name"]}')
    data = {'slug': dest['slug']}
    place = search_google_places(dest["name"], dest["city"])
    if place and place.get("place_id"):
        time.sleep(RATE_LIMIT_DELAY)
        details = get_place_details(place["place_id"])
        if details:
            data.update({
                "website": details.get("website"),
                "phone": details.get("international_phone_number"),
                "price_range": "$" * details.get("price_level", 0),
            })
            print("  ✅ Found on Google Places")
    if dest.get("content"):
        time.sleep(RATE_LIMIT_DELAY)
        ai_meta = extract_design_metadata_with_ai(dest["content"], dest["name"], dest.get("category"))
        if ai_meta:
            data.update(ai_meta)
            print(f"  ✅ Extracted AI metadata")
    return data

def main():
    print("🚀 Starting Enrichment Data Fetch...")
    destinations = fetch_destinations(limit=BATCH_SIZE)
    if not destinations:
        print("❌ No destinations found.")
        return

    all_enriched_data = []
    for i, dest in enumerate(destinations, 1):
        print(f'\n[{i}/{len(destinations)}]', end=" ")
        enriched_data = enrich_destination(dest)
        if len(enriched_data) > 1: # More than just the slug
            all_enriched_data.append(enriched_data)

    # Output the final JSON array
    print("\n\n---\n")
    print(json.dumps(all_enriched_data, indent=2))

if __name__ == "__main__":
    main()

