import dotenv from "dotenv";
dotenv.config();

const OWM_BASE = "https://api.openweathermap.org/data/2.5";
const API_KEY = process.env.OPENWEATHER_API_KEY;

export interface WeatherData {
  cityId: string;
  cityName: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string; // e.g. "Rain", "Clear"
  description: string; // e.g. "light rain"
  icon: string; // e.g. "10d" — use with OWM icon URL
  lat: number;
  lon: number;
}

export async function getWeatherByCity(
  cityName: string,
  country?: string,
): Promise<WeatherData> {
  const query = country ? `${cityName},${country}` : cityName;
  const url = `${OWM_BASE}/weather?q=${encodeURIComponent(query)}&units=metric&appid=${API_KEY}`;

  // https://api.openweathermap.org/data/3.0/onecall
  console.log("url from getWeatherbycity endpoint", url);
  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`City "${cityName}" not found`);
    }
    if (res.status === 401) {
      throw new Error("Invalid OpenWeatherMap API key");
    }
    throw new Error(`Weather API error: ${res.status}`);
  }

  const data: any = await res.json();
  console.log("data from weather get weather by city: ", data);

  return {
    cityId: data.id,
    cityName: data.name,
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    condition: data.weather[0].main,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    lat: data.coord.lat,
    lon: data.coord.lon,
  };
}
