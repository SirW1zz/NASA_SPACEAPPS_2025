import {
  WeatherData,
  HourlyForecastData,
  DailyForecastData,
  CustomizationSettings,
  MoodEntry,
  DailyContext
} from '../types/weather';
import { getBaseURL, CORS_CONFIG } from './config';

const BASE_URL = getBaseURL();

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // Weather endpoints
  async getCurrentWeather(location: string): Promise<ApiResponse<WeatherData>> {
    try {
      const response = await fetch(`${BASE_URL}/weather/${encodeURIComponent(location)}`, {
        ...CORS_CONFIG,
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to fetch weather:', error);
        return { error: error.error || 'Failed to fetch weather data' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching weather:', error);
      return { error: 'Network error while fetching weather' };
    }
  }

  async getForecast(location: string): Promise<ApiResponse<{
    hourlyForecast: HourlyForecastData[];
    dailyForecast: DailyForecastData[];
  }>> {
    try {
      const response = await fetch(`${BASE_URL}/forecast/${encodeURIComponent(location)}`, {
        ...CORS_CONFIG,
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to fetch forecast:', error);
        return { error: error.error || 'Failed to fetch forecast data' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return { error: 'Network error while fetching forecast' };
    }
  }

  // Settings endpoints (require auth)
  async saveSettings(settings: CustomizationSettings): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await fetch(`${BASE_URL}/settings`, {
        ...CORS_CONFIG,
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to save settings:', error);
        return { error: error.error || 'Failed to save settings' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { error: 'Network error while saving settings' };
    }
  }

  async getSettings(): Promise<ApiResponse<CustomizationSettings>> {
    try {
      const response = await fetch(`${BASE_URL}/settings`, {
        ...CORS_CONFIG,
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to fetch settings:', error);
        return { error: error.error || 'Failed to fetch settings' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching settings:', error);
      return { error: 'Network error while fetching settings' };
    }
  }

  // Mood tracking endpoints (require auth)
  async saveMoodEntry(entry: MoodEntry): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await fetch(`${BASE_URL}/mood`, {
        ...CORS_CONFIG,
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to save mood entry:', error);
        return { error: error.error || 'Failed to save mood entry' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error saving mood entry:', error);
      return { error: 'Network error while saving mood entry' };
    }
  }

  async getMoodEntries(): Promise<ApiResponse<MoodEntry[]>> {
    try {
      const response = await fetch(`${BASE_URL}/mood`, {
        ...CORS_CONFIG,
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to fetch mood entries:', error);
        return { error: error.error || 'Failed to fetch mood entries' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching mood entries:', error);
      return { error: 'Network error while fetching mood entries' };
    }
  }

  // Daily context endpoints (require auth)
  async saveDailyContext(context: DailyContext): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await fetch(`${BASE_URL}/context`, {
        ...CORS_CONFIG,
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to save context:', error);
        return { error: error.error || 'Failed to save context' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error saving context:', error);
      return { error: 'Network error while saving context' };
    }
  }

  async getDailyContexts(): Promise<ApiResponse<DailyContext[]>> {
    try {
      const response = await fetch(`${BASE_URL}/context`, {
        ...CORS_CONFIG,
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to fetch contexts:', error);
        return { error: error.error || 'Failed to fetch contexts' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching contexts:', error);
      return { error: 'Network error while fetching contexts' };
    }
  }

  // ===== YOUR BACKEND INTEGRATION =====
  
  // Calendar API - Get today's events
  async getTodayCalendar(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${BASE_URL}/calendar/today`, {
        ...CORS_CONFIG,
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        console.log('Calendar API not available or returned error');
        return { data: [] };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.log('Could not connect to calendar API:', error);
      return { data: [] };
    }
  }

  // Tasks API - Get pending tasks
  async getTasks(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${BASE_URL}/tasks`, {
        ...CORS_CONFIG,
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        console.log('Tasks API not available or returned error');
        return { data: [] };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.log('Could not connect to tasks API:', error);
      return { data: [] };
    }
  }

  // Gemini API - Get weather insights based on context
  async getWeatherInsights(weatherData: WeatherData, calendarEvents?: any[], tasks?: any[]): Promise<ApiResponse<string>> {
    try {
      const prompt = `You are a helpful weather assistant. Based on this weather data:
      - Condition: ${weatherData.condition}
      - Temperature: ${weatherData.temperature}°C
      - Humidity: ${weatherData.humidity}%
      - Wind Speed: ${weatherData.windSpeed} km/h
      ${calendarEvents && calendarEvents.length > 0 ? `\nUpcoming events today: ${calendarEvents.map(e => e.title || e.name).join(', ')}` : ''}
      ${tasks && tasks.length > 0 ? `\nPending tasks: ${tasks.map(t => t.title || t.name).join(', ')}` : ''}
      
      Provide a brief, friendly weather insight or recommendation (2-3 sentences max).`;

      const response = await fetch(`${BASE_URL}/gemini/generate`, {
        ...CORS_CONFIG,
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          prompt,
          maxTokens: 150 
        }),
      });

      if (!response.ok) {
        console.log('Gemini API not available');
        return { data: `It's ${weatherData.condition} today with a temperature of ${weatherData.temperature}°C. Have a great day!` };
      }

      const result = await response.json();
      return { data: result.text || result.response || result.content };
    } catch (error) {
      console.log('Could not connect to Gemini API:', error);
      return { data: `It's ${weatherData.condition} today. Stay comfortable!` };
    }
  }

  // Health check - Test if your backend is running
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/health`, {
        ...CORS_CONFIG,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
