# Example Backend Endpoints for Your VS Code Project

Here are example implementations for the endpoints your WeatherFlow app will call.

---

## If Using Express.js (Node.js)

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// IMPORTANT: Enable CORS
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Calendar endpoint - return today's events
app.get('/calendar/today', (req, res) => {
  // Replace with your actual calendar logic
  const events = [
    { title: 'Team Standup', time: '9:00 AM', location: 'Zoom' },
    { title: 'Project Review', time: '2:00 PM', location: 'Conference Room' },
    { title: 'Gym', time: '6:00 PM', location: 'Fitness Center' }
  ];
  res.json(events);
});

// Tasks endpoint - return pending tasks
app.get('/tasks', (req, res) => {
  // Replace with your actual tasks logic
  const tasks = [
    { title: 'Finish quarterly report', priority: 'high', dueDate: '2025-10-05' },
    { title: 'Review pull requests', priority: 'medium', dueDate: '2025-10-04' },
    { title: 'Update documentation', priority: 'low', dueDate: '2025-10-06' }
  ];
  res.json(tasks);
});

// Gemini endpoint - generate AI insights
app.post('/gemini/generate', async (req, res) => {
  const { prompt, maxTokens } = req.body;
  
  // Replace with your actual Gemini API call
  // Example using Google's Generative AI:
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate insight' });
  }
});

app.listen(8080, () => {
  console.log('Backend running on http://localhost:8080');
});
```

---

## If Using Flask (Python)

```python
from flask import Flask, jsonify, request
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)

# IMPORTANT: Enable CORS
CORS(app)

# Health check
@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'message': 'Backend is running'})

# Calendar endpoint
@app.route('/calendar/today')
def calendar_today():
    # Replace with your actual calendar logic
    events = [
        {'title': 'Team Standup', 'time': '9:00 AM', 'location': 'Zoom'},
        {'title': 'Project Review', 'time': '2:00 PM', 'location': 'Conference Room'},
        {'title': 'Gym', 'time': '6:00 PM', 'location': 'Fitness Center'}
    ]
    return jsonify(events)

# Tasks endpoint
@app.route('/tasks')
def tasks():
    # Replace with your actual tasks logic
    tasks = [
        {'title': 'Finish quarterly report', 'priority': 'high', 'dueDate': '2025-10-05'},
        {'title': 'Review pull requests', 'priority': 'medium', 'dueDate': '2025-10-04'},
        {'title': 'Update documentation', 'priority': 'low', 'dueDate': '2025-10-06'}
    ]
    return jsonify(tasks)

# Gemini endpoint
@app.route('/gemini/generate', methods=['POST'])
def gemini_generate():
    data = request.json
    prompt = data.get('prompt')
    max_tokens = data.get('maxTokens', 150)
    
    # Replace with your actual Gemini API call
    genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
    model = genai.GenerativeModel('gemini-pro')
    
    try:
        response = model.generate_content(prompt)
        return jsonify({'text': response.text})
    except Exception as e:
        return jsonify({'error': 'Failed to generate insight'}), 500

if __name__ == '__main__':
    app.run(port=8080, debug=True)
```

---

## If Using FastAPI (Python)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os

app = FastAPI()

# IMPORTANT: Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GeminiRequest(BaseModel):
    prompt: str
    maxTokens: int = 150

# Health check
@app.get("/health")
def health():
    return {"status": "ok", "message": "Backend is running"}

# Calendar endpoint
@app.get("/calendar/today")
def calendar_today():
    return [
        {"title": "Team Standup", "time": "9:00 AM", "location": "Zoom"},
        {"title": "Project Review", "time": "2:00 PM", "location": "Conference Room"},
        {"title": "Gym", "time": "6:00 PM", "location": "Fitness Center"}
    ]

# Tasks endpoint
@app.get("/tasks")
def tasks():
    return [
        {"title": "Finish quarterly report", "priority": "high", "dueDate": "2025-10-05"},
        {"title": "Review pull requests", "priority": "medium", "dueDate": "2025-10-04"},
        {"title": "Update documentation", "priority": "low", "dueDate": "2025-10-06"}
    ]

# Gemini endpoint
@app.post("/gemini/generate")
async def gemini_generate(request: GeminiRequest):
    genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
    model = genai.GenerativeModel('gemini-pro')
    
    try:
        response = model.generate_content(request.prompt)
        return {"text": response.text}
    except Exception as e:
        return {"error": "Failed to generate insight"}, 500

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
```

---

## Testing Your Endpoints

### 1. Test Health Check
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{"status": "ok", "message": "Backend is running"}
```

### 2. Test Calendar
```bash
curl http://localhost:8080/calendar/today
```

Expected response:
```json
[
  {"title": "Team Standup", "time": "9:00 AM", "location": "Zoom"}
]
```

### 3. Test Gemini
```bash
curl -X POST http://localhost:8080/gemini/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello", "maxTokens": 50}'
```

Expected response:
```json
{"text": "Hello! How can I help you today?"}
```

---

## Don't Have These Yet?

**That's OK!** Your WeatherFlow app will work fine without them:

- ❌ No `/health` endpoint → App shows "Disconnected" but still works
- ❌ No `/calendar/today` → AI insights won't mention calendar events
- ❌ No `/tasks` → AI insights won't mention tasks  
- ❌ No `/gemini/generate` → Shows generic weather message instead

The app has **graceful fallbacks** for all missing endpoints!