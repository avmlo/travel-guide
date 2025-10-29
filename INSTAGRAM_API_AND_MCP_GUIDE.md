# Instagram API & MCP (Model Context Protocol) Guide

**Date:** October 26, 2025

---

## Part 1: Instagram API - Current State (2025)

### Overview

Instagram's API landscape has changed dramatically. **The Basic Display API was deprecated in December 2024**, and Meta now offers two main API options for developers.

### Current Instagram API Options

#### Option 1: Instagram API with Instagram Login (Recommended for Urban Manual)

**What it is:**
- Allows Instagram Business and Creator accounts to connect to your app
- Direct authentication with Instagram (no Facebook required)
- Access to media, comments, mentions, and messaging

**Requirements:**
- ✅ Instagram Business or Creator account (not personal accounts)
- ✅ Meta Developer App
- ✅ App Review for permissions

**What You Can Access:**
1. **Media Management**
   - Get user's posts (photos, videos, carousels)
   - Publish new content
   - Get media insights (likes, comments, reach)

2. **Comments & Mentions**
   - Read and reply to comments
   - Moderate comments
   - Find @mentions

3. **Messaging**
   - Send and receive DMs
   - Automated responses
   - Customer support

4. **Insights**
   - Follower demographics
   - Post performance
   - Account metrics

**What You CANNOT Access:**
- ❌ Personal Instagram accounts (only Business/Creator)
- ❌ Other users' private data
- ❌ Follower lists
- ❌ Hashtag feeds (limited)

**Limitations:**
- Users must have Instagram Business or Creator accounts
- Requires app review for each permission
- Rate limits apply
- Cannot access personal accounts

---

#### Option 2: Instagram API with Facebook Login

**What it is:**
- Similar to Option 1, but requires Facebook Page connection
- More features for businesses with Facebook presence

**Requirements:**
- ✅ Instagram Business/Creator account
- ✅ Linked to Facebook Page
- ✅ Facebook Login integration

**Additional Features:**
- Hashtag search
- Competitor insights
- Cross-posting to Facebook
- Unified messaging (Instagram + Facebook)

---

### What Happened to Basic Display API?

**Deprecated:** December 4, 2024

The Basic Display API allowed personal accounts to share their photos. It's now completely shut down. Meta wants developers to use the professional APIs instead.

---

### Can Urban Manual Use Instagram API?

**Short Answer:** Yes, but with limitations.

**Realistic Use Cases for Urban Manual:**

#### ✅ **Feasible:**

1. **Show Destination's Instagram Feed**
   - If the destination has an Instagram Business account
   - They authorize your app
   - You can display their posts on your site

2. **User-Generated Content**
   - Users with Business/Creator accounts can share
   - Requires each user to authorize your app
   - Not practical for casual users

3. **Instagram Embed (No API Needed)**
   - Use Instagram's oEmbed API
   - Embed individual posts
   - No authentication required
   - **This is the best option for Urban Manual**

#### ❌ **Not Feasible:**

1. **Show any Instagram feed without authorization**
   - Can't scrape or access without permission
   - Each account must authorize your app

2. **Personal account integration**
   - Only Business/Creator accounts work
   - Most users have personal accounts

3. **Hashtag feeds**
   - Very limited access
   - Requires business account

---

### Recommended Approach for Urban Manual

**Use Instagram oEmbed API (No Auth Required)**

This is the simplest and most practical solution:

```typescript
// lib/instagram-embed.ts
export async function getInstagramEmbed(postUrl: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(postUrl)}&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`
  )
  return response.json()
}

// Usage
const embedData = await getInstagramEmbed('https://www.instagram.com/p/ABC123/')

// Returns:
// {
//   "html": "<blockquote>...</blockquote>",
//   "thumbnail_url": "https://...",
//   "author_name": "username",
//   "provider_name": "Instagram"
// }
```

**Benefits:**
- ✅ No user authorization needed
- ✅ Works with any public post
- ✅ Simple implementation
- ✅ Officially supported by Meta

**Use Cases:**
- Embed featured Instagram posts on destination pages
- Show user-submitted photos (they provide the URL)
- Display destination's Instagram highlights
- Create Instagram galleries

---

### Alternative: Third-Party Instagram APIs

If you need more features, consider:

1. **Apify Instagram Scraper**
   - Scrapes public Instagram data
   - No API limits
   - $49/month
   - ⚠️ Against Instagram TOS

2. **PhantomBuster**
   - Instagram automation
   - Data extraction
   - $59/month
   - ⚠️ Against Instagram TOS

3. **Instaloader (Open Source)**
   - Python library
   - Download posts, profiles
   - Free
   - ⚠️ Against Instagram TOS

**Warning:** These violate Instagram's Terms of Service and could result in IP bans or legal issues. Not recommended for production.

---

## Part 2: MCP (Model Context Protocol)

### What is MCP?

**Model Context Protocol (MCP)** is an open standard created by Anthropic that allows AI applications (like Claude) to connect to external tools and data sources.

Think of MCP as **"USB-C for AI"** - a universal way to plug in tools, databases, APIs, and services.

### How MCP Works

```
┌─────────────┐
│   Claude    │
│  (AI Model) │
└──────┬──────┘
       │
       │ MCP Protocol
       │
┌──────▼──────────────────────┐
│     MCP Server              │
│  (Middleware/Connector)     │
└──────┬──────────────────────┘
       │
       │ Native APIs
       │
┌──────▼──────────────────────┐
│  External Services          │
│  • Databases                │
│  • File Systems             │
│  • APIs (GitHub, Slack)     │
│  • Web Browsers             │
└─────────────────────────────┘
```

### MCP Components

1. **MCP Server**
   - Middleware that exposes tools/resources
   - Runs locally or remotely
   - Written in Python, TypeScript, or other languages

2. **MCP Client**
   - The AI application (Claude Desktop, Claude Code)
   - Connects to MCP servers
   - Invokes tools provided by servers

3. **MCP Protocol**
   - JSON-RPC based communication
   - Standardized tool definitions
   - Resource and prompt management

---

### MCP in Claude Desktop vs Claude Web

#### Claude Desktop (Full MCP Support)

**What works:**
- ✅ Local MCP servers
- ✅ Remote MCP servers
- ✅ File system access
- ✅ Database connections
- ✅ Custom tools
- ✅ Browser automation

**How to set up:**

1. Install Claude Desktop
2. Edit MCP config file:

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

3. Add MCP servers:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token"
      }
    }
  }
}
```

4. Restart Claude Desktop

**Popular MCP Servers:**
- `@modelcontextprotocol/server-filesystem` - File access
- `@modelcontextprotocol/server-github` - GitHub integration
- `@modelcontextprotocol/server-postgres` - Database access
- `@modelcontextprotocol/server-brave-search` - Web search
- `@modelcontextprotocol/server-puppeteer` - Browser automation

---

#### Claude Web (claude.ai) - NO MCP Support

**What works:**
- ❌ No local MCP servers
- ❌ No remote MCP servers
- ❌ No custom tools
- ❌ No file system access

**Why not:**
- Security: Web version can't access your local machine
- Architecture: MCP requires local process communication
- Isolation: Web apps run in browser sandbox

**Alternatives for Claude Web:**
1. Use Claude Desktop instead
2. Use Claude API with your own MCP implementation
3. Use built-in features (artifacts, analysis)

---

### MCP in Claude Code

**Claude Code** is a VS Code-like IDE from Anthropic with full MCP support.

**What's special:**
- ✅ Built-in MCP support
- ✅ Local and remote MCP servers
- ✅ Terminal access
- ✅ File system operations
- ✅ Git integration
- ✅ Browser automation

**How to use MCP in Claude Code:**

1. Open Claude Code
2. Go to Settings → MCP Servers
3. Add servers via UI or config file

**Config location:**
```bash
~/.claude-code/mcp_config.json
```

**Example config:**
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "your-url",
        "SUPABASE_KEY": "your-key"
      }
    },
    "webflow": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-webflow"],
      "env": {
        "WEBFLOW_API_TOKEN": "your-token"
      }
    }
  }
}
```

---

### MCP Servers You're Already Using in Manus

Based on your earlier session, you have these MCP servers configured:

1. **Cloudflare** - Workers, D1, R2, KV
2. **Webflow** - CMS and site management
3. **Supabase** - Database operations
4. **Neon** - Postgres database
5. **Notion** - Document management
6. **Vercel** - Deployment management
7. **Firecrawl** - Web scraping

**How they work in Manus:**
- Manus runs in a sandbox environment
- MCP servers are pre-configured
- You access them via `manus-mcp-cli` command
- Each server exposes specific tools

---

### Can You Use MCP in Your Own Projects?

**Yes!** Here's how:

#### Option 1: Use Claude Desktop
1. Download Claude Desktop
2. Configure MCP servers
3. Chat with Claude, it uses the tools automatically

#### Option 2: Use Claude Code
1. Download Claude Code
2. Add MCP servers
3. Build projects with full tool access

#### Option 3: Build Your Own MCP Integration
```typescript
// Example: Custom MCP client
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-github'],
  env: {
    GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN
  }
})

const client = new Client({
  name: 'my-app',
  version: '1.0.0'
}, {
  capabilities: {}
})

await client.connect(transport)

// List available tools
const tools = await client.listTools()

// Call a tool
const result = await client.callTool({
  name: 'create_issue',
  arguments: {
    repo: 'owner/repo',
    title: 'Bug report',
    body: 'Description'
  }
})
```

---

### Summary

#### Instagram API
- ✅ **Use oEmbed API** for embedding public posts (easiest)
- ⚠️ **Instagram Graph API** requires Business accounts (complex)
- ❌ **Basic Display API** is deprecated (don't use)
- 🎯 **Best for Urban Manual:** oEmbed for featured posts

#### MCP
- ✅ **Claude Desktop:** Full MCP support
- ✅ **Claude Code:** Full MCP support
- ❌ **Claude Web:** No MCP support
- 🎯 **Best for development:** Use Claude Desktop or Claude Code

---

### Recommendations for Urban Manual

**Instagram Integration:**
```typescript
// Simple Instagram embed implementation
export function InstagramEmbed({ postUrl }: { postUrl: string }) {
  const [embedHtml, setEmbedHtml] = useState('')
  
  useEffect(() => {
    fetch(`/api/instagram-embed?url=${postUrl}`)
      .then(res => res.json())
      .then(data => setEmbedHtml(data.html))
  }, [postUrl])
  
  return <div dangerouslySetInnerHTML={{ __html: embedHtml }} />
}
```

**MCP for Development:**
- Use Claude Desktop for local development
- Configure Supabase MCP for database access
- Add GitHub MCP for version control
- Use Vercel MCP for deployments

Would you like me to:
1. **Implement Instagram oEmbed** for Urban Manual
2. **Set up MCP servers** for your development workflow
3. **Create a custom MCP server** for Urban Manual-specific tools

