import os
from typing import Dict, List
from datetime import datetime
import pandas as pd # Although we don't use it, keep if other parts of the original file needed it.

# --- TEMPORARY MOCK DATA ---
# This stable mock data ensures the app does not crash due to network errors 
# and returns predictable results (15C and Sunny).

def fetch_weather(lat: float, lon: float, target_datetime: datetime = None) -> Dict:
    """
    Returns stable, mock weather data (15C and Sunny) to ensure the app doesn't crash.
    """
    if target_datetime is None:
        target_datetime = datetime.utcnow()
        
    return {
        "temperature": 15.0,
        "precipitation": 0.0,
        "wind_speed": 4.0,
        "humidity": 65.0,
        "weather_code": 1, # Sunny/Clear
        "uv_index": 3.0,
        "timestamp": target_datetime.isoformat(),
        "location": {"lat": lat, "lon": lon},
        "condition_description": "Sunny and 15°C (Mock Data)"
    }

def fetch_weather_for_events(events_with_locations: List[Dict]) -> List[Dict]:
    """
    Returns mock weather data for multiple events.
    """
    weather_forecasts = []
    for event in events_with_locations:
        # We reuse the single fetch_weather function for mock consistency
        weather = fetch_weather(event['location'][0], event['location'][1], event['datetime'])
        
        weather_forecasts.append({
            "event_name": event['event_name'],
            "location_coords": event['location'],
            "event_time": event['datetime'].isoformat() if isinstance(event['datetime'], datetime) else event['datetime'],
            "weather": weather
        })
    return weather_forecasts