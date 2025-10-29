# n8n Workflows + VM-Based MCP Setup Guide

**Date:** October 26, 2025
**For:** Urban Manual Automation & Remote MCP

## Table of Contents
1. [n8n Workflows that Replicate MCP](#part-1-n8n-workflows)
2. [VM-Based MCP Setup](#part-2-vm-based-mcp-setup)
3. [Hybrid Approach](#part-3-hybrid-approach)

---

# Part 1: n8n Workflows that Replicate MCP

## Overview

n8n can replicate MCP functionality through workflows that connect Claude AI with various services. Here's how to build them.

---

## Setup 1: Install n8n

### Option A: Local Installation (Quick Start)

```bash
# Install n8n globally
npm install -g n8n

# Start n8n
n8n start

# Access at: http://localhost:5678
```

### Option B: Docker (Recommended for Production)

```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-password
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
EOF

# Start n8n
docker-compose up -d

# Access at: http://localhost:5678
```

### Option C: n8n Cloud (Easiest)

1. Go to: https://n8n.io/cloud
2. Sign up for free tier
3. No installation needed
4. Access from anywhere

---

## Setup 2: Configure Claude AI in n8n

### Step 1: Get Anthropic API Key

1. Go to: https://console.anthropic.com/
2. Create API key
3. Copy the key (starts with `sk-ant-`)

### Step 2: Add Credentials in n8n

1. Open n8n
2. Go to **Settings** → **Credentials**
3. Click **Add Credential**
4. Search for "Anthropic"
5. Add your API key
6. Save

---

## Workflow 1: Database Query + Claude Analysis

**Replicates:** Supabase MCP functionality

### What it does:
- Queries Supabase database
- Sends data to Claude for analysis
- Returns insights

### Workflow Structure:
```
Schedule Trigger → Supabase Query → Claude AI → Format → Email/Slack
```

### Step-by-Step Setup:

#### 1. Add Schedule Trigger Node
```json
{
  "rule": {
    "interval": [
      {
        "field": "hours",
        "hoursInterval": 24
      }
    ]
  },
  "triggerAtHour": 9
}
```

#### 2. Add Supabase Node
```json
{
  "operation": "Get All",
  "table": "destinations",
  "returnAll": false,
  "limit": 100,
  "filters": {
    "conditions": [
      {
        "column": "rating",
        "operator": "gt",
        "value": 4.5
      }
    ]
  }
}
```

#### 3. Add Claude AI Node
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "prompt": "Analyze these top-rated destinations and provide insights:\n\n{{ $json.data }}\n\nProvide:\n1. Trends in highly-rated destinations\n2. Common characteristics\n3. Recommendations for improvement",
  "maxTokens": 2000
}
```

#### 4. Add Email/Slack Node
```json
{
  "subject": "Daily Destination Insights",
  "body": "{{ $json.response }}"
}
```

### Complete Workflow JSON:

```json
{
  "name": "Daily Destination Analysis",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{"field": "hours", "hoursInterval": 24}]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "Get All",
        "table": "destinations",
        "returnAll": false,
        "limit": 100
      },
      "name": "Supabase",
      "type": "n8n-nodes-base.supabase",
      "credentials": {
        "supabaseApi": "Supabase Account"
      },
      "position": [450, 300]
    },
    {
      "parameters": {
        "model": "claude-3-5-sonnet-20241022",
        "prompt": "=Analyze these destinations:\n\n{{ $json }}",
        "maxTokens": 2000
      },
      "name": "Claude AI",
      "type": "@n8n/n8n-nodes-langchain.lmChatAnthropic",
      "credentials": {
        "anthropicApi": "Anthropic"
      },
      "position": [650, 300]
    },
    {
      "parameters": {
        "subject": "Daily Insights",
        "message": "={{ $json.response }}"
      },
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "position": [850, 300]
    }
  ],
  "connections": {
    "Schedule Trigger": {"main": [[{"node": "Supabase", "type": "main", "index": 0}]]},
    "Supabase": {"main": [[{"node": "Claude AI", "type": "main", "index": 0}]]},
    "Claude AI": {"main": [[{"node": "Send Email", "type": "main", "index": 0}]]}
  }
}
```

---

## Workflow 2: Content Enrichment Pipeline

**Replicates:** OpenAI + Google Places MCP functionality

### What it does:
- Fetches destinations without enriched data
- Calls Google Places API
- Uses Claude to analyze and summarize
- Updates database

### Workflow Structure:
```
Schedule → Get Unenriched Destinations → Loop:
  → Google Places API
  → Claude Analysis
  → Update Supabase
```

### Step-by-Step:

#### 1. Get Unenriched Destinations
```json
{
  "operation": "Get All",
  "table": "destinations",
  "filters": {
    "conditions": [
      {
        "column": "google_place_id",
        "operator": "is",
        "value": "null"
      }
    ]
  },
  "limit": 10
}
```

#### 2. Loop Through Destinations
```json
{
  "batchSize": 1,
  "options": {}
}
```

#### 3. Google Places API
```json
{
  "method": "GET",
  "url": "=https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input={{ $json.name }} {{ $json.city }}&inputtype=textquery&fields=place_id,name,rating,formatted_address&key={{ $credentials.googlePlacesApi.apiKey }}"
}
```

#### 4. Claude Analysis
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "prompt": "=Based on this destination data:\n\nName: {{ $json.name }}\nCity: {{ $json.city }}\nDescription: {{ $json.content }}\n\nExtract:\n1. Vibe tags (cozy, modern, etc.)\n2. Keywords for search\n3. 2-sentence summary\n\nReturn as JSON.",
  "maxTokens": 500
}
```

#### 5. Update Supabase
```json
{
  "operation": "Update",
  "table": "destinations",
  "updateKey": "slug",
  "columns": {
    "google_place_id": "={{ $json.place_id }}",
    "vibe_tags": "={{ $json.vibe_tags }}",
    "keywords": "={{ $json.keywords }}",
    "ai_summary": "={{ $json.summary }}"
  }
}
```

---

## Workflow 3: GitHub Integration

**Replicates:** GitHub MCP functionality

### What it does:
- Monitors GitHub issues
- Uses Claude to categorize and prioritize
- Updates labels automatically

### Workflow Structure:
```
Webhook (GitHub) → Claude Analysis → Update GitHub Issue
```

### Setup:

#### 1. GitHub Webhook Trigger
```json
{
  "httpMethod": "POST",
  "path": "github-webhook",
  "responseMode": "onReceived"
}
```

#### 2. Filter for New Issues
```json
{
  "conditions": {
    "string": [
      {
        "value1": "={{ $json.body.action }}",
        "operation": "equals",
        "value2": "opened"
      }
    ]
  }
}
```

#### 3. Claude Categorization
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "prompt": "=Categorize this GitHub issue:\n\nTitle: {{ $json.body.issue.title }}\nBody: {{ $json.body.issue.body }}\n\nReturn JSON with:\n- category: bug/feature/enhancement\n- priority: low/medium/high\n- labels: array of relevant labels",
  "maxTokens": 200
}
```

#### 4. Update GitHub Issue
```json
{
  "resource": "issue",
  "operation": "update",
  "owner": "={{ $json.body.repository.owner.login }}",
  "repository": "={{ $json.body.repository.name }}",
  "issueNumber": "={{ $json.body.issue.number }}",
  "labels": "={{ $json.labels }}"
}
```

---

## Workflow 4: File System Operations

**Replicates:** Filesystem MCP functionality

### What it does:
- Monitors file changes
- Uses Claude to analyze code
- Generates documentation

### Workflow Structure:
```
File Trigger → Read File → Claude Analysis → Write Documentation
```

### Setup:

#### 1. File Trigger (Local n8n)
```json
{
  "path": "/path/to/urban-manual/components",
  "event": "add"
}
```

#### 2. Read File
```json
{
  "operation": "read",
  "filePath": "={{ $json.path }}",
  "encoding": "utf8"
}
```

#### 3. Claude Documentation
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "prompt": "=Generate documentation for this React component:\n\n{{ $json.content }}\n\nInclude:\n- Purpose\n- Props\n- Usage example\n- Notes",
  "maxTokens": 1000
}
```

#### 4. Write Documentation
```json
{
  "operation": "write",
  "filePath": "={{ $json.path.replace('.tsx', '.md') }}",
  "content": "={{ $json.documentation }}"
}
```

---

# Part 2: VM-Based MCP Setup

## Overview

Running MCP servers on a VM allows remote access and always-on availability.

---

## Option 1: Deploy MCP Server on VPS

### Step 1: Choose a VPS Provider

**Recommended:**
- **DigitalOcean** - $6/month (1GB RAM)
- **Linode** - $5/month (1GB RAM)
- **Hetzner** - €4/month (2GB RAM)
- **AWS EC2** - Free tier (1 year)
- **Google Cloud** - $300 credit

### Step 2: Create Ubuntu Server

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Create MCP user
useradd -m -s /bin/bash mcpuser
su - mcpuser
```

### Step 3: Install MCP Servers

```bash
# Create MCP directory
mkdir -p ~/mcp-servers
cd ~/mcp-servers

# Install MCP servers
npm init -y
npm install @modelcontextprotocol/server-filesystem
npm install @modelcontextprotocol/server-postgres
npm install @modelcontextprotocol/server-github
```

### Step 4: Create MCP Server Wrapper

Create `~/mcp-servers/server.js`:

```javascript
#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create MCP server
const server = new Server(
  {
    name: 'urban-manual-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'query_destinations',
        description: 'Query destinations from database',
        inputSchema: {
          type: 'object',
          properties: {
            city: { type: 'string' },
            category: { type: 'string' },
            limit: { type: 'number', default: 10 }
          }
        }
      },
      {
        name: 'update_destination',
        description: 'Update destination data',
        inputSchema: {
          type: 'object',
          properties: {
            slug: { type: 'string', required: true },
            data: { type: 'object', required: true }
          }
        }
      }
    ]
  };
});

// Implement tools
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'query_destinations') {
    let query = supabase.from('destinations').select('*');
    
    if (args.city) {
      query = query.eq('city', args.city);
    }
    if (args.category) {
      query = query.eq('category', args.category);
    }
    
    const { data, error } = await query.limit(args.limit || 10);
    
    if (error) throw error;
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }
  
  if (name === 'update_destination') {
    const { data, error } = await supabase
      .from('destinations')
      .update(args.data)
      .eq('slug', args.slug)
      .select();
    
    if (error) throw error;
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Urban Manual MCP Server running on stdio');
}

main().catch(console.error);
```

### Step 5: Create Environment File

Create `~/mcp-servers/.env`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GITHUB_TOKEN=your-github-token
```

### Step 6: Start with PM2

```bash
# Start MCP server
pm2 start server.js --name urban-manual-mcp

# Save PM2 config
pm2 save

# Setup auto-start on reboot
pm2 startup

# Check status
pm2 status
```

---

## Option 2: Remote MCP via SSH Tunnel

### On Your VPS:

```bash
# Install MCP server (as above)
cd ~/mcp-servers
npm install @modelcontextprotocol/server-supabase
```

### On Your Local Machine (Claude Desktop):

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "remote-supabase": {
      "command": "ssh",
      "args": [
        "mcpuser@your-vps-ip",
        "cd ~/mcp-servers && npx @modelcontextprotocol/server-supabase"
      ],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-key"
      }
    }
  }
}
```

**Setup SSH key authentication:**
```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519

# Copy to VPS
ssh-copy-id mcpuser@your-vps-ip

# Test connection
ssh mcpuser@your-vps-ip
```

---

## Option 3: MCP Server via HTTP (Remote Access)

### Create HTTP Wrapper

Create `~/mcp-servers/http-server.js`:

```javascript
const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

// MCP endpoint
app.post('/mcp', async (req, res) => {
  const { tool, arguments: args } = req.body;
  
  // Call MCP server via stdio
  const command = `echo '${JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: { name: tool, arguments: args },
    id: 1
  })}' | node server.js`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    try {
      const response = JSON.parse(stdout);
      res.json(response);
    } catch (e) {
      res.status(500).json({ error: 'Invalid response' });
    }
  });
});

app.listen(3000, () => {
  console.log('MCP HTTP server running on port 3000');
});
```

### Install and Start:

```bash
npm install express

# Start with PM2
pm2 start http-server.js --name mcp-http

# Setup nginx reverse proxy (optional)
apt install nginx

# Configure nginx
cat > /etc/nginx/sites-available/mcp << 'EOF'
server {
    listen 80;
    server_name mcp.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/mcp /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Use from n8n:

```json
{
  "method": "POST",
  "url": "http://mcp.yourdomain.com/mcp",
  "body": {
    "tool": "query_destinations",
    "arguments": {
      "city": "London",
      "limit": 10
    }
  }
}
```

---

# Part 3: Hybrid Approach

## Best of Both Worlds

### Architecture:

```
┌──────────────────┐
│  Claude Desktop  │ ← Local development
│   (Local MCP)    │
└────────┬─────────┘
         │
         ├──► Local files
         ├──► Local database
         │
         └──► SSH Tunnel ──► VPS MCP Server ──► Production DB
                                    │
                                    └──► n8n Workflows
```

### Setup:

**1. Local Development (Claude Desktop)**
- File system access
- Local database
- Quick iterations

**2. Remote MCP (VPS)**
- Production database access
- Always-on availability
- Shared team access

**3. n8n Automation (Cloud/VPS)**
- Scheduled tasks
- Workflow automation
- Multi-service integration

---

## Summary

### n8n Workflows:
- ✅ Replicate MCP functionality
- ✅ Visual workflow builder
- ✅ 525+ integrations
- ✅ Scheduled automation

### VM-Based MCP:
- ✅ Remote access
- ✅ Always-on availability
- ✅ Team sharing
- ✅ Production-ready

### Recommended Setup for Urban Manual:

**Local Development:**
```
Claude Desktop + Local MCP
  ↓
  File system, GitHub, local testing
```

**Production:**
```
VPS MCP Server
  ↓
  Supabase, production database
  ↓
  n8n workflows for automation
```

**Automation:**
```
n8n Cloud/Self-hosted
  ↓
  Scheduled enrichment, reports, monitoring
```

---

## Next Steps

Would you like me to:
1. **Set up specific n8n workflows** for Urban Manual?
2. **Deploy MCP server to a VPS** for you?
3. **Create custom MCP tools** for Urban Manual?
4. **Build a complete automation pipeline**?

Let me know which direction you'd like to explore!

