# Backend Integration Guide

## 🎉 Your WeatherFlow app is now connected to your VS Code backend!

Your backend is running on **http://localhost:8080** and we've integrated it with:
- ✅ Calendar API integration
- ✅ Tasks API integration  
- ✅ Gemini AI for smart weather insights
- ✅ Real-time connection monitoring

---

## What You'll See

### 1. Backend Status Card (Top of App)
Shows connection status to your backend:
- **Green Check** = Connected successfully
- **Red X** = Cannot connect
- Click "Show APIs" to see which endpoints are available

### 2. AI Weather Insights Card
Powered by your Gemini API! It will:
- Analyze current weather conditions
- Consider your calendar events
- Factor in your pending tasks
- Generate personalized weather advice

---

## Expected API Endpoints

For full functionality, your backend should have these endpoints:

### Health Check
```
GET http://localhost:8080/health
Response: { "status": "ok" }
```

### Calendar API
```
GET http://localhost:8080/calendar/today
Response: [
  { "title": "Meeting", "time": "10:00 AM" },
  { "title": "Lunch", "time": "12:00 PM" }
]
```

### Tasks API
```
GET http://localhost:8080/tasks
Response: [
  { "title": "Finish report", "priority": "high" },
  { "title": "Review code", "priority": "medium" }
]
```

### Gemini AI API
```
POST http://localhost:8080/gemini/generate
Body: { 
  "prompt": "Your weather insight prompt",
  "maxTokens": 150
}
Response: {
  "text": "AI generated insight..."
  // OR
  "response": "AI generated insight..."
  // OR
  "content": "AI generated insight..."
}
```

---

## Testing the Connection

### Step 1: Start Your Backend
In VS Code terminal:
```bash
# Start your backend on port 8080
npm start
# or
python app.py
# or whatever command you use
```

### Step 2: Check the Connection
1. Open the WeatherFlow app
2. Look at the **Backend Status** card at the top
3. It should show "Connected" with a green checkmark
4. Click "Show APIs" to see which endpoints are available

### Step 3: Test the APIs
Open your browser's DevTools (F12):
1. Go to the **Network** tab
2. Refresh the app
3. Look for requests to `localhost:8080`
4. Check if they return status 200 (success)

### Common Issues & Solutions

#### ❌ "Disconnected" Status
**Problem:** Backend not running or wrong port  
**Solution:**
- Make sure backend is running in VS Code
- Verify it's on port 8080
- Try opening http://localhost:8080 in browser

#### ❌ CORS Errors in Console
**Problem:** Your backend needs CORS headers  
**Solutions:**

**For Express.js:**
```javascript
const cors = require('cors');
app.use(cors());
```

**For Flask:**
```python
from flask_cors import CORS
CORS(app)
```

**For FastAPI:**
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["*"])
```

#### ❌ "API Not Available" for Calendar/Tasks/Gemini
**This is OK!** The app will work fine without these endpoints. The AI Insights card won't show, but everything else works.

---

## How It Works

### Weather Data
Currently using **mock data** since you don't have weather API endpoints. The app generates realistic weather data for testing.

### AI Insights (Gemini Integration)
When connected, the app will:
1. Fetch your calendar events from `/calendar/today`
2. Fetch your tasks from `/tasks`
3. Send weather + context to `/gemini/generate`
4. Display the AI-generated insight

Example prompt sent to Gemini:
```
You are a helpful weather assistant. Based on this weather data:
- Condition: sunny
- Temperature: 24°C
- Humidity: 65%
- Wind Speed: 15 km/h

Upcoming events today: Team Meeting, Lunch with Client
Pending tasks: Finish presentation, Review budget

Provide a brief, friendly weather insight or recommendation (2-3 sentences max).
```

---

## Customizing API Paths

If your endpoints use different paths, edit `/lib/api-service.ts`:

```typescript
// Change this:
async getTodayCalendar() {
  const response = await fetch(`${BASE_URL}/calendar/today`, ...);
}

// To match your backend:
async getTodayCalendar() {
  const response = await fetch(`${BASE_URL}/api/v1/events/today`, ...);
}
```

---

## Switching to Mock Mode

If your backend isn't ready or you want to test offline:

Edit `/lib/config.ts`:
```typescript
export const API_MODE: 'local' | 'mock' = 'mock';
```

This will:
- Disable all backend calls
- Use mock weather data
- Hide the backend status card
- Still show all features

---

## Next Steps

### Option 1: Add Weather API to Your Backend
If you want real weather data, add OpenWeatherMap to your backend:

1. Get free API key: https://openweathermap.org/api
2. Add endpoints to your backend (see `/backend-example.js`)
3. Update `/lib/config.ts` to enable weather endpoints

### Option 2: Use Google Calendar API
Connect your real calendar:
1. Set up Google Calendar API in your backend
2. OAuth authentication
3. Fetch real events automatically

### Option 3: Enhance Gemini Integration
Make smarter insights:
- Add historical weather preferences
- Consider time of day
- Factor in user's location
- Suggest outfit recommendations

---

## Debugging Tips

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Look for requests to `localhost:8080`
4. Click on them to see request/response details

### Check Console
Look for these logs:
- ✅ "Backend connected successfully"
- ✅ "Calendar API available"
- ❌ "Could not connect to calendar API"
- ❌ "CORS error"

### Test Backend Directly
Open in new tab:
- http://localhost:8080/health
- http://localhost:8080/calendar/today
- http://localhost:8080/tasks

---

## Need Help?

Common questions:

**Q: Do I need all the APIs to work?**  
A: No! The app works fine with just some of them. Missing APIs are gracefully handled.

**Q: Can I change the port?**  
A: Yes! Edit `/lib/config.ts` and change `LOCAL_BACKEND_URL`

**Q: Will this work when I deploy?**  
A: You'll need to update the URL to your production backend URL instead of localhost.

**Q: Can I use a different AI model?**  
A: Yes! Just update the `/gemini/generate` endpoint to use any LLM (ChatGPT, Claude, etc.)

---

## Summary

✅ Backend connected to **http://localhost:8080**  
✅ Using your **Calendar, Tasks, and Gemini APIs**  
✅ Mock weather data (no weather API needed yet)  
✅ Real-time connection monitoring  
✅ Graceful fallbacks if APIs aren't available  

**The app will work even if your backend is offline!** It just won't show AI insights or calendar integration.