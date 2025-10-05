# Connecting to Your VS Code Backend

This guide will help you connect your WeatherFlow frontend (running in Figma Make) to your backend running in VS Code.

## Quick Setup Steps

### 1. Configure the Backend URL

Edit `/lib/config.ts` and update the `LOCAL_BACKEND_URL`:

```typescript
export const LOCAL_BACKEND_URL = 'http://localhost:3000/api';
// Change 3000 to your actual port number
```

### 2. Enable CORS in Your Backend

Your backend **must** allow requests from the Figma Make domain. Add CORS headers:

#### For Express.js (Node.js):
```javascript
const cors = require('cors');
app.use(cors({
  origin: '*', // For development only
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### For FastAPI (Python):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### For Flask (Python):
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
```

### 3. Required API Endpoints

Your backend should implement these endpoints:

#### Weather Endpoints
- `GET /api/weather/:location` - Get current weather
- `GET /api/forecast/:location` - Get forecast data

#### User Data Endpoints (optional, requires auth)
- `POST /api/settings` - Save user settings
- `GET /api/settings` - Get user settings
- `POST /api/mood` - Save mood entry
- `GET /api/mood` - Get mood entries
- `POST /api/context` - Save daily context
- `GET /api/context` - Get daily contexts

### 4. Expected Response Formats

#### Weather Response:
```json
{
  "condition": "sunny",
  "temperature": 24,
  "feelsLike": 26,
  "humidity": 65,
  "windSpeed": 15,
  "precipitation": 0,
  "uvIndex": 7,
  "airQuality": 45,
  "location": "San Francisco",
  "timestamp": "2025-10-04T12:00:00Z"
}
```

#### Forecast Response:
```json
{
  "hourlyForecast": [
    {
      "hour": "14:00",
      "temperature": 25,
      "condition": "sunny",
      "precipitation": 0
    }
  ],
  "dailyForecast": [
    {
      "day": "Mon",
      "high": 28,
      "low": 18,
      "condition": "partly-cloudy",
      "precipitation": 20
    }
  ]
}
```

## Troubleshooting

### Issue: "Network error while fetching weather"

**Solution:** 
1. Check that your backend is running in VS Code
2. Verify the port number in `/lib/config.ts` matches your backend
3. Open browser DevTools → Network tab to see the actual error

### Issue: "CORS policy blocked"

**Solution:** Add CORS headers to your backend (see step 2 above)

### Issue: "Failed to fetch"

**Solutions:**
- Ensure your backend is running on `http://localhost:PORT`
- Try using a tunnel service like ngrok (see below)

## Using ngrok for Remote Access

If you want to test from different devices or avoid CORS issues:

1. Install ngrok: https://ngrok.com/download
2. Run your backend on a port (e.g., 3000)
3. In a terminal, run: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Update `/lib/config.ts`:
   ```typescript
   export const LOCAL_BACKEND_URL = 'https://abc123.ngrok.io/api';
   ```

## Switching to Mock Data

If your backend isn't ready yet, you can use mock data:

In `/lib/config.ts`, change:
```typescript
export const API_MODE: 'local' | 'mock' = 'mock';
```

## Testing the Connection

1. Open your browser's DevTools (F12)
2. Go to the Network tab
3. Refresh your app
4. Look for requests to your backend URL
5. Check if they're successful (status 200) or failing

## Need Help?

Common issues:
- ❌ Backend not running → Start your backend server
- ❌ Wrong port number → Check `/lib/config.ts`
- ❌ CORS errors → Add CORS middleware to backend
- ❌ Wrong endpoints → Verify your backend routes match the expected format