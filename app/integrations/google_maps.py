import os
import requests
from typing import Optional, Tuple

# Loads the API key from your .env file
# NOTE: We rely on load_dotenv() in webapp.py to run FIRST.
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json"

def geocode_address(address: str) -> Optional[Tuple[float, float]]:
    """
    Converts a human-readable address into (latitude, longitude).
    """
    if not GOOGLE_MAPS_API_KEY:
        print("WARNING: GOOGLE_MAPS_API_KEY not set. Cannot perform geocoding.")
        return None

    params = {
        'address': address,
        'key': GOOGLE_MAPS_API_KEY
    }

    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()

        if data['status'] == 'OK' and data['results']:
            location = data['results'][0]['geometry']['location']
            return (location['lat'], location['lng'])
        
        print(f"Geocoding failed for address '{address}'. Status: {data['status']}")
        return None

    except requests.exceptions.RequestException as e:
        print(f"Geocoding API request failed: {e}")
        return None

# --- Mock Integration for Testing ---
def get_mock_coordinates(address: str) -> Tuple[float, float]:
    """Provides mock coordinates for testing when the real API is unavailable."""
    # This ensures your program always returns a valid lat/lon for event processing
    if "gym" in address.lower():
        return (37.7749, -122.4194)  # San Francisco
    if "meeting" in address.lower():
        return (34.0522, -118.2437) # Los Angeles
    return (30.0, -90.0) # Default