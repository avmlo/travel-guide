import { Crown, Map } from "lucide-react";
import { Destination } from "@/types/destination";

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface DestinationCardProps {
  destination: Destination;
  onClick?: () => void;
  colorIndex?: number;
  isSaved?: boolean;
  isVisited?: boolean;
}

export function DestinationCard({ destination, onClick }: DestinationCardProps) {
  const cityName = destination.city ? capitalizeCity(destination.city) : "Unknown";

  return (
    <button
      type="button"
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-white/[0.08] text-left transition-transform duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_40px_80px_-60px_rgba(15,23,42,0.9)] focus:outline-none"
      onClick={onClick}
    >
      <div className="relative h-56 w-full overflow-hidden">
        {destination.mainImage ? (
          <img
            src={destination.mainImage}
            alt={destination.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white/30">
            <Map className="h-10 w-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/10 to-transparent transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute left-5 top-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
          {destination.category || "Destination"}
        </div>

        {destination.crown && (
          <div className="absolute right-5 top-5 rounded-full bg-amber-400/90 p-2 text-amber-950 shadow-lg">
            <Crown className="h-4 w-4" />
          </div>
        )}

        {destination.michelinStars > 0 && (
          <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-lg">
            <img
              src="https://guide.michelin.com/assets/images/icons/1star-1f2c04d7e6738e8a3312c9cda4b64fd0.svg"
              alt="Michelin Star"
              className="h-4 w-4"
            />
            {destination.michelinStars}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-4 px-5 pb-6 pt-5">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-tight text-white line-clamp-2">
            {destination.name}
          </h3>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/50">
            <span>{cityName}</span>
            <span>{destination.category || ""}</span>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-white/60">
          {destination.content || "Explore the full listing to uncover the details behind this address."}
        </p>
      </div>
    </button>
  );
}

