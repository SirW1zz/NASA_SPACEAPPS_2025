from typing import List, Dict, Tuple
# Corrected import: datetime and timedelta must be imported explicitly if used as classes
from datetime import datetime, timedelta 
from app.integrations.google_maps import geocode_address
from app.backend.weather import fetch_weather_for_events
from app.backend.location_manager import load_user_location
from app.integrations.google_maps import get_mock_coordinates

def process_events_with_weather(calendar_events: List[Dict]) -> Dict:
    """
    Process calendar events, geocode locations, fetch weather for each event.
    Returns structured data for Gemini to analyze.
    
    NOTE: Fetches user_location internally to simplify the call from webapp.py.
    """
    
    # --- FETCH USER LOCATION INTERNALLY ---
    user_location = load_user_location()
    if not user_location:
        # Fallback if user location file is empty 
        user_location = (37.7749, -122.4194) # Default to SF for stable coordinates
    # ------------------------------------

    events_to_fetch = []
    
    for event in calendar_events:
        event_name = event.get('summary', 'Unnamed Event')
        event_time = event.get('datetime', datetime.utcnow().isoformat())
        location_address = event.get('location')
        
        # Determine location coordinates
        if location_address:
            # 1. Try to geocode the event location (using Google Maps API)
            coords = geocode_address(location_address)
            if coords is None:
                # 2. Fallback: Use user's home location
                coords = user_location
                location_status = "using_home_location (Geocoding Failed)"
            else:
                location_status = "event_location (Geocoding Success)"
        else:
            # 3. No location specified - use user's home location
            coords = user_location
            location_status = "using_home_location (No Address)"
        
        
        # Ensure event_time is a datetime object for fetch_weather_for_events
        try:
            event_datetime_obj = datetime.fromisoformat(event_time)
        except ValueError:
            event_datetime_obj = datetime.utcnow() # Safe fallback

        events_to_fetch.append({
            "event_name": event_name,
            "location": coords, # (lat, lon)
            "datetime": event_datetime_obj,
            "location_address": location_address,
            "location_status": location_status,
            "description": event.get('description', '')
        })
    
    # Fetch weather for all events (This calls your Meteomatics API logic)
    weather_forecasts = fetch_weather_for_events(events_to_fetch)
    
    return {
        "events": events_to_fetch,
        "weather_forecasts": weather_forecasts
    }