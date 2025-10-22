import { useEffect } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Destination } from '@/types/destination';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  destination?: Destination | null;
}

export function Breadcrumbs({ items, destination }: BreadcrumbsProps) {
  useEffect(() => {
    // Add structured data for breadcrumbs
    if (items.length > 1) {
      addBreadcrumbStructuredData(items);
    }
    
    return () => {
      // Clean up structured data when component unmounts
      const existingScript = document.getElementById('breadcrumb-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [items]);

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                {index === 0 && <Home className="h-4 w-4" />}
                {item.label}
              </a>
            ) : (
              <span className="text-gray-900 font-medium flex items-center gap-1">
                {index === 0 && <Home className="h-4 w-4" />}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function addBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  // Remove existing breadcrumb structured data
  const existingScript = document.getElementById('breadcrumb-structured-data');
  if (existingScript) {
    existingScript.remove();
  }

  // Create breadcrumb list items
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': item.label,
    'item': item.href ? `https://urbanmanual.co${item.href}` : undefined,
  }));

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': itemListElement,
  };

  // Add to page
  const script = document.createElement('script');
  script.id = 'breadcrumb-structured-data';
  script.type = 'application/ld+json';
  script.text = JSON.stringify(structuredData);
  document.head.appendChild(script);
}

// Helper function to generate breadcrumbs for different pages
export function getHomeBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: 'Home', href: '/' },
  ];
}

export function getAccountBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: 'Home', href: '/' },
    { label: 'Account' },
  ];
}

export function getDestinationBreadcrumbs(destination: Destination): BreadcrumbItem[] {
  return [
    { label: 'Home', href: '/' },
    { label: destination.city, href: `/?city=${encodeURIComponent(destination.city)}` },
    { label: destination.name },
  ];
}

export function getCategoryBreadcrumbs(category: string): BreadcrumbItem[] {
  return [
    { label: 'Home', href: '/' },
    { label: category },
  ];
}

export function getCityBreadcrumbs(city: string): BreadcrumbItem[] {
  return [
    { label: 'Home', href: '/' },
    { label: city },
  ];
}

