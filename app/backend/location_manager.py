import json
import os
from typing import Tuple, Optional
from datetime import datetime

LOCATION_FILE = "user_location.json"

def save_user_location(lat: float, lon: float) -> None:
    location_data = {"latitude": lat, "longitude": lon, "last_updated": str(datetime.now())}
    with open(LOCATION_FILE, 'w') as f:
        json.dump(location_data, f, indent=2)

def load_user_location() -> Optional[Tuple[float, float]]:
    if os.path.exists(LOCATION_FILE):
        with open(LOCATION_FILE, 'r') as f:
            data = json.load(f)
            return (data['latitude'], data['longitude'])
    return None
