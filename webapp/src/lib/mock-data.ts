import { 
  WeatherData, 
  WeatherCondition, 
  HourlyForecastData, 
  DailyForecastData,
  ForecastSummary 
} from '../types/weather';

export function getMockWeatherData(): WeatherData {
  const conditions: WeatherCondition[] = ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'stormy', 'snowy'];
  const hour = new Date().getHours();
  
  // Determine condition based on time of day
  let condition: WeatherCondition;
  if (hour >= 20 || hour < 6) {
    condition = 'clear-night';
  } else {
    condition = conditions[Math.floor(Math.random() * conditions.length)];
  }

  return {
    condition,
    temperature: Math.floor(Math.random() * 20) + 15,
    feelsLike: Math.floor(Math.random() * 20) + 15,
    humidity: Math.floor(Math.random() * 40) + 40,
    windSpeed: Math.floor(Math.random() * 20) + 5,
    precipitation: Math.floor(Math.random() * 50),
    uvIndex: Math.floor(Math.random() * 10),
    airQuality: Math.floor(Math.random() * 150) + 50,
    location: 'San Francisco, CA',
    timestamp: new Date()
  };
}

export function getHourlyForecast(): HourlyForecastData[] {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = (new Date().getHours() + i) % 24;
    const conditions: WeatherCondition[] = ['sunny', 'partly-cloudy', 'cloudy', 'rainy'];
    
    return {
      hour: `${hour}:00`,
      temperature: Math.floor(Math.random() * 10) + 15,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      precipitation: Math.floor(Math.random() * 60)
    };
  });
}

export function getDailyForecast(): DailyForecastData[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const conditions: WeatherCondition[] = ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'stormy'];
  
  return Array.from({ length: 7 }, (_, i) => ({
    day: days[i],
    high: Math.floor(Math.random() * 10) + 20,
    low: Math.floor(Math.random() * 10) + 10,
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    precipitation: Math.floor(Math.random() * 70)
  }));
}

export function getOutfitRecommendations(condition: WeatherCondition, temp: number) {
  const recommendations = {
    'sunny': {
      clothing: ['Light t-shirt', 'Shorts or light pants', 'Sunglasses', 'Sun hat'],
      accessories: ['Sunscreen SPF 50+', 'Water bottle', 'Light backpack'],
      reason: 'Bright and warm - protect yourself from UV rays'
    },
    'rainy': {
      clothing: ['Waterproof jacket', 'Long pants', 'Closed-toe shoes'],
      accessories: ['Umbrella', 'Waterproof bag', 'Extra socks'],
      reason: 'Wet conditions - stay dry and comfortable'
    },
    'cloudy': {
      clothing: ['Light jacket', 'Comfortable layers', 'Casual shoes'],
      accessories: ['Light scarf', 'Versatile bag'],
      reason: 'Mild conditions - be prepared for temperature changes'
    },
    'stormy': {
      clothing: ['Heavy rain jacket', 'Waterproof pants', 'Rain boots'],
      accessories: ['Strong umbrella', 'Waterproof electronics case'],
      reason: 'Severe weather - maximum protection recommended'
    },
    'snowy': {
      clothing: ['Winter coat', 'Thermal layers', 'Snow boots', 'Gloves'],
      accessories: ['Warm hat', 'Scarf', 'Hand warmers'],
      reason: 'Cold and snowy - stay warm and prevent frostbite'
    },
    'partly-cloudy': {
      clothing: ['Light sweater', 'Jeans or casual pants', 'Comfortable shoes'],
      accessories: ['Light jacket (just in case)', 'Sunglasses'],
      reason: 'Pleasant weather - comfortable casual wear'
    },
    'clear-night': {
      clothing: ['Light jacket', 'Long sleeves', 'Comfortable pants'],
      accessories: ['Flashlight', 'Reflective gear if walking'],
      reason: 'Cool evening - light layers recommended'
    }
  };

  return recommendations[condition] || recommendations['cloudy'];
}

export function getNextDayForecast(): WeatherData {
  const conditions: WeatherCondition[] = ['sunny', 'partly-cloudy', 'cloudy', 'rainy'];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return {
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    temperature: Math.floor(Math.random() * 15) + 18,
    feelsLike: Math.floor(Math.random() * 15) + 18,
    humidity: Math.floor(Math.random() * 40) + 45,
    windSpeed: Math.floor(Math.random() * 15) + 5,
    precipitation: Math.floor(Math.random() * 40),
    uvIndex: Math.floor(Math.random() * 8),
    airQuality: Math.floor(Math.random() * 100) + 50,
    location: 'San Francisco, CA',
    timestamp: tomorrow
  };
}

export function getWeeklyForecastSummary(): ForecastSummary {
  const conditions: WeatherCondition[] = ['sunny', 'partly-cloudy', 'cloudy', 'rainy'];
  return {
    avgTemp: Math.floor(Math.random() * 10) + 18,
    avgHumidity: Math.floor(Math.random() * 20) + 50,
    avgWindSpeed: Math.floor(Math.random() * 10) + 8,
    dominantCondition: conditions[Math.floor(Math.random() * conditions.length)],
    rainyDays: Math.floor(Math.random() * 4) + 1,
    sunnyDays: Math.floor(Math.random() * 4) + 2,
    weatherIndex: Math.floor(Math.random() * 30) + 70,
    summary: 'Mostly pleasant with occasional rain showers'
  };
}

export function getMonthlyForecastSummary(): ForecastSummary {
  const conditions: WeatherCondition[] = ['sunny', 'partly-cloudy', 'cloudy', 'rainy'];
  return {
    avgTemp: Math.floor(Math.random() * 15) + 15,
    avgHumidity: Math.floor(Math.random() * 25) + 55,
    avgWindSpeed: Math.floor(Math.random() * 12) + 7,
    dominantCondition: conditions[Math.floor(Math.random() * conditions.length)],
    rainyDays: Math.floor(Math.random() * 10) + 5,
    sunnyDays: Math.floor(Math.random() * 12) + 10,
    weatherIndex: Math.floor(Math.random() * 30) + 65,
    summary: 'Transitioning season with variable conditions',
    tempTrend: 'rising' as const
  };
}

export function getSixMonthForecastSummary(): ForecastSummary {
  const conditions: WeatherCondition[] = ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'snowy'];
  return {
    avgTemp: Math.floor(Math.random() * 20) + 12,
    avgHumidity: Math.floor(Math.random() * 30) + 50,
    avgWindSpeed: Math.floor(Math.random() * 15) + 8,
    dominantCondition: conditions[Math.floor(Math.random() * conditions.length)],
    rainyDays: Math.floor(Math.random() * 30) + 20,
    sunnyDays: Math.floor(Math.random() * 40) + 60,
    weatherIndex: Math.floor(Math.random() * 30) + 60,
    summary: 'Seasonal patterns show transition from cool to warm weather',
    tempTrend: 'rising' as const,
    seasonalShift: 'Spring to Summer transition expected'
  };
}
