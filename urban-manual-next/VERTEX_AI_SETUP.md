# Google Vertex AI Search Setup Guide

This guide walks you through setting up Google Vertex AI Search for natural language search in Urban Manual.

## Benefits

- 🧠 **Natural language understanding**: "romantic dinner in Paris" works perfectly
- 🔍 **Smart ranking**: Google's AI ranks results by relevance
- 🎯 **Typo tolerance**: "restrant in pais" still finds restaurants in Paris
- ⚡ **Fast & scalable**: Sub-100ms latency globally
- 💰 **Free tier**: 10,000 queries/month free

## Prerequisites

1. Google Cloud account (new accounts get $300 free credit)
2. Google Cloud CLI installed (optional but recommended)

## Setup Steps

### 1. Create Google Cloud Project

```bash
# Visit https://console.cloud.google.com/
# Click "Create Project"
# Name it "urban-manual" or similar
# Note your PROJECT_ID
```

### 2. Enable Required APIs

```bash
# In Google Cloud Console, enable these APIs:
# - Discovery Engine API
# - Vertex AI API

# Or via CLI:
gcloud services enable discoveryengine.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

### 3. Create Vertex AI Search Data Store

```bash
# Go to: https://console.cloud.google.com/gen-app-builder/engines
# Click "Create App"
# Select "Search"
# Name: "Urban Manual Destinations"
# Data Store ID: "destinations-datastore" (must match .env)
# Select "Unstructured data" or "Structured data" (we'll use JSON)
```

### 4. Create Service Account

```bash
# Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
# Click "Create Service Account"
# Name: "vertex-ai-search"
# Grant roles:
#   - Discovery Engine Admin
#   - Vertex AI User

# Create JSON key:
# Click on service account → Keys → Add Key → Create New Key → JSON
# Download the JSON file
```

### 5. Configure Environment Variables

Add to `/urban-manual-next/.env`:

```bash
# Google Vertex AI Search
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=global
VERTEX_AI_DATA_STORE_ID=destinations-datastore
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

**Important:** Add the service account JSON file to your project root and update the path above.

### 6. Add Service Account Key to .gitignore

```bash
# Add to .gitignore
*.json
!package.json
!package-lock.json
!tsconfig.json
```

### 7. Install Dependencies (Already Done)

```bash
npm install @google-cloud/discoveryengine
npm install -D tsx  # For running TypeScript scripts
```

### 8. Sync Your Destinations to Vertex AI

Run the sync script to index all your destinations:

```bash
npx tsx scripts/sync-to-vertex-ai.ts
```

This will:
- Fetch all destinations from Supabase
- Format them for Vertex AI
- Upload them in batches of 100
- Takes ~1-2 minutes for 1000 destinations

**When to re-run:**
- After adding new destinations
- After updating destination content
- Set up a cron job to sync daily

### 9. Test the Search API

```bash
# Start dev server
npm run dev

# Test search endpoint
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "romantic dinner in paris"}'
```

## Usage

### Frontend Integration

The search API is ready to use:

```typescript
// Search with natural language
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'michelin star restaurants',
    pageSize: 20
  })
});

const { results } = await response.json();
```

### Update Home Page Search

To use Vertex AI for search, modify `app/page.tsx`:

```typescript
// Replace filterDestinations() with API call
const searchWithVertexAI = async (query: string) => {
  const response = await fetch('/api/search', {
    method: 'POST',
    body: JSON.stringify({ query, pageSize: 50 })
  });

  const { results } = await response.json();
  setFilteredDestinations(results);
};
```

## Pricing

**Free Tier:**
- 10,000 queries/month free
- Perfect for testing and small apps

**After Free Tier:**
- ~$0.75 per 1,000 queries
- Example: 50,000 queries/month = $30

**Cost Optimization:**
- Cache common searches
- Fallback to Supabase for simple filters
- Use Vertex AI only for complex queries

## Deployment

### Vercel

Add environment variables in Vercel dashboard:
- `GOOGLE_CLOUD_PROJECT_ID`
- `GOOGLE_CLOUD_LOCATION`
- `VERTEX_AI_DATA_STORE_ID`

For `GOOGLE_APPLICATION_CREDENTIALS`:
- Copy the entire JSON key content
- In Vercel, create env var `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- In your code, write it to a temp file:

```typescript
import { writeFileSync } from 'fs';

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const keyPath = '/tmp/gcloud-key.json';
  writeFileSync(keyPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
}
```

### Cloudflare Pages

Similar approach - use environment variables and temporary file.

## Troubleshooting

### "Permission denied" error
- Check service account has correct roles
- Verify `GOOGLE_APPLICATION_CREDENTIALS` path is correct

### "Data store not found"
- Verify `VERTEX_AI_DATA_STORE_ID` matches dashboard
- Check data store is in correct location (global)

### No results returned
- Run sync script to index destinations
- Wait 2-3 minutes for indexing to complete
- Check Cloud Console for indexing status

### Slow queries
- Check data store location (use `global` for best latency)
- Enable query result caching
- Consider using Cloud CDN

## Advanced Features

### Faceted Search

Add filters to search:

```typescript
const [response] = await client.search({
  servingConfig: servingConfigPath,
  query,
  facetSpecs: [
    {
      facetKey: {
        key: 'category',
      },
    },
    {
      facetKey: {
        key: 'city',
      },
    },
  ],
});
```

### Personalization

Track user behavior for better recommendations:

```typescript
// Track user events
await client.writeUserEvent({
  userEvent: {
    eventType: 'view-item',
    userInfo: { userId: user.id },
    documentInfo: { id: destination.slug },
  },
});
```

### Autocomplete

Add search suggestions:

```typescript
import { CompletionServiceClient } from '@google-cloud/discoveryengine';

const completionClient = new CompletionServiceClient();
const [response] = await completionClient.completeQuery({
  query: 'roma',
  queryModel: 'document',
});

// Returns: ["romantic restaurants", "rome italy", "rooftop bars"]
```

## Monitoring

View search analytics in Google Cloud Console:
- Query volume
- Popular searches
- No-result searches
- Average latency

## Next Steps

1. ✅ Setup complete
2. 🔄 Run sync script
3. 🧪 Test search API
4. 🎨 Update frontend to use Vertex AI
5. 📊 Monitor usage and costs
6. 🚀 Deploy to production

## Support

- [Vertex AI Search Documentation](https://cloud.google.com/generative-ai-app-builder/docs/introduction)
- [API Reference](https://cloud.google.com/nodejs/docs/reference/discoveryengine/latest)
- [Pricing Calculator](https://cloud.google.com/products/calculator)
