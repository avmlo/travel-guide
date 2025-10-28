# Soft Union - React Component

A pixel-perfect React/Next.js component based on the Figma design for a literary magazine website.

## Features

- ✅ Fully responsive design
- ✅ Next.js Image optimization
- ✅ Tailwind CSS styling
- ✅ Hover animations and transitions
- ✅ Clean, semantic HTML
- ✅ TypeScript support
- ✅ Production-ready code

## Installation

### 1. Copy the Component

Copy `SoftUnion.tsx` to your Next.js project:

```bash
cp SoftUnion.tsx your-project/components/
```

### 2. Copy Assets

Copy the `assets` folder to the same directory as the component:

```bash
cp -r assets your-project/components/assets/
```

### 3. Install Dependencies

Make sure you have the required dependencies:

```bash
npm install next react react-dom
# or
pnpm add next react react-dom
```

### 4. Configure Tailwind CSS

Add Inter font to your `app/layout.tsx`:

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

## Usage

### Basic Usage

```typescript
import SoftUnion from '@/components/SoftUnion';

export default function Page() {
  return <SoftUnion />;
}
```

### With Custom Data

The component is currently using static data. To make it dynamic, you can:

1. **Extract data to props:**

```typescript
interface Article {
  id: string;
  title: string;
  author: string;
  category: 'poetry' | 'fiction' | 'review';
  image: string;
}

interface SoftUnionProps {
  featuredArticles: Article[];
  popularPieces: Article[];
  allTimePieces: Article[];
}

export default function SoftUnion({ 
  featuredArticles, 
  popularPieces, 
  allTimePieces 
}: SoftUnionProps) {
  // Component logic
}
```

2. **Fetch from API:**

```typescript
// app/page.tsx
import SoftUnion from '@/components/SoftUnion';

async function getData() {
  const res = await fetch('https://api.example.com/articles');
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <SoftUnion {...data} />;
}
```

## Customization

### Colors

The component uses these main colors:

- Background: `#fcfcfa`
- Primary text: `#272727`
- Secondary text: `#979797`
- Accent: `#0036d5`

To customize, search and replace in `SoftUnion.tsx`.

### Typography

The component uses Inter font with these sizes:

- Hero text: `41px`
- Section titles: `26px`
- Body text: `14px`
- Small text: `12px`

### Layout

The component uses a max-width of `1920px` with `60px` horizontal padding.

To adjust:

```typescript
// Change max-width
className="max-w-[1920px]" → className="max-w-[1440px]"

// Change padding
className="px-[60px]" → className="px-8"
```

## Components Structure

```
SoftUnion
├── Header (Navigation)
├── Greeting Section
├── Hero Section (Featured article)
├── Featured Articles Grid (4 columns)
├── Publishing Info
├── Donation Section
├── Popular Pieces (2 columns)
│   ├── This Week's Most Read
│   └── All Time Most Read
├── Latest Issue Section
├── Shop Section (Products grid)
├── Newsletter Section
└── Footer
```

## Responsive Breakpoints

The component is responsive with these breakpoints:

- Desktop: 1920px (default)
- Tablet: 768px (grid becomes 2 columns)
- Mobile: 640px (grid becomes 1 column)

To customize breakpoints, update Tailwind classes:

```typescript
// Example: Change grid from 4 to 2 columns on tablet
className="grid grid-cols-4" 
→ 
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
```

## Performance Optimization

### Image Optimization

The component uses Next.js Image component for automatic optimization:

- Lazy loading
- Responsive images
- WebP format
- Blur placeholder (optional)

To add blur placeholder:

```typescript
<Image
  src={heroImage}
  alt="Hero"
  fill
  className="object-cover opacity-80"
  placeholder="blur"
/>
```

### Code Splitting

To improve initial load time, you can lazy load sections:

```typescript
import dynamic from 'next/dynamic';

const ShopSection = dynamic(() => import('./ShopSection'));
const NewsletterSection = dynamic(() => import('./NewsletterSection'));
```

## Accessibility

The component includes:

- ✅ Semantic HTML elements
- ✅ Alt text for images
- ✅ Keyboard navigation
- ✅ Focus states
- ✅ ARIA labels (where needed)

To improve accessibility:

```typescript
// Add ARIA labels
<button aria-label="Subscribe to newsletter">
  Subscribe
</button>

// Add focus-visible states
className="hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#272727]"
```

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## License

This component is based on a Figma design and is provided as-is for use in your projects.

## Credits

- Design: Figma
- Development: Converted from Figma to React/Next.js
- Fonts: Inter (Google Fonts)

## Support

For issues or questions, please refer to the Next.js and Tailwind CSS documentation:

- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Next.js Image: https://nextjs.org/docs/app/api-reference/components/image

