/**
 * Sync Supabase destinations to Google Vertex AI Search
 *
 * This script:
 * 1. Fetches all destinations from Supabase
 * 2. Formats them for Vertex AI Search
 * 3. Indexes them in Vertex AI data store
 *
 * Run with: npx tsx scripts/sync-to-vertex-ai.ts
 */

import { createClient } from '@supabase/supabase-js';
import { DocumentServiceClient } from '@google-cloud/discoveryengine';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'global';
const dataStoreId = process.env.VERTEX_AI_DATA_STORE_ID!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface Destination {
  slug: string;
  name: string;
  city: string;
  category: string;
  content: string | null;
  image: string | null;
  michelin_stars: number | null;
  crown: boolean;
}

async function syncToVertexAI() {
  console.log('🔄 Starting sync to Vertex AI Search...\n');

  // 1. Fetch all destinations from Supabase
  console.log('📥 Fetching destinations from Supabase...');
  const { data: destinations, error } = await supabase
    .from('destinations')
    .select('*')
    .order('name');

  if (error || !destinations) {
    console.error('❌ Error fetching destinations:', error);
    process.exit(1);
  }

  console.log(`✅ Found ${destinations.length} destinations\n`);

  // 2. Format destinations for Vertex AI
  console.log('🔧 Formatting documents for Vertex AI...');
  const documents = destinations.map((dest: Destination) => {
    const content = [
      dest.name,
      dest.city,
      dest.category,
      dest.content || '',
      dest.michelin_stars ? `${dest.michelin_stars} michelin stars` : '',
      dest.crown ? 'featured destination' : '',
    ].filter(Boolean).join(' ');

    return {
      id: dest.slug,
      jsonData: JSON.stringify({
        slug: dest.slug,
        name: dest.name,
        city: dest.city,
        category: dest.category,
        content: dest.content,
        image: dest.image,
        michelin_stars: dest.michelin_stars,
        crown: dest.crown,
        // Full text for search
        searchableText: content,
      }),
      content: {
        mimeType: 'application/json',
        rawBytes: Buffer.from(JSON.stringify({
          slug: dest.slug,
          name: dest.name,
          city: dest.city,
          category: dest.category,
        })),
      },
    };
  });

  console.log(`✅ Formatted ${documents.length} documents\n`);

  // 3. Initialize Vertex AI client
  console.log('🔌 Connecting to Vertex AI Search...');
  const client = new DocumentServiceClient();

  // 4. Batch import documents
  const branchPath = `projects/${projectId}/locations/${location}/collections/default_collection/dataStores/${dataStoreId}/branches/default_branch`;

  console.log(`📤 Uploading to: ${branchPath}\n`);

  try {
    // Note: You may need to batch this for large datasets
    // Vertex AI has a limit of ~1000 documents per import request
    const batchSize = 100;

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);

      console.log(`Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}...`);

      const [operation] = await client.importDocuments({
        parent: branchPath,
        inlineSource: {
          documents: batch,
        },
        reconciliationMode: 'INCREMENTAL', // Updates existing, adds new
      });

      console.log(`⏳ Waiting for batch to complete...`);
      await operation.promise();
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} completed\n`);
    }

    console.log('✨ Sync completed successfully!');
    console.log(`📊 Total documents indexed: ${destinations.length}`);

  } catch (error) {
    console.error('❌ Error syncing to Vertex AI:', error);
    process.exit(1);
  }
}

// Run the sync
syncToVertexAI()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
