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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading weather...</span>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 text-gray-400">
          <Cloud className="h-5 w-5" />
          <span className="text-sm">Weather data unavailable</span>
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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Cloud className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-lg">7-Day Weather Forecast</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {weather.forecast.map((day: any, index: number) => (
          <div
            key={day.date}
            className={`text-center p-4 rounded-xl transition-all ${
              index === 0 ? "bg-gray-100 border-2 border-gray-300" : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="text-xs font-semibold text-gray-600 mb-1">
              {getDayName(day.date)}
            </div>
            <div className="text-3xl mb-2">{day.icon}</div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              {day.tempMax}° / {day.tempMin}°
            </div>
            <div className="text-xs text-gray-500 mb-1">{day.description}</div>
            {day.precipitation > 0 && (
              <div className="text-xs text-blue-600">💧 {day.precipitation}%</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

