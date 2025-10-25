import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";

export const weatherRouter = router({
  getWeatherByCity: publicProcedure
    .input(
      z.object({
        city: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        // If coordinates are provided, use them directly
        let lat = input.latitude;
        let lon = input.longitude;

        // If no coordinates, try to geocode the city name
        if (!lat || !lon) {
          const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(input.city)}&count=1&language=en&format=json`;
          const geocodeResponse = await fetch(geocodeUrl);
          const geocodeData = await geocodeResponse.json();

          if (!geocodeData.results || geocodeData.results.length === 0) {
            throw new Error("City not found");
          }

          lat = geocodeData.results[0].latitude;
          lon = geocodeData.results[0].longitude;
        }

        // Fetch 7-day weather forecast
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&timezone=auto&forecast_days=7`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        // Map weather codes to descriptions and icons
        const getWeatherInfo = (code: number) => {
          const weatherCodes: Record<number, { description: string; icon: string }> = {
            0: { description: "Clear sky", icon: "☀️" },
            1: { description: "Mainly clear", icon: "🌤️" },
            2: { description: "Partly cloudy", icon: "⛅" },
            3: { description: "Overcast", icon: "☁️" },
            45: { description: "Foggy", icon: "🌫️" },
            48: { description: "Foggy", icon: "🌫️" },
            51: { description: "Light drizzle", icon: "🌦️" },
            53: { description: "Drizzle", icon: "🌦️" },
            55: { description: "Heavy drizzle", icon: "🌧️" },
            61: { description: "Light rain", icon: "🌧️" },
            63: { description: "Rain", icon: "🌧️" },
            65: { description: "Heavy rain", icon: "⛈️" },
            71: { description: "Light snow", icon: "🌨️" },
            73: { description: "Snow", icon: "❄️" },
            75: { description: "Heavy snow", icon: "❄️" },
            77: { description: "Snow grains", icon: "🌨️" },
            80: { description: "Light showers", icon: "🌦️" },
            81: { description: "Showers", icon: "🌧️" },
            82: { description: "Heavy showers", icon: "⛈️" },
            85: { description: "Light snow showers", icon: "🌨️" },
            86: { description: "Snow showers", icon: "❄️" },
            95: { description: "Thunderstorm", icon: "⛈️" },
            96: { description: "Thunderstorm with hail", icon: "⛈️" },
            99: { description: "Thunderstorm with hail", icon: "⛈️" },
          };

          return weatherCodes[code] || { description: "Unknown", icon: "🌡️" };
        };

        // Format the forecast data
        const forecast = weatherData.daily.time.map((date: string, index: number) => {
          const weatherInfo = getWeatherInfo(weatherData.daily.weathercode[index]);
          return {
            date,
            tempMax: Math.round(weatherData.daily.temperature_2m_max[index]),
            tempMin: Math.round(weatherData.daily.temperature_2m_min[index]),
            precipitation: weatherData.daily.precipitation_probability_max[index],
            description: weatherInfo.description,
            icon: weatherInfo.icon,
          };
        });

        return {
          city: input.city,
          latitude: lat,
          longitude: lon,
          forecast,
        };
      } catch (error) {
        console.error("Weather API error:", error);
        throw new Error("Failed to fetch weather data");
      }
    }),
});

