import googlemaps
from typing import Optional, Tuple
import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)

def geocode_address(address: str) -> Optional[Tuple[float, float]]:
    """
    Convert address string to (latitude, longitude) coordinates.
    Returns None if geocoding fails.
    """
    try:
        result = gmaps.geocode(address)
        if result:
            location = result[0]['geometry']['location']
            return (location['lat'], location['lng'])
        return None
    except Exception as e:
        print(f"Geocoding error for '{address}': {e}")
        return None
