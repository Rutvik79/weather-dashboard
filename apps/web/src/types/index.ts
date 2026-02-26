export interface User {
  id: string;
  email: string;
  name: string;
}

export interface City {
  id: string;
  userId: string;
  name: string;
  country: string;
  lat: string | null;
  lon: string | null;
  isFavorite: boolean;
  notes: string | null;
  addedAt: string;
}

export interface WeatherData {
  cityId: string;
  cityName: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  icon: string;
  lat: number;
  lon: number;
}

export interface AuthResponse {
  user: User;
}
