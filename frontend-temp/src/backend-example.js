/**
 * Example Express.js Backend for WeatherFlow
 * 
 * This is a reference implementation showing how to structure your backend.
 * Copy this to your VS Code project and customize as needed.
 * 
 * Installation:
 * npm install express cors axios dotenv
 * 
 * Run:
 * node backend-example.js
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // For development. In production, specify your domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// In-memory storage (use a database in production)
const storage = {
  settings: {},
  moods: [],
  contexts: []
};

// ===== WEATHER ENDPOINTS =====

// Get current weather
app.get('/api/weather/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenWeather API key not configured in .env file' 
      });
    }

    // Fetch from OpenWeatherMap
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: location,
          appid: apiKey,
          units: 'metric'
        }
      }
    );

    const data = response.data;
    
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

    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Get forecast
app.get('/api/forecast/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenWeather API key not configured' 
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          q: location,
          appid: apiKey,
          units: 'metric'
        }
      }
    );

    const data = response.data;

    // Transform hourly (next 24 hours)
    const hourlyForecast = data.list.slice(0, 8).map(item => ({
      hour: new Date(item.dt * 1000).getHours() + ':00',
      temperature: Math.round(item.main.temp),
      condition: mapWeatherCondition(item.weather[0].main, item.weather[0].id),
      precipitation: Math.round((item.pop || 0) * 100)
    }));

    // Transform daily
    const dailyForecast = aggregateDailyForecast(data.list);

    res.json({ hourlyForecast, dailyForecast });
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// ===== USER DATA ENDPOINTS =====

// Save settings
app.post('/api/settings', (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1] || 'default';
    storage.settings[userId] = req.body;
    res.json({ success: true, message: 'Settings saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Get settings
app.get('/api/settings', (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1] || 'default';
    const settings = storage.settings[userId] || {
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
    };
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Save mood entry
app.post('/api/mood', (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1] || 'default';
    const entry = { ...req.body, userId };
    storage.moods.push(entry);
    res.json({ success: true, message: 'Mood entry saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save mood entry' });
  }
});

// Get mood entries
app.get('/api/mood', (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1] || 'default';
    const entries = storage.moods.filter(m => m.userId === userId);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mood entries' });
  }
});

// Save daily context
app.post('/api/context', (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1] || 'default';
    const context = { ...req.body, userId };
    storage.contexts.push(context);
    res.json({ success: true, message: 'Context saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save context' });
  }
});

// Get daily contexts
app.get('/api/context', (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1] || 'default';
    const contexts = storage.contexts.filter(c => c.userId === userId);
    res.json(contexts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contexts' });
  }
});

// ===== HELPER FUNCTIONS =====

function mapWeatherCondition(main, id) {
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

function aggregateDailyForecast(list) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyData = {};

  list.forEach(item => {
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

  return Object.values(dailyData).slice(0, 7).map(day => ({
    day: day.day,
    high: Math.round(Math.max(...day.temps)),
    low: Math.round(Math.min(...day.temps)),
    condition: day.conditions[Math.floor(day.conditions.length / 2)],
    precipitation: Math.round(Math.max(...day.precipitations))
  }));
}

// ===== START SERVER =====

app.listen(PORT, () => {
  console.log(`🌤️  WeatherFlow Backend running on http://localhost:${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
  console.log(`\n⚠️  Don't forget to:`);
  console.log(`   1. Create a .env file with OPENWEATHER_API_KEY=your_key`);
  console.log(`   2. Update /lib/config.ts in your frontend with this URL`);
});