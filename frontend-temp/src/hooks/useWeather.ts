import { useState } from 'react';
import {
  WeatherData,
  HourlyForecastData,
  DailyForecastData,
  ForecastSummary
} from '../types/weather';
import {
  getMockWeatherData,
  getHourlyForecast,
  getDailyForecast,
  getNextDayForecast,
  getWeeklyForecastSummary,
  getMonthlyForecastSummary,
  getSixMonthForecastSummary,
  getOutfitRecommendations
} from '../lib/mock-data';

interface UseWeatherReturn {
  weather: WeatherData;
  hourlyForecast: HourlyForecastData[];
  dailyForecast: DailyForecastData[];
  nextDayForecast: WeatherData;
  weeklyForecast: ForecastSummary;
  monthlyForecast: ForecastSummary;
  sixMonthForecast: ForecastSummary;
  outfit: {
    clothing: string[];
    accessories: string[];
    reason: string;
  };
  refreshWeather: () => void;
}

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData>(getMockWeatherData());
  const [hourlyForecast] = useState<HourlyForecastData[]>(getHourlyForecast());
  const [dailyForecast] = useState<DailyForecastData[]>(getDailyForecast());
  const [nextDayForecast] = useState<WeatherData>(getNextDayForecast());
  const [weeklyForecast] = useState<ForecastSummary>(getWeeklyForecastSummary());
  const [monthlyForecast] = useState<ForecastSummary>(getMonthlyForecastSummary());
  const [sixMonthForecast] = useState<ForecastSummary>(getSixMonthForecastSummary());

  const outfit = getOutfitRecommendations(weather.condition, weather.temperature);

  const refreshWeather = () => {
    setWeather(getMockWeatherData());
  };

  return {
    weather,
    hourlyForecast,
    dailyForecast,
    nextDayForecast,
    weeklyForecast,
    monthlyForecast,
    sixMonthForecast,
    outfit,
    refreshWeather
  };
}
