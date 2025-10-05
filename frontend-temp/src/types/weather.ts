export type WeatherCondition = 
  | 'sunny' 
  | 'partly-cloudy' 
  | 'cloudy' 
  | 'rainy' 
  | 'stormy' 
  | 'snowy' 
  | 'clear-night';

export interface WeatherData {
  condition: WeatherCondition;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  uvIndex: number;
  airQuality: number;
  location: string;
  timestamp: Date;
}

export interface DailyContext {
  id: string;
  date: string;
  schedule: string;
  outdoorPlans: boolean;
  events: string[];
  riskTolerance: 'low' | 'medium' | 'high';
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  productivity: number; // 1-5
  weatherImpact: boolean;
  notes?: string;
}

export interface OutfitRecommendation {
  category: string;
  items: string[];
  reason: string;
}

export interface CustomizationSettings {
  homeLayout: 'compact' | 'detailed' | 'minimal';
  theme: 'auto' | 'light' | 'dark';
  units: 'celsius' | 'fahrenheit';
  notifications: {
    enabled: boolean;
    riskThreshold: 'low' | 'medium' | 'high';
    customAlerts: string[];
  };
  displayOptions: {
    showHourlyForecast: boolean;
    showOutfitRecommendations: boolean;
    showMoodTracking: boolean;
    showAirQuality: boolean;
  };
}

export interface HourlyForecastData {
  hour: string;
  temperature: number;
  condition: WeatherCondition;
  precipitation: number;
}

export interface DailyForecastData {
  day: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  precipitation: number;
}

export interface ForecastSummary {
  avgTemp: number;
  avgHumidity: number;
  avgWindSpeed: number;
  dominantCondition: WeatherCondition;
  rainyDays: number;
  sunnyDays: number;
  weatherIndex: number;
  summary: string;
  tempTrend?: 'rising' | 'falling';
  seasonalShift?: string;
}

export interface WeatherTheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  cardBg: string;
  gradient: string;
  icon: string;
}
