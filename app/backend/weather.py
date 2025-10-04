import meteomatics.api as api
from datetime import datetime, timedelta
from typing import Dict, List

METEOMATICS_USER = "jose_freddie"

METEOMATICS_PASS = "z4btVV8cJhP6Ny0Oj5kH"

def fetch_weather(lat: float, lon: float, target_datetime: datetime = None) -> Dict:
    """
    Fetch weather for specific coordinates and time.
    If target_datetime is None, uses current time.
    """
    if target_datetime is None:
        target_datetime = datetime.utcnow()
    
    try:
        # Fetch weather parameters
        params = [
            "t_2m:C",              # Temperature
            "precip_1h:mm",        # Precipitation
            "wind_speed_10m:ms",   # Wind speed
            "relative_humidity_2m:p",  # Humidity
            "weather_symbol_1h:idx",   # Weather condition code
            "uv:idx"               # UV index
        ]
        
        # Query for single timestamp
        df = api.query_time_series(
            [(lat, lon)], 
            target_datetime, 
            target_datetime + timedelta(hours=1), 
            timedelta(hours=1), 
            params, 
            METEOMATICS_USER, 
            METEOMATICS_PASS
        )
        
        return {
            "temperature": float(df["t_2m:C"].values[0]),
            "precipitation": float(df["precip_1h:mm"].values[0]),
            "wind_speed": float(df["wind_speed_10m:ms"].values[0]),
            "humidity": float(df["relative_humidity_2m:p"].values[0]),
            "weather_code": int(df["weather_symbol_1h:idx"].values[0]) if "weather_symbol_1h:idx" in df else 0,
            "uv_index": float(df["uv:idx"].values[0]) if "uv:idx" in df else 0,
            "timestamp": target_datetime.isoformat(),
            "location": {"lat": lat, "lon": lon}
        }
    except Exception as e:
        print(f"Weather fetch error for ({lat}, {lon}): {e}")
        return {
            "temperature": 0,
            "precipitation": 0,
            "wind_speed": 0,
            "humidity": 0,
            "weather_code": 0,
            "uv_index": 0,
            "error": str(e)
        }

def fetch_weather_for_events(events_with_locations: List[Dict]) -> List[Dict]:
    """
    Fetch weather for multiple events with their locations and times.
    events_with_locations format: [
        {"event_name": "Dentist", "location": (lat, lon), "datetime": datetime_obj},
        ...
    ]
    """
    weather_forecasts = []
    
    for event in events_with_locations:
        lat, lon = event['location']
        event_time = event['datetime']
        weather = fetch_weather(lat, lon, event_time)
        
        weather_forecasts.append({
            "event_name": event['event_name'],
            "location_coords": event['location'],
            "event_time": event_time.isoformat(),
            "weather": weather
        })
    
    return weather_forecasts
