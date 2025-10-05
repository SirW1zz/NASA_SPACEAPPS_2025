import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Logger middleware
app.use('*', logger(console.log));

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Health check
app.get('/make-server-c2319dbc/health', (c) => {
  return c.json({ status: 'ok', message: 'WeatherFlow backend is running' });
});

// Weather API endpoint - fetches real weather data
app.get('/make-server-c2319dbc/weather/:location', async (c) => {
  try {
    const location = c.req.param('location');
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');

    if (!apiKey) {
      return c.json({ 
        error: 'OpenWeather API key not configured. Please add OPENWEATHER_API_KEY to environment variables.' 
      }, 500);
    }

    // Fetch from OpenWeatherMap API
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      console.log(`Weather API error for ${location}: ${response.statusText}`);
      return c.json({ error: 'Failed to fetch weather data' }, response.status);
    }

    const data = await response.json();

    // Transform to our format
    const weatherData = {
      condition: mapWeatherCondition(data.weather[0].main, data.weather[0].id),
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      precipitation: data.rain ? data.rain['1h'] || 0 : 0,
      uvIndex: 0, // Requires separate API call
      airQuality: 0, // Requires separate API call
      location: data.name,
      timestamp: new Date().toISOString()
    };

    return c.json(weatherData);
  } catch (error) {
    console.log(`Error fetching weather: ${error}`);
    return c.json({ error: 'Internal server error while fetching weather' }, 500);
  }
});

// Forecast endpoint
app.get('/make-server-c2319dbc/forecast/:location', async (c) => {
  try {
    const location = c.req.param('location');
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');

    if (!apiKey) {
      return c.json({ 
        error: 'OpenWeather API key not configured' 
      }, 500);
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      return c.json({ error: 'Failed to fetch forecast data' }, response.status);
    }

    const data = await response.json();

    // Transform hourly forecast (next 24 hours)
    const hourlyForecast = data.list.slice(0, 8).map((item: any) => ({
      hour: new Date(item.dt * 1000).getHours() + ':00',
      temperature: Math.round(item.main.temp),
      condition: mapWeatherCondition(item.weather[0].main, item.weather[0].id),
      precipitation: Math.round((item.pop || 0) * 100)
    }));

    // Transform daily forecast (next 7 days)
    const dailyForecast = aggregateDailyForecast(data.list);

    return c.json({ hourlyForecast, dailyForecast });
  } catch (error) {
    console.log(`Error fetching forecast: ${error}`);
    return c.json({ error: 'Internal server error while fetching forecast' }, 500);
  }
});

// Save user settings
app.post('/make-server-c2319dbc/settings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const settings = await c.req.json();
    await kv.set(`settings:${user.id}`, settings);

    return c.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.log(`Error saving settings: ${error}`);
    return c.json({ error: 'Failed to save settings' }, 500);
  }
});

// Get user settings
app.get('/make-server-c2319dbc/settings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const settings = await kv.get(`settings:${user.id}`);
    
    if (!settings) {
      // Return default settings
      return c.json({
        homeLayout: 'detailed',
        theme: 'auto',
        units: 'celsius',
        notifications: {
          enabled: true,
          riskThreshold: 'medium',
          customAlerts: []
        },
        displayOptions: {
          showHourlyForecast: true,
          showOutfitRecommendations: true,
          showMoodTracking: true,
          showAirQuality: true
        }
      });
    }

    return c.json(settings);
  } catch (error) {
    console.log(`Error fetching settings: ${error}`);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// Save mood entry
app.post('/make-server-c2319dbc/mood', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const moodEntry = await c.req.json();
    const moodKey = `mood:${user.id}:${moodEntry.id}`;
    await kv.set(moodKey, moodEntry);

    return c.json({ success: true, message: 'Mood entry saved' });
  } catch (error) {
    console.log(`Error saving mood entry: ${error}`);
    return c.json({ error: 'Failed to save mood entry' }, 500);
  }
});

// Get mood entries
app.get('/make-server-c2319dbc/mood', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const entries = await kv.getByPrefix(`mood:${user.id}:`);
    return c.json(entries || []);
  } catch (error) {
    console.log(`Error fetching mood entries: ${error}`);
    return c.json({ error: 'Failed to fetch mood entries' }, 500);
  }
});

// Save daily context
app.post('/make-server-c2319dbc/context', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const context = await c.req.json();
    const contextKey = `context:${user.id}:${context.id}`;
    await kv.set(contextKey, context);

    return c.json({ success: true, message: 'Daily context saved' });
  } catch (error) {
    console.log(`Error saving context: ${error}`);
    return c.json({ error: 'Failed to save context' }, 500);
  }
});

// Get daily contexts
app.get('/make-server-c2319dbc/context', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const contexts = await kv.getByPrefix(`context:${user.id}:`);
    return c.json(contexts || []);
  } catch (error) {
    console.log(`Error fetching contexts: ${error}`);
    return c.json({ error: 'Failed to fetch contexts' }, 500);
  }
});

// Helper function to map OpenWeatherMap conditions to our types
function mapWeatherCondition(main: string, id: number): string {
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 20;

  if (main === 'Clear') {
    return isNight ? 'clear-night' : 'sunny';
  }
  if (main === 'Clouds') {
    return id === 801 || id === 802 ? 'partly-cloudy' : 'cloudy';
  }
  if (main === 'Rain' || main === 'Drizzle') {
    return 'rainy';
  }
  if (main === 'Thunderstorm') {
    return 'stormy';
  }
  if (main === 'Snow') {
    return 'snowy';
  }
  
  return isNight ? 'clear-night' : 'partly-cloudy';
}

// Helper to aggregate daily forecast from 3-hour intervals
function aggregateDailyForecast(list: any[]): any[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyData: { [key: string]: any } = {};

  list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();
    
    if (!dailyData[dayKey]) {
      dailyData[dayKey] = {
        day: days[date.getDay()],
        temps: [],
        conditions: [],
        precipitations: []
      };
    }
    
    dailyData[dayKey].temps.push(item.main.temp);
    dailyData[dayKey].conditions.push(mapWeatherCondition(item.weather[0].main, item.weather[0].id));
    dailyData[dayKey].precipitations.push((item.pop || 0) * 100);
  });

  return Object.values(dailyData).slice(0, 7).map((day: any) => ({
    day: day.day,
    high: Math.round(Math.max(...day.temps)),
    low: Math.round(Math.min(...day.temps)),
    condition: day.conditions[Math.floor(day.conditions.length / 2)], // Use midday condition
    precipitation: Math.round(Math.max(...day.precipitations))
  }));
}

Deno.serve(app.fetch);
