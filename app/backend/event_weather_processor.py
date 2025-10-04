from typing import List, Dict, Tuple
from app.utils.geocoding import geocode_address
from app.backend.weather import fetch_weather_for_events
from datetime import datetime

def process_events_with_weather(calendar_events: List[Dict], user_location: Tuple[float, float]) -> Dict:
    """
    Process calendar events, geocode locations, fetch weather for each event.
    Returns structured data for Gemini to analyze.
    """
    events_with_weather = []
    
    for event in calendar_events:
        event_name = event['summary']
        event_time = event['datetime']
        location_address = event['location']
        
        # Determine location coordinates
        if location_address:
            # Try to geocode the event location
            coords = geocode_address(location_address)
            if coords is None:
                # Fallback to user's home location if geocoding fails
                coords = user_location
                location_status = "using_home_location"
            else:
                location_status = "event_location"
        else:
            # No location specified - use user's home location
            coords = user_location
            location_status = "using_home_location"
        
        events_with_weather.append({
            "event_name": event_name,
            "location": coords,
            "datetime": event_time,
            "location_address": location_address,
            "location_status": location_status,
            "description": event.get('description', '')
        })
    
    # Fetch weather for all events
    weather_forecasts = fetch_weather_for_events(events_with_weather)
    
    return {
        "events": events_with_weather,
        "weather_forecasts": weather_forecasts
    }
