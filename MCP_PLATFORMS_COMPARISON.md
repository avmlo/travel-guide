# MCP Across Different Platforms: Complete Comparison

**Date:** October 26, 2025

## Quick Answer

| Platform | MCP Support | Type | Notes |
|----------|-------------|------|-------|
| **Claude Desktop** | ✅ Full | Native | Direct MCP integration |
| **Claude Code** | ✅ Full | Native | Built-in MCP support |
| **Claude Web (claude.ai)** | ❌ None | N/A | Security limitations |
| **Manus (this platform)** | ✅ Full | Pre-configured | Via `manus-mcp-cli` |
| **n8n** | ✅ Partial | Via nodes | Different approach |
| **Claude API** | ✅ Custom | DIY | Build your own |

---

## Detailed Breakdown

### 1. Claude Desktop - ✅ Full Native MCP

**How it works:**
- Direct MCP protocol support
- Local MCP servers run on your machine
- Configuration via JSON file
- Automatic connection on startup

**What you get:**
- File system access
- Database connections
- GitHub integration
- Web search
- Browser automation
- Custom tools

**Setup:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    }
  }
}
```

**Pros:**
- ✅ Full MCP protocol support
- ✅ Easy configuration
- ✅ Automatic tool discovery
- ✅ Secure local execution

**Cons:**
- ❌ Requires desktop app
- ❌ Local machine only
- ❌ Manual configuration

---

### 2. Claude Code - ✅ Full Native MCP

**How it works:**
- Same as Claude Desktop
- Built-in IDE environment
- Terminal access
- Git integration

**What you get:**
- Everything Claude Desktop has
- Plus: Code editing features
- Plus: Terminal integration
- Plus: Git operations

**Setup:**
- Same JSON configuration
- UI-based setup available
- More developer-focused

**Pros:**
- ✅ Full MCP support
- ✅ IDE features
- ✅ Terminal access
- ✅ Better for coding

**Cons:**
- ❌ Desktop app required
- ❌ Learning curve

---

### 3. Claude Web (claude.ai) - ❌ No MCP

**Why not:**
- Security: Can't access local files
- Architecture: Browser sandbox
- Isolation: No local processes

**What you CAN do:**
- Upload files manually
- Use artifacts
- Code generation
- Analysis tools

**What you CANNOT do:**
- ❌ Connect to databases
- ❌ Access file system
- ❌ Run local tools
- ❌ GitHub integration

**Workarounds:**
- Use Claude API instead
- Build custom integrations
- Use Zapier/Make.com
- Use n8n workflows

---

### 4. Manus (This Platform) - ✅ Full Pre-configured MCP

**How it works:**
- MCP servers pre-installed
- Access via `manus-mcp-cli`
- OAuth authentication
- Sandbox environment

**Available MCP servers:**
1. Cloudflare
2. Webflow
3. Supabase
4. Neon
5. Notion
6. Vercel
7. Firecrawl

**Usage:**
```bash
# List tools
manus-mcp-cli tool list --server supabase

# Call tool
manus-mcp-cli tool call query_database --server supabase --input '{"query":"SELECT * FROM destinations LIMIT 5"}'
```

**Pros:**
- ✅ Pre-configured
- ✅ No setup needed
- ✅ OAuth handled
- ✅ Multiple servers

**Cons:**
- ❌ Limited to available servers
- ❌ Can't add custom servers
- ❌ Sandbox only

---

### 5. n8n - ✅ Partial MCP Support (Different Approach)

**How it works:**
n8n doesn't use MCP the same way Claude Desktop does. Instead:

1. **Claude AI Node** - Call Claude API
2. **MCP Node** - Connect to MCP servers
3. **Workflow Automation** - Chain tools together

**Architecture:**
```
┌─────────────┐
│   n8n       │
│  Workflow   │
└──────┬──────┘
       │
       ├──► Claude AI Node (API call)
       │
       ├──► MCP Node (connects to MCP server)
       │
       └──► Other nodes (HTTP, DB, etc.)
```

**What you can do:**

#### Option A: Use Claude AI Node
```
Trigger → Claude AI Node → Process Response → Action
```

**Example workflow:**
1. Webhook receives data
2. Claude AI node analyzes it
3. Store result in database
4. Send notification

#### Option B: Use MCP Node (New!)
```
Trigger → MCP Node → Claude AI Node → Action
```

**Example workflow:**
1. Schedule trigger
2. MCP node queries database
3. Claude analyzes data
4. Send report via email

#### Option C: Build Custom MCP Server for n8n
```javascript
// n8n can call your custom MCP server
const mcpServer = {
  name: "urban-manual",
  tools: [
    {
      name: "get_destinations",
      description: "Get destinations from database",
      inputSchema: { type: "object", properties: {} }
    }
  ]
}
```

**Pros:**
- ✅ Visual workflow builder
- ✅ 525+ integrations
- ✅ Can use Claude API
- ✅ Can connect to MCP servers
- ✅ Self-hosted option

**Cons:**
- ❌ Not native MCP like Claude Desktop
- ❌ Requires workflow setup
- ❌ More complex for simple tasks
- ❌ Need to understand n8n

**When to use n8n:**
- Automating repetitive tasks
- Connecting multiple services
- Scheduled workflows
- Complex integrations
- Team collaboration

**When NOT to use n8n:**
- Quick one-off tasks
- Simple conversations
- Local file operations
- Interactive development

---

### 6. Claude API - ✅ Custom MCP Implementation

**How it works:**
Build your own MCP integration using Claude API.

**Example:**
```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

// Define tools (like MCP)
const tools = [
  {
    name: "get_destinations",
    description: "Get destinations from database",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string" }
      }
    }
  }
]

// Call Claude with tools
const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  tools: tools,
  messages: [
    { role: "user", content: "Show me destinations in London" }
  ]
})

// Handle tool calls
if (response.stop_reason === "tool_use") {
  const toolUse = response.content.find(c => c.type === "tool_use")
  
  // Execute your tool
  const result = await getDestinations(toolUse.input.city)
  
  // Send result back to Claude
  const finalResponse = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      { role: "user", content: "Show me destinations in London" },
      { role: "assistant", content: response.content },
      { 
        role: "user", 
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: JSON.stringify(result)
          }
        ]
      }
    ]
  })
}
```

**Pros:**
- ✅ Full control
- ✅ Custom tools
- ✅ Any platform
- ✅ Programmatic

**Cons:**
- ❌ Requires coding
- ❌ More complex
- ❌ Manual tool management
- ❌ API costs

---

## Comparison Table

| Feature | Claude Desktop | Claude Code | Claude Web | Manus | n8n | Claude API |
|---------|----------------|-------------|------------|-------|-----|------------|
| **MCP Protocol** | ✅ Native | ✅ Native | ❌ No | ✅ CLI | ⚠️ Via nodes | ✅ DIY |
| **Local Files** | ✅ Yes | ✅ Yes | ❌ No | ✅ Sandbox | ✅ Yes | ✅ Custom |
| **Database** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes | ✅ Custom |
| **GitHub** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ✅ Yes | ✅ Custom |
| **Web Search** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ✅ Yes | ✅ Custom |
| **Custom Tools** | ✅ Yes | ✅ Yes | ❌ No | ❌ Limited | ✅ Yes | ✅ Yes |
| **Setup Difficulty** | Easy | Easy | N/A | None | Medium | Hard |
| **Cost** | Free | Free | Free | Free | Free/Paid | API costs |
| **Best For** | Personal use | Development | Chat | Sandboxed tasks | Automation | Production apps |

---

## Real-World Use Cases

### Use Claude Desktop When:
- ✅ Working on local projects
- ✅ Need file system access
- ✅ Want quick database queries
- ✅ Personal development

### Use Claude Code When:
- ✅ Building applications
- ✅ Need IDE features
- ✅ Git integration required
- ✅ Terminal access needed

### Use Claude Web When:
- ✅ Quick conversations
- ✅ No local access needed
- ✅ Mobile/tablet usage
- ✅ Shared computers

### Use Manus When:
- ✅ Need pre-configured integrations
- ✅ OAuth authentication required
- ✅ Sandbox environment preferred
- ✅ Multiple service access

### Use n8n When:
- ✅ Automating workflows
- ✅ Connecting multiple services
- ✅ Scheduled tasks
- ✅ Team collaboration
- ✅ Complex integrations

### Use Claude API When:
- ✅ Building production apps
- ✅ Custom integrations
- ✅ Programmatic access
- ✅ Full control needed

---

## n8n Specific: How to Use with Claude

### Method 1: Claude AI Node (Simple)

**Workflow:**
```
Webhook → Claude AI → Database → Email
```

**Use case:** Analyze incoming data with Claude

**Setup:**
1. Add "Claude AI" node
2. Configure API key
3. Write prompt
4. Process response

### Method 2: MCP Node (Advanced)

**Workflow:**
```
Schedule → MCP Node → Claude AI → Slack
```

**Use case:** Query database, analyze with Claude, send report

**Setup:**
1. Install MCP node from community
2. Configure MCP server
3. Connect to Claude AI node
4. Chain actions

### Method 3: HTTP Request (Custom)

**Workflow:**
```
Trigger → HTTP (MCP Server) → Claude AI → Action
```

**Use case:** Call custom MCP server, use Claude for processing

**Setup:**
1. Deploy MCP server
2. Use HTTP Request node
3. Parse response
4. Send to Claude AI node

---

## Summary

### ✅ Full MCP Support:
- Claude Desktop
- Claude Code
- Manus (via CLI)

### ⚠️ Partial/Different MCP:
- n8n (via nodes, not native)
- Claude API (DIY implementation)

### ❌ No MCP:
- Claude Web (claude.ai)

---

## Recommendations for Urban Manual

**For Development:**
- Use **Claude Desktop** with MCP for local development
- Configure Supabase, GitHub, and filesystem servers
- Quick database queries and file operations

**For Automation:**
- Use **n8n** for scheduled tasks
- Automate destination enrichment
- Connect multiple services
- Build workflows

**For Production:**
- Use **Claude API** with custom tools
- Build MCP-like functionality
- Full control over integrations
- Scalable solution

**For Quick Tasks:**
- Use **Claude Web** for conversations
- Use **Manus** for pre-configured integrations
- No setup required

---

## Next Steps

Would you like me to help you:
1. **Set up n8n workflows** for Urban Manual automation?
2. **Build a custom MCP server** for Urban Manual?
3. **Create Claude API integration** with tool calling?
4. **Design automation workflows** using n8n + Claude?

Let me know which direction interests you most!

