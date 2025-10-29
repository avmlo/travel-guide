# Using Cursor with Urban Manual & GitHub Integration

**Date:** October 27, 2025
**Goal:** Understand how to use Cursor IDE for Urban Manual development and GitHub workflow

---

## What is Cursor?

**Cursor** is an AI-powered code editor (fork of VS Code) with:
- ✅ **AI code completion** - Like GitHub Copilot but better
- ✅ **AI chat** - Ask questions about your codebase
- ✅ **AI code editing** - "Change this component to use dark mode"
- ✅ **Codebase understanding** - AI knows your entire project
- ✅ **All VS Code features** - Extensions, Git, terminal, etc.

**Website:** https://cursor.sh

---

## Quick Answers

### **Can we run Urban Manual on Cursor?**
✅ **YES!** Cursor is perfect for Next.js projects like Urban Manual.

### **Does it commit directly to GitHub?**
✅ **YES!** Cursor has built-in Git/GitHub integration (same as VS Code).

---

## Part 1: Setting Up Cursor with Urban Manual

### **Step 1: Install Cursor** (2 minutes)

```bash
# Download from:
https://cursor.sh

# Or via Homebrew (Mac):
brew install --cask cursor

# Or via Chocolatey (Windows):
choco install cursor
```

### **Step 2: Open Urban Manual Project** (1 minute)

```bash
# Option 1: From terminal
cd /path/to/urban-manual
cursor .

# Option 2: From Cursor
File → Open Folder → Select urban-manual directory
```

### **Step 3: Install Extensions** (Optional)

Cursor automatically imports your VS Code extensions, but here are recommended ones:

```
Essential:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prisma (if you use Prisma)
- ESLint
- Prettier

Nice to have:
- GitLens (enhanced Git features)
- GitHub Copilot (if you have it)
- Error Lens
- Auto Rename Tag
```

### **Step 4: Configure Cursor AI** (2 minutes)

```bash
# 1. Sign in to Cursor
# 2. Choose AI model:
#    - GPT-4 (best, slower)
#    - GPT-3.5 (fast, good enough)
#    - Claude (alternative)

# 3. Enable features:
#    ✅ Copilot++ (better autocomplete)
#    ✅ Chat (Cmd+L or Ctrl+L)
#    ✅ Composer (Cmd+K or Ctrl+K)
```

---

## Part 2: GitHub Integration

### **Method 1: Built-in Git (Recommended)**

Cursor has the same Git integration as VS Code:

#### **Initial Setup:**

```bash
# 1. Check if Git is configured
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 2. Clone your repo (if not already)
git clone https://github.com/yourusername/urban-manual.git
cd urban-manual
```

#### **Daily Workflow in Cursor:**

**1. View Changes:**
- Click **Source Control** icon (left sidebar)
- Or press `Cmd+Shift+G` (Mac) / `Ctrl+Shift+G` (Windows)

**2. Stage Files:**
- Click **+** next to changed files
- Or stage all: Click **+** next to "Changes"

**3. Commit:**
```
1. Type commit message in text box
2. Press Cmd+Enter (Mac) or Ctrl+Enter (Windows)
3. Or click ✓ checkmark button
```

**4. Push to GitHub:**
```
1. Click "..." menu in Source Control
2. Select "Push"
3. Or use terminal: git push
```

**5. Pull from GitHub:**
```
1. Click "..." menu in Source Control
2. Select "Pull"
3. Or use terminal: git pull
```

---

### **Method 2: GitHub Extension**

For more GitHub features:

```bash
# 1. Install GitHub Pull Requests extension
# 2. Sign in to GitHub (Cmd+Shift+P → "GitHub: Sign In")
# 3. Now you can:
#    - Create PRs directly
#    - Review PRs
#    - Manage issues
```

---

### **Method 3: Terminal (Full Control)**

Cursor has an integrated terminal (same as VS Code):

```bash
# Open terminal: Cmd+` or Ctrl+`

# Standard Git workflow:
git status
git add .
git commit -m "feat: add visual explorer"
git push origin main

# Create branch:
git checkout -b feature/new-feature

# Push branch:
git push origin feature/new-feature
```

---

## Part 3: Cursor AI Features for Urban Manual

### **Feature 1: AI Chat (Cmd+L)**

Ask questions about your codebase:

```
You: "How does the destination filtering work?"
AI: [Explains the filtering logic in page.tsx]

You: "Where is the Supabase client configured?"
AI: [Shows you lib/supabase/client.ts]

You: "Find all components that use the Destination type"
AI: [Lists all files and shows usage]
```

### **Feature 2: AI Code Editing (Cmd+K)**

Select code and ask AI to modify it:

```
1. Select a component
2. Press Cmd+K
3. Type: "Add loading state and error handling"
4. AI generates the updated code
5. Accept or reject changes
```

**Example:**

```typescript
// Before (selected code):
export default function DestinationCard({ destination }) {
  return <div>{destination.name}</div>
}

// You: "Add TypeScript types and make it more styled"

// After (AI generated):
interface DestinationCardProps {
  destination: Destination;
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <div className="rounded-lg shadow-md p-4 hover:shadow-lg transition">
      <h3 className="text-lg font-semibold">{destination.name}</h3>
      <p className="text-gray-600">{destination.city}</p>
    </div>
  )
}
```

### **Feature 3: Copilot++ (Auto-completion)**

As you type, Cursor suggests entire functions:

```typescript
// You type:
async function fetchDestinations

// Cursor suggests:
async function fetchDestinations() {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}
```

### **Feature 4: Composer (Multi-file edits)**

Make changes across multiple files:

```
You: "Add dark mode support to the entire app"

AI: 
1. Updates tailwind.config.js
2. Adds dark mode toggle component
3. Updates layout.tsx
4. Modifies all components to support dark mode
```

---

## Part 4: Cursor + GitHub Workflow for Urban Manual

### **Recommended Workflow:**

#### **1. Start New Feature**

```bash
# In Cursor terminal:
git checkout -b feature/morphic-search
```

#### **2. Use AI to Build**

```
# Cmd+L (Chat):
"Help me integrate Morphic search into the homepage"

# AI will:
- Show you where to add code
- Generate components
- Explain integration steps
```

#### **3. Test Locally**

```bash
# In Cursor terminal:
npm run dev
```

#### **4. Review Changes**

```
# Source Control panel shows:
✓ Modified: app/page.tsx
✓ New: components/MorphicSearch.tsx
✓ Modified: package.json
```

#### **5. Commit with AI-Generated Message**

```
# Cursor can generate commit messages:
1. Stage files
2. Click "✨" icon in commit message box
3. AI suggests: "feat: integrate Morphic AI search"
4. Edit if needed
5. Commit
```

#### **6. Push to GitHub**

```bash
# In Source Control:
Click "..." → Push

# Or terminal:
git push origin feature/morphic-search
```

#### **7. Create Pull Request**

```
# Option 1: On GitHub.com
# Option 2: In Cursor with GitHub extension
Cmd+Shift+P → "GitHub Pull Requests: Create Pull Request"
```

---

## Part 5: Cursor vs Other IDEs

| Feature | Cursor | VS Code | Xcode | WebStorm |
|---------|--------|---------|-------|----------|
| **AI Chat** | ✅ Built-in | ❌ Need Copilot | ❌ No | ❌ No |
| **AI Editing** | ✅ Cmd+K | ❌ No | ❌ No | ❌ No |
| **Codebase Understanding** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Git Integration** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **GitHub Integration** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Next.js Support** | ✅ Excellent | ✅ Excellent | ❌ No | ✅ Good |
| **Swift/iOS** | ❌ No | ❌ No | ✅ Yes | ❌ No |
| **Price** | 💰 $20/mo | 💰 Free | 💰 Free | 💰 $69/mo |

---

## Part 6: Cursor for Urban Manual Development

### **Perfect For:**

✅ **Next.js development** - Excellent TypeScript/React support
✅ **Rapid prototyping** - AI helps you build faster
✅ **Refactoring** - AI can refactor entire files
✅ **Learning** - Ask AI to explain any code
✅ **Bug fixing** - AI can spot and fix bugs

### **Not For:**

❌ **iOS development** - Use Xcode for Swift
❌ **Heavy design work** - Use Figma
❌ **Database management** - Use Supabase dashboard

---

## Part 7: Cursor Pricing

### **Free Plan:**
- ✅ 2,000 completions/month
- ✅ 50 slow premium requests/month
- ✅ All features

### **Pro Plan ($20/month):**
- ✅ Unlimited completions
- ✅ 500 fast premium requests/month
- ✅ GPT-4 access
- ✅ Priority support

### **Business Plan ($40/user/month):**
- ✅ Everything in Pro
- ✅ Centralized billing
- ✅ Admin dashboard
- ✅ Usage analytics

**Recommendation:** Start with **Free**, upgrade to **Pro** if you use it daily.

---

## Part 8: Common Cursor Commands

### **AI Commands:**

| Command | Shortcut | Description |
|---------|----------|-------------|
| **Chat** | `Cmd+L` / `Ctrl+L` | Open AI chat |
| **Edit** | `Cmd+K` / `Ctrl+K` | AI edit selected code |
| **Composer** | `Cmd+Shift+I` | Multi-file AI editing |
| **Terminal** | `Cmd+J` / `Ctrl+J` | Toggle terminal |

### **Git Commands:**

| Command | Shortcut | Description |
|---------|----------|-------------|
| **Source Control** | `Cmd+Shift+G` | Open Git panel |
| **Commit** | `Cmd+Enter` | Commit staged changes |
| **View Changes** | Click file | See diff |
| **Discard Changes** | Right-click → Discard | Undo changes |

### **Navigation:**

| Command | Shortcut | Description |
|---------|----------|-------------|
| **File Search** | `Cmd+P` / `Ctrl+P` | Quick open file |
| **Symbol Search** | `Cmd+Shift+O` | Find function/component |
| **Global Search** | `Cmd+Shift+F` | Search in all files |
| **Go to Definition** | `F12` | Jump to definition |

---

## Part 9: Cursor + Urban Manual Example Workflow

### **Scenario: Add Gemini AI Search**

**Step 1: Ask AI for Plan**
```
You (Cmd+L): "How should I integrate Gemini AI search into Urban Manual?"

AI: 
1. Install @google/generative-ai
2. Create API service in lib/gemini.ts
3. Add search component
4. Update homepage
```

**Step 2: Let AI Write Code**
```
You (Cmd+K): "Create a Gemini API service"

AI generates: lib/gemini.ts with full implementation
```

**Step 3: Test**
```bash
# Terminal in Cursor:
npm run dev
```

**Step 4: Commit**
```
# Source Control panel:
1. Stage all files
2. Commit message: "feat: add Gemini AI search"
3. Push to GitHub
```

**Step 5: Deploy**
```bash
# Terminal:
git push origin main
# Vercel auto-deploys
```

**Total time: 15 minutes** (vs 2 hours manually)

---

## Part 10: Tips & Tricks

### **Tip 1: Use `.cursorrules` File**

Create `.cursorrules` in your project root:

```
# .cursorrules
You are helping with Urban Manual, a Next.js app for curated destinations.

Tech stack:
- Next.js 16
- TypeScript
- Tailwind CSS
- Supabase
- tRPC

Code style:
- Use TypeScript for everything
- Prefer server components
- Use Tailwind for styling
- Follow the existing component structure

When generating code:
- Add proper TypeScript types
- Include error handling
- Add loading states
- Follow the minimalist design aesthetic
```

Now AI will follow these rules automatically!

### **Tip 2: Use AI for Documentation**

```
You: "Document this component"

AI: Adds JSDoc comments with types and examples
```

### **Tip 3: Use AI for Tests**

```
You: "Write tests for this function"

AI: Generates Jest/Vitest tests
```

### **Tip 4: Use AI for Refactoring**

```
You: "Refactor this to use React Server Components"

AI: Converts client component to server component
```

---

## Summary

### **Yes, you can use Cursor for Urban Manual!**

✅ **Runs Next.js perfectly**
✅ **Built-in GitHub integration**
✅ **AI helps you code faster**
✅ **Same Git workflow as VS Code**
✅ **Commits directly to GitHub**

### **Workflow:**
1. Open project in Cursor
2. Use AI to build features
3. Test locally
4. Commit via Source Control panel
5. Push to GitHub
6. Vercel auto-deploys

### **For iOS Development:**
- Use **Xcode** for Swift (required)
- Use **Cursor** for backend/API work
- Can't use Cursor for iOS UI

---

## Next Steps

Would you like me to:
1. **Show you specific Cursor commands** for Urban Manual?
2. **Create a `.cursorrules` file** for your project?
3. **Demonstrate AI-powered refactoring** of existing code?
4. **Set up GitHub Actions** for automated testing?

Cursor will make your development much faster, especially with AI assistance!

