// Archivo: src/types/weather.types.ts

export interface WeatherCondition {
  main: string;        // "Clouds", "Rain", etc.
  description: string; // "nubes dispersas"
}

export interface WeatherMain {
  temp: number;
  humidity: number;
}

export interface WeatherWind {
  speed: number;
}

export interface CurrentWeather {
  weather: WeatherCondition[];
  main: WeatherMain;
  wind: WeatherWind;
}