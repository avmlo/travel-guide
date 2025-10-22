import { useEffect } from 'react';
import { Destination } from '@/types/destination';

interface SEOProps {
  destination?: Destination | null;
}

export function SEO({ destination }: SEOProps) {
  useEffect(() => {
    if (destination) {
      // Update page title
      document.title = `${destination.name} - ${destination.city} | The Urban Manual`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          `${destination.name} in ${destination.city}. ${destination.subline || destination.content.substring(0, 150)}... Discover this ${destination.category.toLowerCase()} destination on The Urban Manual.`
        );
      }
      
      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', `${destination.name} - ${destination.city} | The Urban Manual`);
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', 
          `${destination.subline || destination.content.substring(0, 150)}...`
        );
      }
      
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) {
        ogUrl.setAttribute('content', `https://urbanmanual.co/?destination=${destination.slug}`);
      }
      
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && destination.mainImage) {
        ogImage.setAttribute('content', destination.mainImage);
      }
      
      // Update Twitter Card tags
      const twitterTitle = document.querySelector('meta[property="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', `${destination.name} - ${destination.city}`);
      }
      
      const twitterDescription = document.querySelector('meta[property="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute('content', 
          `${destination.subline || destination.content.substring(0, 150)}...`
        );
      }
      
      const twitterImage = document.querySelector('meta[property="twitter:image"]');
      if (twitterImage && destination.mainImage) {
        twitterImage.setAttribute('content', destination.mainImage);
      }
      
      // Update canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', `https://urbanmanual.co/?destination=${destination.slug}`);
      }
      
      // Add structured data (JSON-LD)
      addStructuredData(destination);
    } else {
      // Reset to default
      document.title = 'The Urban Manual - Curated Travel Guide to 900+ Destinations Worldwide';
      
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', 'https://urbanmanual.co/');
      }
      
      // Remove destination-specific structured data
      const existingScript = document.getElementById('structured-data');
      if (existingScript) {
        existingScript.remove();
      }
    }
  }, [destination]);
  
  return null;
}

function addStructuredData(destination: Destination) {
  // Remove existing structured data
  const existingScript = document.getElementById('structured-data');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Determine schema type based on category
  let schemaType = 'Place';
  if (destination.category.toLowerCase().includes('eat') || 
      destination.category.toLowerCase().includes('drink') ||
      destination.category.toLowerCase().includes('restaurant')) {
    schemaType = 'Restaurant';
  } else if (destination.category.toLowerCase().includes('stay') || 
             destination.category.toLowerCase().includes('hotel')) {
    schemaType = 'Hotel';
  } else if (destination.category.toLowerCase().includes('shop')) {
    schemaType = 'Store';
  }
  
  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    'name': destination.name,
    'description': destination.subline || destination.content.substring(0, 200),
    'url': `https://urbanmanual.co/?destination=${destination.slug}`,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': destination.city,
    },
  };
  
  // Add image if available
  if (destination.mainImage) {
    structuredData.image = destination.mainImage;
  }
  
  // Add rating for Michelin-starred restaurants
  if (destination.michelinStars && destination.michelinStars > 0) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': 5,
      'bestRating': 5,
      'worstRating': 1,
      'ratingCount': 1,
    };
    
    // Add award
    structuredData.award = `${destination.michelinStars} Michelin Star${destination.michelinStars > 1 ? 's' : ''}`;
  }
  
  // Add to page
  const script = document.createElement('script');
  script.id = 'structured-data';
  script.type = 'application/ld+json';
  script.text = JSON.stringify(structuredData);
  document.head.appendChild(script);
}

