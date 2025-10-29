# Use Gemini Instead of OpenAI in Morphic

**Date:** October 26, 2025
**Goal:** Configure Morphic to use Google Gemini instead of OpenAI

---

## Why Gemini?

### **Cost Comparison:**

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| **Gemini 2.0 Flash** | **$0.075** | **$0.30** |
| **Gemini 1.5 Flash** | **$0.075** | **$0.30** |
| **Gemini 1.5 Pro** | **$1.25** | **$5.00** |
| GPT-4o | $2.50 | $10.00 |
| GPT-4o-mini | $0.15 | $0.60 |

**Gemini is 2-3x cheaper than GPT-4o-mini and 33x cheaper than GPT-4o!**

### **Performance:**
- ✅ **Fast** - Gemini 2.0 Flash is extremely fast
- ✅ **Large context** - 1M tokens (vs 128K for GPT-4o)
- ✅ **Multimodal** - Native image understanding
- ✅ **Free tier** - 1,500 requests/day free!

---

## Step 1: Get Gemini API Key

### Option A: Google AI Studio (Recommended - Free!)

1. **Visit Google AI Studio:**
   - Go to: https://aistudio.google.com/app/apikey

2. **Create API Key:**
   - Click "Get API key"
   - Click "Create API key in new project"
   - Copy your API key (starts with `AIza...`)

3. **Free Tier Limits:**
   - ✅ 1,500 requests per day
   - ✅ 1 million tokens per minute
   - ✅ Perfect for development and moderate production use

### Option B: Google Cloud (For Production)

1. **Enable Vertex AI API:**
   - Go to: https://console.cloud.google.com/
   - Enable "Vertex AI API"

2. **Create Service Account:**
   - IAM & Admin → Service Accounts
   - Create service account with "Vertex AI User" role
   - Download JSON key

3. **Pricing:**
   - Pay-as-you-go (see table above)
   - No free tier, but very affordable

---

## Step 2: Configure Environment Variables

### Edit `.env.local`:

```bash
# ============================================
# GEMINI CONFIGURATION (Choose one option)
# ============================================

# Option A: Google AI Studio (Recommended - Free!)
GOOGLE_GENERATIVE_AI_API_KEY=AIza...your-key-here

# Option B: Vertex AI (Production)
# GOOGLE_VERTEX_PROJECT=your-project-id
# GOOGLE_VERTEX_LOCATION=us-central1
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# ============================================
# REMOVE OR COMMENT OUT OPENAI
# ============================================

# OPENAI_API_KEY=sk-...

# ============================================
# SUPABASE (Keep these)
# ============================================

NEXT_PUBLIC_SUPABASE_URL=https://avdnefdfwvpjkuanhdwk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# ============================================
# OPTIONAL: Redis for chat history
# ============================================

UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## Step 3: Install Gemini SDK

```bash
# Install Google Generative AI SDK
npm install @ai-sdk/google
# or
bun add @ai-sdk/google
```

---

## Step 4: Configure Models

### Edit `public/config/models.json`:

```json
{
  "models": [
    {
      "id": "gemini-2.0-flash-exp",
      "name": "Gemini 2.0 Flash",
      "provider": "google",
      "providerId": "google",
      "description": "Fast and efficient model for most tasks",
      "reasoning": false,
      "default": true
    },
    {
      "id": "gemini-1.5-flash",
      "name": "Gemini 1.5 Flash",
      "provider": "google",
      "providerId": "google",
      "description": "Balanced performance and cost",
      "reasoning": false
    },
    {
      "id": "gemini-1.5-pro",
      "name": "Gemini 1.5 Pro",
      "provider": "google",
      "providerId": "google",
      "description": "Most capable model for complex tasks",
      "reasoning": false
    }
  ]
}
```

**Note:** Set `"default": true` on the model you want to use by default.

---

## Step 5: Update AI Chat Route

### Find `app/api/chat/route.ts` (or similar)

### Replace OpenAI import with Gemini:

```typescript
// BEFORE (OpenAI)
// import { openai } from '@ai-sdk/openai'

// AFTER (Gemini)
import { google } from '@ai-sdk/google'

// Configure the model
const model = google('gemini-2.0-flash-exp')
// or
// const model = google('gemini-1.5-flash')
// const model = google('gemini-1.5-pro')
```

### Update the chat completion:

```typescript
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: google('gemini-2.0-flash-exp'),
    messages,
    system: `You are an expert travel advisor for Urban Manual...`,
    tools: {
      searchDestinations: {
        // ... your search tool
      }
    },
    maxTokens: 4096,
    temperature: 0.7
  })

  return result.toAIStreamResponse()
}
```

---

## Step 6: Test Gemini Integration

### Create test file `lib/test-gemini.ts`:

```typescript
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

async function testGemini() {
  console.log('🧪 Testing Gemini integration...\n')

  try {
    const { text } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt: 'Say hello and confirm you are Gemini!'
    })

    console.log('✅ Gemini response:', text)
    console.log('\n🎉 Gemini is working!')
  } catch (error) {
    console.error('❌ Gemini test failed:', error)
  }
}

testGemini()
```

### Run the test:

```bash
bun run lib/test-gemini.ts
```

Expected output:
```
🧪 Testing Gemini integration...

✅ Gemini response: Hello! Yes, I am Gemini, Google's large language model. How can I help you today?

🎉 Gemini is working!
```

---

## Step 7: Update System Prompt for Gemini

Gemini works best with clear, structured prompts. Update your system prompt:

```typescript
const systemPrompt = `You are an expert travel advisor for Urban Manual, a curated collection of 921 design-focused destinations worldwide.

# Your Role
Help users discover perfect destinations from our database of restaurants, cafes, hotels, bars, shops, and bakeries.

# Available Tools
- searchDestinations: Search our database with filters for city, category, vibe, price, etc.
- getDestinationDetails: Get detailed information about a specific destination
- getSimilarDestinations: Find similar destinations

# Guidelines
1. Always use searchDestinations to find relevant destinations
2. Consider user preferences: location, vibe, price range, category
3. Provide specific, detailed recommendations
4. Explain why each destination matches their needs
5. Suggest follow-up searches or related destinations

# Response Format
- Start with a brief summary of what you found
- Present destinations with key details (name, location, category, stars, vibe)
- Explain what makes each special
- End with related questions or suggestions

# Data Available
Each destination includes: name, city, category, Michelin stars, price range, vibe tags, architectural style, designer name, amenities, and AI-generated summary.

Be enthusiastic, specific, and helpful!`
```

---

## Step 8: Configure Model Selection UI

### If you want users to choose models, update `components/model-selector.tsx`:

```typescript
'use client'

import { useState } from 'react'

const GEMINI_MODELS = [
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    description: 'Fast and efficient (Recommended)',
    cost: 'Cheapest'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Balanced performance',
    cost: 'Cheap'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Most capable',
    cost: 'Moderate'
  }
]

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash-exp')

  return (
    <select
      value={selectedModel}
      onChange={(e) => setSelectedModel(e.target.value)}
      className="px-3 py-2 border rounded"
    >
      {GEMINI_MODELS.map(model => (
        <option key={model.id} value={model.id}>
          {model.name} - {model.cost}
        </option>
      ))}
    </select>
  )
}
```

---

## Gemini-Specific Features

### 1. **Large Context Window**

Gemini supports up to 1M tokens, perfect for long conversations:

```typescript
const result = await streamText({
  model: google('gemini-1.5-pro'),
  messages,
  maxTokens: 8192, // Can go much higher with Gemini
})
```

### 2. **Multimodal (Images)**

Gemini can understand images natively:

```typescript
const result = await generateText({
  model: google('gemini-2.0-flash-exp'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What destination is this?' },
        { type: 'image', image: imageUrl }
      ]
    }
  ]
})
```

### 3. **JSON Mode**

Force Gemini to return valid JSON:

```typescript
const result = await generateText({
  model: google('gemini-2.0-flash-exp'),
  prompt: 'List 3 cafes in Tokyo',
  output: 'json'
})
```

### 4. **Thinking Mode (Gemini 2.0)**

Enable visible reasoning:

```typescript
const result = await streamText({
  model: google('gemini-2.0-flash-thinking-exp'),
  messages,
  // Gemini will show its reasoning process
})
```

---

## Cost Comparison Example

### Scenario: 1,000 searches/month
- Average: 1,000 input tokens + 500 output tokens per search

**With OpenAI GPT-4o-mini:**
- Input: 1,000 searches × 1,000 tokens × $0.15/1M = $0.15
- Output: 1,000 searches × 500 tokens × $0.60/1M = $0.30
- **Total: $0.45/month**

**With Gemini 2.0 Flash:**
- Input: 1,000 searches × 1,000 tokens × $0.075/1M = $0.075
- Output: 1,000 searches × 500 tokens × $0.30/1M = $0.15
- **Total: $0.225/month**

**Savings: 50% cheaper!**

**With Gemini Free Tier:**
- 1,500 requests/day = 45,000/month
- **Total: $0/month** (if under free tier limits)

---

## Troubleshooting

### Issue 1: "API key not valid"

**Solution:**
```bash
# Check your API key in .env.local
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# Make sure it starts with "AIza"
# Restart dev server after changing
```

### Issue 2: "Model not found"

**Solution:**
```typescript
// Use correct model names:
google('gemini-2.0-flash-exp')     // ✅ Correct
google('gemini-2.0-flash')         // ❌ Wrong
google('gemini-1.5-flash')         // ✅ Correct
google('gemini-1.5-pro')           // ✅ Correct
```

### Issue 3: "Rate limit exceeded"

**Solution:**
```bash
# Free tier limits:
# - 1,500 requests/day
# - 1M tokens/minute

# If you exceed, either:
# 1. Wait for reset (daily)
# 2. Upgrade to paid tier
# 3. Implement rate limiting in your app
```

### Issue 4: "Tool calling not working"

**Solution:**
```typescript
// Gemini supports tool calling, but format might differ slightly
// Make sure your tool definitions are correct:

tools: {
  searchDestinations: {
    description: 'Search for destinations', // Clear description
    parameters: z.object({
      query: z.string().describe('Search query') // Describe each param
    }),
    execute: async (params) => {
      // Your function
    }
  }
}
```

---

## Gemini vs OpenAI: Key Differences

| Feature | Gemini 2.0 Flash | GPT-4o-mini |
|---------|------------------|-------------|
| **Cost** | $0.075/$0.30 per 1M | $0.15/$0.60 per 1M |
| **Speed** | Very fast | Fast |
| **Context** | 1M tokens | 128K tokens |
| **Free Tier** | 1,500 req/day | None |
| **Multimodal** | Native | Via separate API |
| **Tool Calling** | Yes | Yes |
| **JSON Mode** | Yes | Yes |
| **Reasoning** | Yes (thinking mode) | No |

---

## Recommended Configuration

### For Development:
```bash
# Use free tier
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# Use Gemini 2.0 Flash
model: google('gemini-2.0-flash-exp')
```

### For Production (Low Traffic):
```bash
# Use free tier (if under 1,500 req/day)
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# Use Gemini 1.5 Flash (stable)
model: google('gemini-1.5-flash')
```

### For Production (High Traffic):
```bash
# Use Vertex AI with billing
GOOGLE_VERTEX_PROJECT=your-project
GOOGLE_VERTEX_LOCATION=us-central1

# Use Gemini 1.5 Pro (best quality)
model: google('gemini-1.5-pro')
```

---

## Migration Checklist

- [ ] Get Gemini API key from AI Studio
- [ ] Add `GOOGLE_GENERATIVE_AI_API_KEY` to `.env.local`
- [ ] Install `@ai-sdk/google` package
- [ ] Replace `openai` imports with `google`
- [ ] Update model in chat route
- [ ] Update `models.json` config
- [ ] Test with `lib/test-gemini.ts`
- [ ] Update system prompt
- [ ] Remove/comment out `OPENAI_API_KEY`
- [ ] Deploy and test in production

---

## Summary

### What You've Done:
✅ Switched from OpenAI to Gemini
✅ Reduced costs by 50%+
✅ Got 1,500 free requests/day
✅ Gained 1M token context window
✅ Enabled multimodal capabilities

### Cost Savings:
- **Free tier:** $0/month (up to 1,500 req/day)
- **Paid tier:** 50% cheaper than OpenAI
- **Example:** 1,000 searches = $0.225 vs $0.45

### Next Steps:
1. Test thoroughly with your destination search
2. Monitor usage in Google AI Studio
3. Consider upgrading to Vertex AI for production
4. Implement rate limiting if needed

---

## Quick Reference

### Get API Key:
https://aistudio.google.com/app/apikey

### Environment Variable:
```bash
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

### Model Usage:
```typescript
import { google } from '@ai-sdk/google'

const model = google('gemini-2.0-flash-exp')
```

### Available Models:
- `gemini-2.0-flash-exp` - Fastest, cheapest
- `gemini-1.5-flash` - Balanced
- `gemini-1.5-pro` - Most capable

Need help with the migration? Let me know!

