import { Crown, MapPin, Star } from "lucide-react";
import { Destination } from "@/types/destination";

function capitalize(value: string): string {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

interface DestinationCardProps {
  destination: Destination;
  onClick?: () => void;
  isSaved?: boolean;
  isVisited?: boolean;
}

export function DestinationCard({ destination, onClick, isSaved, isVisited }: DestinationCardProps) {
  const cityName = destination.city ? capitalize(destination.city) : "Unknown";
  const hasStatus = isSaved || isVisited;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-[1px] text-left transition-transform duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_40px_120px_-60px_rgba(40,52,105,0.65)] focus:outline-none"
    >
      <div className="relative h-56 w-full overflow-hidden rounded-[26px] bg-[#0c0f1d]">
        {destination.mainImage ? (
          <img
            src={destination.mainImage}
            alt={destination.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/25">
            <MapPin className="h-8 w-8" />
            <span className="text-xs uppercase tracking-[0.3em]">Awaiting imagery</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#05070f]/95 via-[#05070f]/10 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

        <div className="absolute left-5 top-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">
          {destination.category || "Destination"}
        </div>

        {destination.crown && (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-amber-400/95 px-3 py-1 text-[11px] font-semibold text-amber-950 shadow-lg">
            <Crown className="h-3.5 w-3.5" />
            Curated
          </div>
        )}

        {destination.michelinStars > 0 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-lg">
            <Star className="h-3.5 w-3.5" />
            {destination.michelinStars}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-4 rounded-[26px] bg-[#0b0e1a]/90 px-5 pb-6 pt-5 backdrop-blur-sm">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-tight text-white line-clamp-2">
            {destination.name}
          </h3>
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-white/45">
            <span className="flex items-center gap-1 text-white/60">
              <MapPin className="h-3.5 w-3.5" />
              {cityName}
            </span>
            <span>{destination.category || ""}</span>
          </div>
        </div>

        <p className="line-clamp-3 text-sm text-white/65">
          {destination.content || "Glide into the listing to uncover the hours, reservations, and the right moment to arrive."}
        </p>

        {hasStatus && (
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/40">
            {isSaved && <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">Saved</span>}
            {isVisited && <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">Visited</span>}
          </div>
        )}
      </div>
    </button>
  );
}
