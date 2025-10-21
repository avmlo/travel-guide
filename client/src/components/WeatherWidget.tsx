import { trpc } from "@/lib/trpc";
import { Cloud, Loader2 } from "lucide-react";

interface WeatherWidgetProps {
  city: string;
  latitude?: number;
  longitude?: number;
}

export function WeatherWidget({ city, latitude, longitude }: WeatherWidgetProps) {
  const { data: weather, isLoading, error } = trpc.weather.getWeatherByCity.useQuery({
    city,
    latitude,
    longitude,
  });

  if (isLoading) {
    return (
      <div className="bg-[#f5f1e8] rounded-xl border border-gray-200 p-3">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">Loading weather...</span>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-[#f5f1e8] rounded-xl border border-gray-200 p-3">
        <div className="flex items-center gap-2 text-gray-400">
          <Cloud className="h-4 w-4" />
          <span className="text-xs">Weather data unavailable</span>
        </div>
      </div>
    );
  }

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }
  };
  return (
    <div className="bg-[#f5f1e8] rounded-xl border border-gray-200 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Cloud className="h-4 w-4 text-gray-600" />
        <h3 className="font-semibold text-sm">7-Day Weather Forecast</h3>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth: 'thin'}}>
        {weather.forecast.map((day: any, index: number) => (
          <div
            key={day.date}
            className={`flex-shrink-0 text-center p-2 rounded-lg transition-all min-w-[80px] ${
              index === 0 ? "bg-white border border-gray-300" : "bg-white/60 hover:bg-white"
            }`}
          >
            <div className="text-[10px] font-semibold text-gray-600 mb-0.5">
              {getDayName(day.date)}
            </div>
            <div className="text-xl mb-1">{day.icon}</div>
            <div className="text-xs font-medium text-gray-900 mb-0.5">
              {day.tempMax}° / {day.tempMin}°
            </div>
            <div className="text-[10px] text-gray-500 mb-0.5 line-clamp-1">{day.description}</div>
            {day.precipitation > 0 && (
              <div className="text-[10px] text-blue-600">💧 {day.precipitation}%</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

