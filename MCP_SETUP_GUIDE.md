# Complete MCP Setup Guide for Claude Desktop

**Date:** October 26, 2025
**For:** Urban Manual Development Workflow

## Overview

This guide will walk you through setting up Model Context Protocol (MCP) servers in Claude Desktop, enabling Claude to directly interact with your databases, GitHub repositories, file systems, and more.

---

## Part 1: Install Claude Desktop

### Step 1: Download Claude Desktop

**macOS:**
1. Go to: https://claude.ai/download
2. Download the macOS version
3. Open the `.dmg` file
4. Drag Claude to Applications folder

**Windows:**
1. Go to: https://claude.ai/download
2. Download the Windows installer
3. Run the installer
4. Follow installation prompts

**Linux:**
1. Go to: https://claude.ai/download
2. Download the `.AppImage` or `.deb` file
3. Make executable: `chmod +x Claude-*.AppImage`
4. Run: `./Claude-*.AppImage`

### Step 2: Sign In

1. Open Claude Desktop
2. Sign in with your Anthropic account
3. Verify your email if prompted

---

## Part 2: Locate the MCP Configuration File

Claude Desktop uses a JSON configuration file to define MCP servers.

### Configuration File Locations:

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

### Step 3: Create/Edit Configuration File

If the file doesn't exist, create it:

**macOS/Linux:**
```bash
# Create directory if it doesn't exist
mkdir -p ~/Library/Application\ Support/Claude

# Create config file
touch ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Open in editor
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```powershell
# Create directory
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude"

# Create file
New-Item -ItemType File -Force -Path "$env:APPDATA\Claude\claude_desktop_config.json"

# Open in Notepad
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

---

## Part 3: Basic MCP Configuration

Start with this basic structure:

```json
{
  "mcpServers": {}
}
```

This is the foundation. We'll add servers inside `mcpServers`.

---

## Part 4: Add Essential MCP Servers for Urban Manual

### 4.1. File System Access

**What it does:** Allows Claude to read/write files on your computer.

**Configuration:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/urban-manual"
      ]
    }
  }
}
```

**Replace:**
- `/Users/yourname/urban-manual` with your actual project path
- Windows: `C:\\Users\\yourname\\urban-manual`

**What Claude can do:**
- Read files in your project
- Write new files
- Edit existing files
- List directories
- Search file contents

---

### 4.2. GitHub Integration

**What it does:** Allows Claude to interact with your GitHub repositories.

**Prerequisites:**
1. Create GitHub Personal Access Token:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `workflow`, `read:org`
   - Copy the token

**Configuration:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/urban-manual"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

**What Claude can do:**
- Create/update issues
- Create/update pull requests
- Search repositories
- Read file contents
- Create branches
- Manage commits

---

### 4.3. Supabase Database Access

**What it does:** Allows Claude to query and manage your Supabase database.

**Prerequisites:**
1. Get your Supabase credentials from `.env.local`
2. You need: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

**Configuration:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/urban-manual"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

**What Claude can do:**
- Query database tables
- Insert/update/delete records
- Create tables and columns
- Run SQL queries
- Manage database schema

---

### 4.4. PostgreSQL Direct Access (Alternative to Supabase)

**What it does:** Direct PostgreSQL database access.

**Prerequisites:**
1. Get your database connection string
2. Format: `postgresql://user:password@host:5432/database`

**Configuration:**
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"
      }
    }
  }
}
```

**What Claude can do:**
- Execute SQL queries
- Create/modify tables
- Manage indexes
- Run migrations
- Database administration

---

### 4.5. Web Search (Brave)

**What it does:** Allows Claude to search the web for current information.

**Prerequisites:**
1. Get Brave Search API key:
   - Go to: https://brave.com/search/api/
   - Sign up for free tier (2,000 queries/month)
   - Copy API key

**Configuration:**
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-brave-api-key"
      }
    }
  }
}
```

**What Claude can do:**
- Search the web
- Get current information
- Find documentation
- Research topics
- Verify facts

---

### 4.6. Browser Automation (Puppeteer)

**What it does:** Allows Claude to control a web browser.

**Configuration:**
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

**What Claude can do:**
- Navigate websites
- Take screenshots
- Fill forms
- Click buttons
- Scrape data
- Test web applications

---

### 4.7. Google Drive Integration

**What it does:** Access Google Drive files and folders.

**Prerequisites:**
1. Create Google Cloud Project
2. Enable Google Drive API
3. Create OAuth credentials
4. Download credentials JSON

**Configuration:**
```json
{
  "mcpServers": {
    "gdrive": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-gdrive"],
      "env": {
        "GDRIVE_CREDENTIALS_PATH": "/path/to/credentials.json"
      }
    }
  }
}
```

**What Claude can do:**
- Read/write Google Docs
- Access spreadsheets
- Upload/download files
- Manage folders
- Share documents

---

### 4.8. Slack Integration

**What it does:** Send messages and interact with Slack.

**Prerequisites:**
1. Create Slack App: https://api.slack.com/apps
2. Add Bot Token Scopes: `chat:write`, `channels:read`, `users:read`
3. Install app to workspace
4. Copy Bot User OAuth Token

**Configuration:**
```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token",
        "SLACK_TEAM_ID": "T1234567890"
      }
    }
  }
}
```

**What Claude can do:**
- Send messages to channels
- Read channel history
- Create channels
- Manage users
- Post notifications

---

## Part 5: Complete Configuration Example for Urban Manual

Here's a complete `claude_desktop_config.json` with all recommended servers:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/urban-manual"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxxx"
      }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-brave-api-key"
      }
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  },
  "globalShortcut": "Ctrl+Space"
}
```

---

## Part 6: Restart Claude Desktop

After editing the configuration:

1. **Quit Claude Desktop completely** (Cmd+Q on Mac, Alt+F4 on Windows)
2. **Reopen Claude Desktop**
3. MCP servers will initialize automatically

---

## Part 7: Verify MCP Servers are Working

### Check 1: Look for MCP Indicator

In Claude Desktop, you should see an MCP icon or indicator showing connected servers.

### Check 2: Test with a Prompt

Try asking Claude:

```
Can you list the files in my Urban Manual project?
```

If the filesystem server is working, Claude will list your project files.

```
Can you search GitHub for Next.js authentication examples?
```

If GitHub server is working, Claude will search and show results.

```
Can you query my Supabase database and show me the first 5 destinations?
```

If Supabase server is working, Claude will query and display results.

---

## Part 8: Troubleshooting

### Issue: "MCP server failed to start"

**Solution:**
1. Check that Node.js is installed: `node --version`
2. Check that npx is available: `npx --version`
3. Verify JSON syntax in config file (use JSONLint.com)
4. Check file paths are correct (no typos)

### Issue: "Permission denied"

**Solution:**
1. Check file permissions on config file
2. Ensure paths in filesystem server are accessible
3. Verify API tokens are valid

### Issue: "Server not responding"

**Solution:**
1. Restart Claude Desktop
2. Check internet connection
3. Verify API keys haven't expired
4. Check server logs in Claude Desktop console

### Issue: "Environment variables not working"

**Solution:**
1. Don't use quotes around values in `env` object
2. Use absolute paths, not relative
3. Restart Claude Desktop after changes

---

## Part 9: Advanced Configuration

### Multiple File System Paths

```json
{
  "mcpServers": {
    "urban-manual": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/urban-manual"
      ]
    },
    "documents": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/Documents"
      ]
    }
  }
}
```

### Custom MCP Server (Python)

```json
{
  "mcpServers": {
    "custom-server": {
      "command": "python",
      "args": ["/path/to/your/mcp_server.py"]
    }
  }
}
```

### Local MCP Server (Development)

```json
{
  "mcpServers": {
    "local-dev": {
      "command": "node",
      "args": ["/path/to/your/server/index.js"],
      "env": {
        "DEBUG": "true"
      }
    }
  }
}
```

---

## Part 10: Recommended Workflow for Urban Manual

### Daily Development Workflow

1. **Open Claude Desktop**
2. **Ask Claude to:**
   - "Show me the current state of the destinations table in Supabase"
   - "List all files in the components directory"
   - "Search GitHub for Next.js image optimization examples"
   - "Create a new GitHub issue for the bug I found"

3. **Use Claude for:**
   - Database queries and updates
   - File editing and creation
   - GitHub issue management
   - Web research
   - Code generation

### Example Prompts

**Database Management:**
```
Can you query my Supabase database and show me all destinations 
in London with a rating above 4.5?
```

**File Operations:**
```
Can you create a new React component called DestinationWeather.tsx 
in the components folder that fetches weather data?
```

**GitHub Integration:**
```
Can you create a GitHub issue titled "Add weather integration" 
with a detailed description of the feature?
```

**Web Research:**
```
Can you search for the latest best practices for Next.js 15 
image optimization?
```

---

## Part 11: Security Best Practices

### 1. Protect Your Config File

```bash
# macOS/Linux
chmod 600 ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### 2. Use Environment Variables (Alternative)

Instead of hardcoding tokens in config:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

Then set in your shell:
```bash
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"
```

### 3. Limit File System Access

Only grant access to specific directories:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/urban-manual",
        "--readonly"
      ]
    }
  }
}
```

### 4. Use Read-Only Database Credentials

For Supabase, use a read-only key when possible:

```json
{
  "mcpServers": {
    "supabase-readonly": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_ANON_KEY": "your-anon-key"
      }
    }
  }
}
```

---

## Part 12: Available MCP Servers

Here's a list of official and community MCP servers:

### Official Servers (@modelcontextprotocol)

- `server-filesystem` - File system access
- `server-github` - GitHub integration
- `server-gitlab` - GitLab integration
- `server-postgres` - PostgreSQL database
- `server-sqlite` - SQLite database
- `server-brave-search` - Web search
- `server-puppeteer` - Browser automation
- `server-gdrive` - Google Drive
- `server-slack` - Slack messaging
- `server-memory` - Persistent memory
- `server-fetch` - HTTP requests
- `server-sequential-thinking` - Extended reasoning

### Community Servers

- `@supabase/mcp-server-supabase` - Supabase integration
- `@cloudflare/mcp-server-cloudflare` - Cloudflare Workers
- `@vercel/mcp-server-vercel` - Vercel deployments
- `@anthropic/mcp-server-everything` - All-in-one server

---

## Summary

You now have:
- ✅ Claude Desktop installed
- ✅ MCP configuration file created
- ✅ Essential MCP servers configured
- ✅ File system access
- ✅ GitHub integration
- ✅ Database access
- ✅ Web search capability

### Next Steps:

1. **Test each server** with simple prompts
2. **Customize configuration** for your workflow
3. **Add more servers** as needed
4. **Integrate with Urban Manual** development

### Quick Start Commands:

**macOS - Edit config:**
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows - Edit config:**
```powershell
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

**Restart Claude Desktop:**
- macOS: Cmd+Q, then reopen
- Windows: Alt+F4, then reopen

---

Need help with:
1. **Specific MCP server setup?**
2. **Custom MCP server development?**
3. **Advanced configuration?**

Let me know!

