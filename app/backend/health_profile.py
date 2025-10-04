from typing import Dict
import json
import os
from datetime import datetime

PROFILE_FILE = "user_health_profile.json"

def save_health_profile(profile_data: Dict) -> None:
    with open(PROFILE_FILE, 'w') as f:
        json.dump(profile_data, f, indent=2)

def load_health_profile() -> Dict:
    if os.path.exists(PROFILE_FILE):
        with open(PROFILE_FILE, 'r') as f:
            return json.load(f)
    return None
