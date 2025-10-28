# Builder.io Setup Guide for Soft Union Component

This guide shows you how to edit the Soft Union component visually using Builder.io's drag-and-drop editor.

---

## **Prerequisites**

- Node.js 12.22.0 or later
- A Builder.io account (free tier available at [builder.io](https://www.builder.io))

---

## **Setup Commands**

### **1. Install Builder.io Dependency**

```bash
npm install @builder.io/react
```

Or with pnpm:

```bash
pnpm add @builder.io/react
```

### **2. Start Development Server**

```bash
npm run dev
```

Or with pnpm:

```bash
pnpm dev
```

Your app will be available at **http://localhost:3000**

---

## **Integration Steps**

### **Step 1: Get Your Builder.io API Key**

1. Sign up or log in to [Builder.io](https://www.builder.io)
2. Press **Cmd/Ctrl + K** to open the Command Palette
3. Type "API" and click to copy your **Public API Key**

Alternatively:
- Go to **Account Settings**
- Copy the **Public API Key**

### **Step 2: Configure Builder in Your Next.js App**

Create or modify `app/builder/[...page]/page.tsx`:

```typescript
import { builder, BuilderComponent } from '@builder.io/react';
import { notFound } from 'next/navigation';

// Initialize Builder with your API key
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

interface PageProps {
  params: {
    page: string[];
  };
}

export default async function Page({ params }: PageProps) {
  const urlPath = '/' + (params?.page?.join('/') || '');
  
  const content = await builder
    .get('page', {
      userAttributes: {
        urlPath,
      },
    })
    .promise();

  if (!content) {
    return notFound();
  }

  return <BuilderComponent model="page" content={content} />;
}

export async function generateStaticParams() {
  const pages = await builder.getAll('page', {
    options: { noTargeting: true },
  });

  return pages.map((page) => ({
    page: page.data?.url?.split('/').filter(Boolean) || [],
  }));
}
```

### **Step 3: Add API Key to Environment Variables**

Create or update `.env.local`:

```bash
NEXT_PUBLIC_BUILDER_API_KEY=your_api_key_here
```

### **Step 4: Register the Soft Union Component**

Create `components/soft-union/builder-registry.tsx`:

```typescript
'use client';

import { Builder } from '@builder.io/react';
import SoftUnion from './SoftUnion';

// Register the component
Builder.registerComponent(SoftUnion, {
  name: 'SoftUnion',
  inputs: [
    {
      name: 'featuredArticles',
      type: 'list',
      subFields: [
        { name: 'title', type: 'string' },
        { name: 'author', type: 'string' },
        { name: 'category', type: 'string', enum: ['poetry', 'fiction', 'review'] },
        { name: 'image', type: 'file' },
      ],
    },
    {
      name: 'heroTitle',
      type: 'string',
      defaultValue: 'Today\nReview\nFranz Kafka\nMisguided Friendship: On Early Reviews',
    },
    {
      name: 'heroImage',
      type: 'file',
    },
  ],
});
```

Then import this in your root layout or a client component:

```typescript
// app/layout.tsx
import './components/soft-union/builder-registry';
```

### **Step 5: Configure Preview URL in Builder.io**

1. Go to [Models](https://builder.io/models) in Builder.io
2. Select the **Page** model
3. Set **Preview URL** to: `http://localhost:3000`
4. Make sure to include `http://` (not `https://`)

---

## **Development Workflow**

### **Start Editing:**

1. **Start your dev server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. **Open Builder.io** in your browser

3. **Create a new page:**
   - Click **Content** → **+ New** → **Page**
   - Name it (e.g., "home")
   - Set URL to `/` for homepage
   - Choose blank template

4. **Add the Soft Union component:**
   - In the visual editor, click **+ Insert**
   - Find **SoftUnion** in the component list
   - Drag it onto the canvas

5. **Edit visually:**
   - Click on any element to edit
   - Change text, images, colors
   - Rearrange sections
   - Add new components

6. **Publish:**
   - Click **Publish** when ready
   - View at `http://localhost:3000`

---

## **Making Components Editable**

To make specific parts of the Soft Union component editable in Builder:

### **Example: Editable Hero Section**

```typescript
import { Builder } from '@builder.io/react';

Builder.registerComponent(HeroSection, {
  name: 'Hero Section',
  inputs: [
    {
      name: 'title',
      type: 'longText',
      defaultValue: 'Today\nReview\nFranz Kafka',
    },
    {
      name: 'image',
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'],
    },
    {
      name: 'opacity',
      type: 'number',
      defaultValue: 0.8,
      min: 0,
      max: 1,
      step: 0.1,
    },
  ],
});
```

### **Example: Editable Article Grid**

```typescript
Builder.registerComponent(ArticleGrid, {
  name: 'Article Grid',
  inputs: [
    {
      name: 'articles',
      type: 'list',
      defaultValue: [],
      subFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'author', type: 'string', required: true },
        { name: 'category', type: 'string', enum: ['Poetry', 'Fiction', 'Review'] },
        { name: 'image', type: 'file', required: true },
        { name: 'excerpt', type: 'longText' },
      ],
    },
    {
      name: 'columns',
      type: 'number',
      defaultValue: 4,
      enum: [1, 2, 3, 4],
    },
  ],
});
```

---

## **Troubleshooting**

### **404 Error on localhost:3000**

- ✅ Make sure you've published your page in Builder
- ✅ Check the URL matches (Builder auto-adds hyphens)
- ✅ Verify dev server is running (`npm run dev`)
- ✅ Check browser allows insecure content (http://)
- ✅ Restart dev server

### **Component Not Showing in Builder**

- ✅ Make sure you imported `builder-registry.tsx`
- ✅ Check API key is correct in `.env.local`
- ✅ Verify `builder.init()` is called
- ✅ Clear browser cache and reload

### **Images Not Loading**

- ✅ Use Next.js Image component with proper configuration
- ✅ Add Builder.io domain to `next.config.js`:

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.builder.io'],
  },
};
```

### **Preview Not Updating**

- ✅ Hard refresh browser (Cmd/Ctrl + Shift + R)
- ✅ Check Preview URL is set to `http://localhost:3000`
- ✅ Make sure dev server is running
- ✅ Try incognito/private browsing mode

---

## **Production Deployment**

### **Update Preview URL for Production**

1. Go to **Models** → **Page** in Builder.io
2. Change **Preview URL** to your production URL:
   - `https://yourdomain.com`
   - Or Vercel preview: `https://your-app.vercel.app`

### **Environment Variables**

Make sure to add your Builder API key to your hosting platform:

**Vercel:**
```bash
vercel env add NEXT_PUBLIC_BUILDER_API_KEY
```

**Netlify:**
- Go to Site Settings → Environment Variables
- Add `NEXT_PUBLIC_BUILDER_API_KEY`

---

## **Advanced Features**

### **Custom Sections**

Break down the Soft Union component into smaller, reusable sections:

```typescript
// Register individual sections
Builder.registerComponent(HeroSection, { name: 'Hero' });
Builder.registerComponent(ArticleGrid, { name: 'Article Grid' });
Builder.registerComponent(DonationSection, { name: 'Donation CTA' });
Builder.registerComponent(NewsletterSection, { name: 'Newsletter' });
```

### **Dynamic Data**

Fetch data from your API or CMS:

```typescript
export default async function Page({ params }: PageProps) {
  // Fetch from your API
  const articles = await fetch('https://api.example.com/articles').then(r => r.json());
  
  const content = await builder.get('page', {
    userAttributes: { urlPath: '/' + params.page.join('/') },
  }).promise();

  return (
    <BuilderComponent 
      model="page" 
      content={content}
      data={{ articles }} // Pass to Builder
    />
  );
}
```

### **A/B Testing**

Builder.io includes built-in A/B testing:

1. In the visual editor, click **A/B Test**
2. Create variants
3. Set traffic allocation
4. Publish and track results

---

## **Quick Reference**

### **Essential Commands**

```bash
# Install Builder.io
npm install @builder.io/react

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### **Key URLs**

- **Local dev:** http://localhost:3000
- **Builder.io dashboard:** https://builder.io
- **Models:** https://builder.io/models
- **Content:** https://builder.io/content
- **Account settings:** https://builder.io/account/organization

### **Keyboard Shortcuts in Builder**

- **Cmd/Ctrl + K:** Command Palette
- **Cmd/Ctrl + Z:** Undo
- **Cmd/Ctrl + Shift + Z:** Redo
- **Delete:** Delete selected element
- **Cmd/Ctrl + D:** Duplicate element

---

## **Resources**

- [Builder.io Documentation](https://www.builder.io/c/docs)
- [Next.js Integration Guide](https://www.builder.io/c/docs/integrating-builder-pages)
- [Component Registration](https://www.builder.io/c/docs/custom-components-intro)
- [Builder.io Forum](https://forum.builder.io)

---

## **Support**

If you run into issues:

1. Check the [troubleshooting section](#troubleshooting) above
2. Visit the [Builder.io Forum](https://forum.builder.io)
3. Read the [official docs](https://www.builder.io/c/docs)
4. Contact Builder.io support

---

**You're all set!** 🎉

Start your dev server with `npm run dev` and open Builder.io to start editing visually!

