import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface CSVPlace {
  name: string;
  slug: string;
  city: string;
  category: string;
  michelinStars: number;
  mainImage: string;
  additionalImages: string[];
}

function parseCSV(filePath: string): CSVPlace[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const places: CSVPlace[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line (handle quoted fields)
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());

    const name = fields[0];
    const slug = fields[1];
    const city = fields[11];
    const category = fields[15];
    const michelinStars = parseInt(fields[16]) || 0;
    const mainImage = fields[17];
    const additionalImagesStr = fields[18] || '';
    const additionalImages = additionalImagesStr
      .split(';')
      .map(img => img.trim())
      .filter(img => img.length > 0);

    // Only add if has main image
    if (mainImage && mainImage.startsWith('http')) {
      places.push({
        name,
        slug,
        city: city.toLowerCase().replace(/\s+/g, '-'),
        category: category || 'Other',
        michelinStars,
        mainImage,
        additionalImages
      });
    }
  }

  return places;
}

async function fetchGoogleDescription(name: string, city: string): Promise<string | null> {
  try {
    const query = `${name} ${city}`;
    const url = `https://places.googleapis.com/v1/places:searchText`;
    
    const response = await axios.post(
      url,
      {
        textQuery: query,
        languageCode: 'en'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.editorialSummary'
        }
      }
    );

    if (response.data.places && response.data.places.length > 0) {
      const place = response.data.places[0];
      if (place.editorialSummary && place.editorialSummary.text) {
        return place.editorialSummary.text;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error fetching description for ${name}:`, error);
    return null;
  }
}

async function main() {
  console.log('Starting CSV import...\n');

  // Parse CSV
  const csvPath = '/home/ubuntu/upload/TheSpaceManual-Spaces.csv';
  const places = parseCSV(csvPath);
  console.log(`Parsed ${places.length} places from CSV (with images)\n`);

  // Get existing destinations from database
  const { data: existingDestinations } = await supabase
    .from('destinations')
    .select('slug');

  const existingSlugs = new Set(existingDestinations?.map(d => d.slug) || []);
  console.log(`Found ${existingSlugs.size} existing destinations in database\n`);

  // Filter out duplicates
  const newPlaces = places.filter(p => !existingSlugs.has(p.slug));
  console.log(`${newPlaces.length} new places to add\n`);

  if (newPlaces.length === 0) {
    console.log('No new places to add!');
    return;
  }

  let added = 0;
  let failed = 0;

  for (const place of newPlaces) {
    try {
      console.log(`Processing: ${place.name} (${place.city})...`);

      // Fetch Google description
      const description = await fetchGoogleDescription(place.name, place.city);
      
      // Insert into database
      const { error } = await supabase
        .from('destinations')
        .insert({
          name: place.name,
          slug: place.slug,
          city: place.city,
          category: place.category,
          michelin_stars: place.michelinStars,
          image: place.mainImage,
          main_image: place.mainImage,
          additional_images: place.additionalImages,
          content: description || '',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error(`  ❌ Failed: ${error.message}`);
        failed++;
      } else {
        console.log(`  ✅ Added${description ? ' with description' : ''}`);
        added++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  ❌ Error: ${error}`);
      failed++;
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Added: ${added}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${newPlaces.length}`);
}

main().catch(console.error);

