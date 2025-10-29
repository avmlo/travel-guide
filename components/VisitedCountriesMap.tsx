import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map city names to country codes (ISO 3166-1 alpha-3)
const cityToCountry: Record<string, string> = {
  "tokyo": "JPN",
  "kyoto": "JPN",
  "osaka": "JPN",
  "nara": "JPN",
  "kamakura": "JPN",
  "kanazawa": "JPN",
  "kobe": "JPN",
  "hakone-atami": "JPN",
  "karuizawa": "JPN",
  "kyushu": "JPN",
  "nagato": "JPN",
  "okinawa": "JPN",
  "new-york": "USA",
  "los-angeles": "USA",
  "miami": "USA",
  "chicago": "USA",
  "washington-dc": "USA",
  "charleston": "USA",
  "orlando": "USA",
  "colorado": "USA",
  "hudson-valley": "USA",
  "hawaii": "USA",
  "paris": "FRA",
  "london": "GBR",
  "barcelona": "ESP",
  "madrid": "ESP",
  "bilbao": "ESP",
  "lisbon": "PRT",
  "porto": "PRT",
  "milan": "ITA",
  "rome": "ITA",
  "venice": "ITA",
  "lake-como": "ITA",
  "singapore": "SGP",
  "bangkok": "THA",
  "phuket": "THA",
  "koh-samui": "THA",
  "chiang-mai": "THA",
  "taipei": "TWN",
  "taichung": "TWN",
  "tainan": "TWN",
  "kaohsiung": "TWN",
  "chiayi": "TWN",
  "pingtung": "TWN",
  "seoul": "KOR",
  "sydney": "AUS",
  "melbourne": "AUS",
  "saigon": "VNM",
  "da-nang": "VNM",
  "copenhagen": "DNK",
  "zurich": "CHE",
  "geneva": "CHE",
  "basel": "CHE",
  "luzern": "CHE",
  "lausanne": "CHE",
  "valais": "CHE",
  "vienna": "AUT",
  "prague": "CZE",
  "antwerp": "BEL",
  "mexico-city": "MEX",
  "jakarta": "IDN",
  "auvergne-rhône-alpes": "FRA",
  "provence-alpes-côte-d-azur": "FRA",
};

interface VisitedCountriesMapProps {
  visitedCities: string[];
}

export function VisitedCountriesMap({ visitedCities }: VisitedCountriesMapProps) {
  // Get unique country codes from visited cities
  const visitedCountries = new Set(
    visitedCities
      .map(city => cityToCountry[city.toLowerCase()])
      .filter(Boolean)
  );

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold mb-4">Countries Visited</h3>
      <p className="text-sm text-gray-500 mb-6">
        {visitedCountries.size} {visitedCountries.size === 1 ? 'country' : 'countries'} explored
      </p>
      
      <div className="w-full" style={{ maxWidth: '100%', height: 'auto' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 140,
            center: [0, 20]
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isVisited = visitedCountries.has(geo.id);
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isVisited ? "#10b981" : "#e5e7eb"}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { 
                        fill: isVisited ? "#059669" : "#d1d5db",
                        outline: "none" 
                      },
                      pressed: { outline: "none" }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      <div className="flex items-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span className="text-gray-600">Not visited</span>
        </div>
      </div>
    </div>
  );
}

