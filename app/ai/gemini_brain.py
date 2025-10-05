import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from typing import Dict, List
from datetime import datetime, timedelta # <--- FINAL FIX: timedelta added here

# --- FIX: Ensure .env is loaded to get GEMINI_API_KEY ---
load_dotenv() 

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- FIX: Configure the Gemini API EXPLICITLY ---
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    # This will be printed to the terminal if the key is missing
    print("FATAL ERROR: GEMINI_API_KEY not found in environment.") 


def get_weather_advice(user_data: dict, home_weather: dict, event_weather_data: dict, tasks_list: list) -> str:
    """
    Generate ultra-smart weather advice based on user profile, current weather,
    events, and tasks using the Gemini API.
    """
    
    # 1. Check if Gemini is configured before proceeding
    if not GEMINI_API_KEY:
        # Raise an exception that the Flask app can catch to send a 500 error
        raise Exception("Gemini API Key is not configured.")
        
    # 2. Build comprehensive prompt
    prompt = f"""
You are an ultra-intelligent weather assistant AI. Analyze the user's profile, current weather conditions, 
upcoming calendar events with location-specific weather forecasts, and tasks to provide highly personalized, 
actionable advice.

**USER PROFILE:**
- Name: {user_data.get('name', 'User')}
- Health Conditions: {json.dumps(user_data.get('health', {}))}
- Temperature Preferences: {user_data.get('preferences', {}).get('temp_min', 15)}°C - {user_data.get('preferences', {}).get('temp_max', 30)}°C

**CURRENT HOME WEATHER:**
- Temperature: {home_weather.get('temperature', 'N/A')}°C
- Humidity: {home_weather.get('humidity', 'N/A')}%
- Precipitation: {home_weather.get('precipitation', 'N/A')}mm
- Wind Speed: {home_weather.get('wind_speed', 'N/A')}m/s

**UPCOMING EVENTS WITH WEATHER FORECASTS:**
{json.dumps(event_weather_data.get('weather_forecasts', []), indent=2, default=str)}

**UPCOMING TASKS:**
{json.dumps(tasks_list, indent=2)}

**YOUR INSTRUCTIONS:**
1. For EACH upcoming event, provide specific weather-based recommendations:
    - If it's raining at event location/time: suggest umbrella, raincoat, leave early for traffic
    - If temperature is extreme: suggest appropriate clothing, hydration, rescheduling
    - If high UV index: suggest sunscreen, hat, sunglasses
    - If high winds: suggest secure hairstyle, careful driving
    
2. Consider user's health conditions:
    - Allergies: warn about pollen/humidity levels
    - Asthma: alert if air quality is poor or weather is extreme
    - Any other conditions: provide relevant warnings

3. Prioritize events chronologically and give TIME-SENSITIVE advice (e.g., "In 2 hours when you go to...")

4. Be PROACTIVE and SPECIFIC. Don't just say "check weather" - tell them exactly what to do.

5. Format your response with clear sections:
    - Overall Weather Summary
    - Event-by-Event Recommendations (with event name, time, and specific actions)
    - Health Alerts
    - General Daily Advice

Be concise but thorough. Focus on actionable insights.
"""
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash') 
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        # If the API call fails, raise an exception to be caught by the Flask route
        print(f"Error generating advice from Gemini API: {str(e)}")
        raise Exception(f"Gemini API call failed: {str(e)}")