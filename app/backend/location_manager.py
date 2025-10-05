import json
import os
from typing import Tuple, Optional
from datetime import datetime

LOCATION_FILE = "user_location.json"

# Default coordinates for stable testing (New York City)
# This bypasses the network timeout issue you were having at your local location.
DEFAULT_COORDS = (40.7128, -74.0060)

def save_user_location(lat: float, lon: float) -> None:
    """Saves the user's current location to a file."""
    location_data = {"latitude": lat, "longitude": lon, "last_updated": str(datetime.now())}
    # NOTE: Saves to the project root, relying on the client side to provide absolute paths if necessary.
    with open(LOCATION_FILE, 'w') as f:
        json.dump(location_data, f, indent=2)

def load_user_location() -> Tuple[float, float]:
    """
    Loads the user's location from file, or returns a default stable location (NYC) 
    if the file is missing or empty.
    """
    try:
        if os.path.exists(LOCATION_FILE):
            with open(LOCATION_FILE, 'r') as f:
                data = json.load(f)
                return (data['latitude'], data['longitude'])
    except Exception as e:
        # File exists but is corrupt, log the error and use the default.
        print(f"Error loading location file, using default. Details: {e}")

    # Fallback to the default stable coordinates (New York City)
    return DEFAULT_COORDS