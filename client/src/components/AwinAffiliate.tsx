import { ExternalLink } from "lucide-react";

interface AwinLinkProps {
  url: string;
  merchantId: string;
  clickRef?: string;
  children: React.ReactNode;
  className?: string;
}

export function AwinLink({ 
  url, 
  merchantId, 
  clickRef = "", 
  children, 
  className = "" 
}: AwinLinkProps) {
  const AWIN_ID = "YOUR_AWIN_ID"; // Replace with your Awin publisher ID
  
  // Create Awin tracking URL
  const awinUrl = `https://www.awin1.com/cread.php?awinmid=${merchantId}&awinaffid=${AWIN_ID}&ued=${encodeURIComponent(url)}${clickRef ? `&clickref=${clickRef}` : ''}`;

  return (
    <a
      href={awinUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
    >
      {children}
    </a>
  );
}

// Booking.com affiliate component
export function BookingComAffiliate({ 
  destinationName, 
  city,
  className = "" 
}: { 
  destinationName: string;
  city: string;
  className?: string;
}) {
  const searchQuery = `${destinationName}, ${city}`;
  const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(searchQuery)}`;
  
  return (
    <AwinLink
      url={bookingUrl}
      merchantId="4329" // Booking.com merchant ID on Awin
      clickRef={`dest-${destinationName.toLowerCase().replace(/\s+/g, '-')}`}
      className={className}
    >
      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:opacity-60 transition-opacity">
        <div>
          <h4 className="text-xs font-bold uppercase text-black dark:text-white">Find Hotels Nearby</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">Book accommodation on Booking.com</p>
        </div>
        <ExternalLink className="h-5 w-5 text-black dark:text-white" />
      </div>
    </AwinLink>
  );
}

// Expedia affiliate component
export function ExpediaAffiliate({ 
  destinationName, 
  city,
  className = "" 
}: { 
  destinationName: string;
  city: string;
  className?: string;
}) {
  const searchQuery = `${destinationName}, ${city}`;
  const expediaUrl = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(searchQuery)}`;
  
  return (
    <AwinLink
      url={expediaUrl}
      merchantId="2651" // Expedia merchant ID on Awin
      clickRef={`dest-${destinationName.toLowerCase().replace(/\s+/g, '-')}`}
      className={className}
    >
      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:opacity-60 transition-opacity">
        <div>
          <h4 className="text-xs font-bold uppercase text-black dark:text-white">Book on Expedia</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">Hotels, flights & vacation packages</p>
        </div>
        <ExternalLink className="h-5 w-5 text-yellow-700" />
      </div>
    </AwinLink>
  );
}

// GetYourGuide affiliate component (for tours and activities)
export function GetYourGuideAffiliate({ 
  city,
  className = "" 
}: { 
  city: string;
  className?: string;
}) {
  const guideUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(city)}`;
  
  return (
    <AwinLink
      url={guideUrl}
      merchantId="4023" // GetYourGuide merchant ID on Awin
      clickRef={`city-${city.toLowerCase().replace(/\s+/g, '-')}`}
      className={className}
    >
      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:opacity-60 transition-opacity">
        <div>
          <h4 className="text-xs font-bold uppercase text-black dark:text-white">Book Tours & Activities</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">Discover experiences with GetYourGuide</p>
        </div>
        <ExternalLink className="h-5 w-5 text-black dark:text-white" />
      </div>
    </AwinLink>
  );
}

// Viator affiliate component (for tours and activities)
export function ViatorAffiliate({ 
  city,
  className = "" 
}: { 
  city: string;
  className?: string;
}) {
  const viatorUrl = `https://www.viator.com/searchResults/all?text=${encodeURIComponent(city)}`;
  
  return (
    <AwinLink
      url={viatorUrl}
      merchantId="4023" // Replace with actual Viator merchant ID
      clickRef={`city-${city.toLowerCase().replace(/\s+/g, '-')}`}
      className={className}
    >
      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:opacity-60 transition-opacity">
        <div>
          <h4 className="text-xs font-bold uppercase text-black dark:text-white">Explore with Viator</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">Tours, activities & experiences</p>
        </div>
        <ExternalLink className="h-5 w-5 text-black dark:text-white" />
      </div>
    </AwinLink>
  );
}

// Affiliate section for destination pages
export function AffiliateSection({ 
  destinationName, 
  city 
}: { 
  destinationName: string;
  city: string;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Plan Your Visit</h3>
      <BookingComAffiliate destinationName={destinationName} city={city} />
      <ExpediaAffiliate destinationName={destinationName} city={city} />
      <GetYourGuideAffiliate city={city} />
      <ViatorAffiliate city={city} />
      <p className="text-xs text-gray-500 mt-4">
        * We may earn a commission from these bookings at no extra cost to you.
      </p>
    </div>
  );
}

